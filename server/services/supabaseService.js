import { supabase } from "../config/database.js";

export class SupabaseService {
  
  // GET all records from a table
  static async getTableData(tableName) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
      
      if (error) throw error;
      
      return {
        success: true,
        data: data,
        table: tableName,
        count: data.length
      };
      
    } catch (error) {
      console.error("Error getting table data:", error);
      throw new Error(`Failed to get data from ${tableName}: ${error.message}`);
    }
  }

  // GET single record by ID
  static async getRecordById(tableName, cl_unique_id) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('cl_unique_id', cl_unique_id)
        .single();
      
      if (error) throw error;
      
      return {
        success: true,
        data: data,
        table: tableName,
        cl_unique_id: cl_unique_id
      };
      
    } catch (error) {
      console.error("Error getting record:", error);
      throw new Error(`Failed to get record from ${tableName}: ${error.message}`);
    }
  }

  static async createTableData(tableName,row_body) {
    try {
      const { data, error } = await supabase
      .from(tableName)
      .insert(row_body)
      .select();
      
      if (error) throw error;
      
      return {
        success: true,
        data: data,
        table: tableName,
        count: data.length
      };
      
    } catch (error) {
      console.error("Error creating table data:", error);
      throw new Error(`Failed to create data from ${tableName}: ${error.message}`);
    }
  }

static async updateTableData(tableName, row_body) {
  try {
    console.log("update service supabase hitted");
    
    // First get the current values
    const { data: currentData, error: fetchError } = await supabase
      .from(tableName)
      .select('token_used, token_allocated, non_exp_token')
      .eq("cl_unique_id", row_body.cl_unique_id)
      .single();

    if (fetchError) throw fetchError;
    if (!currentData) throw new Error("Record not found");

    // Check if BOTH are exhausted
    if (currentData.token_allocated <= 0 && currentData.non_exp_token <= 0) {
      return {
        success: false,
        reason: `Both token_allocated (${currentData.token_allocated}) and non_exp_token (${currentData.non_exp_token}) are exhausted`,
        solution: 'Recharge any plan to start the service'
      };
    }

    // Calculate new values - use non_exp_token if token_allocated is exhausted
    let updateData = {};
    
    if (currentData.token_allocated > 0) {
      // Use token_allocated (normal case)
      updateData = {
        token_used: currentData.token_used + 1,
        token_allocated: currentData.token_allocated - 1
      };
    } else {
      // Use non_exp_token since token_allocated is exhausted
      updateData = {
        token_used: currentData.token_used + 1,
        non_exp_token: currentData.non_exp_token - 1
      };
    }

    // Update with new values
    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq("cl_unique_id", row_body.cl_unique_id)
      .select();

    if (error) throw error;
    console.log("data.length",data.length)
    return {
      success: true,
      data: data,
      table: tableName,
      updatedCount: data ? data.length : 0
    };
    
  } catch (error) {
    console.error("Error incrementing token usage:", error);
    throw new Error(`Failed to increment token usage: ${error.message}`);
  }
}

  // Health check
  static async healthCheck() {
    try {
      // Simple query to check connection
      const { error } = await supabase
        .from('client_tokens')
        .select('count')
        .limit(1);
      
      return {
        success: !error,
        status: error ? 'Disconnected' : 'Connected',
        service: 'Supabase PostgreSQL'
      };
      
    } catch (error) {
      return {
        success: false,
        status: 'Error',
        error: error.message
      };
    }
  }
}