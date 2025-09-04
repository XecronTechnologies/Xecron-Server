import { supabase, DB_TABLES } from "../config/database.js";
import { RecordUsageUpdate, GetTableRecordCount, RecordLimitCheck } from "../utils/updateCount.js";

export class SupabaseService {
  static async checkRecordLimit(tableName) {
    try {
      const data = await RecordLimitCheck(tableName);
      return {
        rec_lmt: data.data.rec_lmt,
        rec_usage: data.data.rec_usage
      };
    } catch (error) {
      throw new Error(`Failed to check record limit: ${error.message}`);
    }
  }

  static async storeContact(tableName, contactData) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .insert([{ ...contactData, created_at: new Date().toISOString() }])
        .select();

      if (error) throw error;

      // Update usage count
      await this.incrementUsage(tableName);

      return data[0];
    } catch (error) {
      throw new Error(`Failed to store contact: ${error.message}`);
    }
  }

  static async incrementUsage(tableName) {
    try {
      const { data: limitData, error: fetchError } = await supabase
        .from(DB_TABLES.CLIENTS)
        .select("rec_usage")
        .eq("cl", tableName)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from(DB_TABLES.CLIENTS)
        .update({ rec_usage: (limitData?.rec_usage || 0) + 1 })
        .eq("cl", tableName);

      if (updateError) throw updateError;
    } catch (error) {
      throw new Error(`Failed to increment usage: ${error.message}`);
    }
  }

  static async addClient(tableName, clientData) {
    try {
      const { error } = await supabase
        .from(tableName)
        .insert([clientData]);

      if (error) throw error;

      const updateTable = await GetTableRecordCount(tableName);
      await RecordUsageUpdate(updateTable, tableName);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to add client: ${error.message}`);
    }
  }

  static async getClients(tableName = "customers") {
    try {
      const { data, error } = await supabase.from(tableName).select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to get clients: ${error.message}`);
    }
  }

  static async deleteClient(tableName, id) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;

      const updateTable = await GetTableRecordCount(tableName);
      await RecordUsageUpdate(updateTable, tableName);

      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }
  }
}