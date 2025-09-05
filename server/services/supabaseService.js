import { supabase } from "../config/database.js";
import { RecordUsageUpdate, GetTableRecordCount, RecordLimitCheck } from "../utils/updateCount.js";

export class SupabaseService {
  static buildReferenceFromPath(path) {
    // Supabase doesn't use path references like Firebase
    // This method maintains the same interface but handles Supabase differently
    return {
      path: path.join('/'),
      table: path[0], // First segment is table name
      id: path.length > 1 ? path[1] : null // Second segment is ID if exists
    };
  }

  // CREATE - Create new record with auto-generated ID
  static async createDocument(path, data) {
    try {
      console.log("Create document request:", { path, data });
      
      const ref = this.buildReferenceFromPath(path);
      
      // Path should point to a table (single segment)
      if (path.length !== 1) {
        throw new Error("Path must point to a table (e.g., ['users'])");
      }
      
      const { data: result, error } = await supabase
        .from(ref.table)
        .insert([{ ...data, created_at: new Date().toISOString() }])
        .select();
      
      if (error) throw error;

      // Update usage count
      await this.incrementUsage(ref.table);

      return { 
        success: true,
        message: "Record created successfully",
        table: ref.table,
        recordId: result[0].id,
        data: result[0]
      };
      
    } catch (error) {
      console.error("Error creating record:", error);
      throw new Error(`Create failed: ${error.message}`);
    }
  }

  // CREATE - Create record with specific ID
  static async createDocumentWithId(path, documentId, data) {
    try {
      console.log("Create record with ID request:", { path, documentId, data });
      
      const ref = this.buildReferenceFromPath(path);
      
      // Path should point to a table
      if (path.length !== 1) {
        throw new Error("Path must point to a table");
      }
      
      const { data: result, error } = await supabase
        .from(ref.table)
        .insert([{ id: documentId, ...data, created_at: new Date().toISOString() }])
        .select();
      
      if (error) throw error;

      await this.incrementUsage(ref.table);

      return { 
        success: true,
        message: "Record created successfully with custom ID",
        table: ref.table,
        recordId: result[0].id,
        data: result[0]
      };
      
    } catch (error) {
      console.error("Error creating record with ID:", error);
      throw new Error(`Create with ID failed: ${error.message}`);
    }
  }

  // UPDATE - Update existing record
  static async updateDocument(path, data, merge = true) {
    try {
      console.log("Update record request:", { path, data, merge });
      
      const ref = this.buildReferenceFromPath(path);
      
      // Path should point to a specific record (table + ID)
      if (path.length !== 2) {
        throw new Error("Path must point to a record (e.g., ['users', 'user123'])");
      }
      
      // Check if record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from(ref.table)
        .select('*')
        .eq('id', ref.id)
        .single();
      
      if (fetchError) throw new Error("Record not found - cannot update");
      
      const updateData = merge ? { ...existingRecord, ...data } : data;
      
      const { data: result, error: updateError } = await supabase
        .from(ref.table)
        .update(updateData)
        .eq('id', ref.id)
        .select();
      
      if (updateError) throw updateError;

      return { 
        success: true,
        message: "Record updated successfully",
        table: ref.table,
        recordId: ref.id,
        data: result[0]
      };
      
    } catch (error) {
      console.error("Error updating record:", error);
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  // DELETE - Delete record
  static async deleteDocument(path) {
    try {
      console.log("Delete record request:", { path });
      
      const ref = this.buildReferenceFromPath(path);
      
      // Path should point to a specific record
      if (path.length !== 2) {
        throw new Error("Path must point to a record");
      }
      
      // Check if record exists
      const { data: existingRecord, error: fetchError } = await supabase
        .from(ref.table)
        .select('*')
        .eq('id', ref.id)
        .single();
      
      if (fetchError) throw new Error("Record not found - cannot delete");
      
      const { error: deleteError } = await supabase
        .from(ref.table)
        .delete()
        .eq('id', ref.id);
      
      if (deleteError) throw deleteError;

      // Update usage count
      const updateTable = await GetTableRecordCount(ref.table);
      await RecordUsageUpdate(updateTable, ref.table);

      return { 
        success: true,
        message: "Record deleted successfully",
        table: ref.table,
        recordId: ref.id,
        deletedData: existingRecord
      };
      
    } catch (error) {
      console.error("Error deleting record:", error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // READ - Get record data
  static async getDocument(path) {
    try {
      const ref = this.buildReferenceFromPath(path);
      
      if (path.length !== 2) {
        throw new Error("Path must point to a record");
      }
      
      const { data, error } = await supabase
        .from(ref.table)
        .select('*')
        .eq('id', ref.id)
        .single();
      
      if (error) throw new Error("Record not found");
      
      return { 
        success: true,
        data: data,
        table: ref.table,
        recordId: ref.id
      };
      
    } catch (error) {
      console.error("Error in getDocument:", error);
      throw new Error(error.message);
    }
  }

  // LIST - List records or tables
  static async listSubcollections(path) {
    try {
      const ref = this.buildReferenceFromPath(path);
      
      if (path.length === 0) {
        // List all tables (Supabase doesn't have this directly)
        // This would require a different approach, maybe from information_schema
        throw new Error("Listing all tables not implemented");
      } 
      else if (path.length === 1) {
        // List all records in a table
        const { data, error } = await supabase
          .from(ref.table)
          .select('*');
        
        if (error) throw error;
        
        return { 
          success: true,
          items: data,
          type: 'records',
          table: ref.table,
          count: data.length
        };
      } 
      else {
        throw new Error("Path too deep for Supabase");
      }
      
    } catch (error) {
      console.error("Error in listSubcollections:", error);
      throw new Error(error.message);
    }
  }

  // Helper method for usage tracking
  static async incrementUsage(tableName) {
    try {
      const updateTable = await GetTableRecordCount(tableName);
      await RecordUsageUpdate(updateTable, tableName);
    } catch (error) {
      console.error("Error incrementing usage:", error);
      // Don't throw here as it shouldn't fail the main operation
    }
  }
}