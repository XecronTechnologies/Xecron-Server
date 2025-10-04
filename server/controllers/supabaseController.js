import { SupabaseService } from "../services/supabaseService.js";

export const supabaseController = {
  
  // Get all data from a table
  getTableData: async (req, res) => {
    try {
      const { table } = req.query;
      
      if (!table) {
        return res.status(400).json({
          success: false,
          error: "Table name is required"
        });
      }
      
      const result = await SupabaseService.getTableData(table);
      res.status(200).json(result);
      
    } catch (error) {
      console.error("Controller error in getTableData:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get single record by ID
  getRecordById: async (req, res) => {
    try {
      const { table, cl_unique_id } = req.query;
      
      if (!table || !cl_unique_id) {
        return res.status(400).json({
          success: false,
          error: "Table name and ID are required"
        });
      }
      
      const result = await SupabaseService.getRecordById(table, cl_unique_id);
      res.status(200).json(result);
      
    } catch (error) {
      console.error("Controller error in getRecordById:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  //Create Row
  createTableData: async (req, res) => {
    try {
      const { table, row_body } = req.body;
      
      if (!table || !row_body) {
        return res.status(400).json({
          success: false,
          error: "Table name and ID are required"
        });
      }
      
      const result = await SupabaseService.createTableData(table,row_body);
      res.status(200).json(result);
      
    } catch (error) {
      console.error("Controller error in createTableData:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  updateTableData: async (req, res) => {
    try {
      console.log("update controller supabase hitted");

      const { table, row_body } = req.body;
      
      if (!table || !row_body) {
        return res.status(400).json({
          success: false,
          error: "Table name and ID are required"
        });
      }
      
      const result = await SupabaseService.updateTableData(table,row_body);
      res.status(200).json(result);
      
    } catch (error) {
      console.error("Controller error in updateTableData:", error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Health check
  healthCheck: async (req, res) => {
    try {
      const result = await SupabaseService.healthCheck();
      res.status(200).json({
        ...result,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};