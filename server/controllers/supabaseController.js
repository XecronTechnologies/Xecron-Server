import { SupabaseService } from "../services/supabaseService.js";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../config/constants.js";

export const supabaseController = {
  // CREATE - New record with auto ID
  createDocument: async (req, res) => {
    try {
      console.log("Create document request:", req.body);
      
      const { path, data } = req.body;
      
      if (!path || !Array.isArray(path)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must be an array" 
        });
      }
      
      if (!data || typeof data !== "object") {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Data must be an object" 
        });
      }
      
      // Path should point to a table (single segment)
      if (path.length !== 1) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a table (e.g., ['users'])" 
        });
      }
      
      const result = await SupabaseService.createDocument(path, data);
      res.status(STATUS_CODES.CREATED).json(result);
    } catch (error) {
      console.error("Controller error in createDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // CREATE - New record (removed documentId parameter)
  createDocumentWithId: async (req, res) => {
    try {
      console.log("Create record request:", req.body);
      
      const { path, data } = req.body;
      
      if (!path || !Array.isArray(path)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must be an array" 
        });
      }
      
      if (!data || typeof data !== "object") {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Data must be an object" 
        });
      }
      
      // Path should point to a table
      if (path.length !== 1) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a table" 
        });
      }
      
      const result = await SupabaseService.createDocumentWithId(path, data);
      res.status(STATUS_CODES.CREATED).json(result);
    } catch (error) {
      console.error("Controller error in createDocumentWithId:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // UPDATE - Existing record
  updateDocument: async (req, res) => {
    try {
      console.log("Update document request:", req.body);
      
      const { path, data, merge } = req.body;
      
      if (!path || !Array.isArray(path)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must be an array" 
        });
      }
      
      if (!data || typeof data !== "object") {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Data must be an object" 
        });
      }
      
      // Path should point to a specific record (table + ID)
      if (path.length !== 2) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a record (e.g., ['users', '1'])" 
        });
      }
      
      const result = await SupabaseService.updateDocument(path, data, merge !== false);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in updateDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // DELETE - Record
  deleteDocument: async (req, res) => {
    try {
      console.log("Delete document request:", req.body);
      
      const { path } = req.body;
      
      if (!path || !Array.isArray(path)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must be an array" 
        });
      }
      
      // Path should point to a specific record
      if (path.length !== 2) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a record" 
        });
      }
      
      const result = await SupabaseService.deleteDocument(  path);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in deleteDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // LIST - List records in a table
  listSubcollections: async (req, res) => {
    try {
      console.log("ListSubcollections request body:", req.body);
      
      const { path } = req.body;
      
      if (!path) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path parameter is required" 
        });
      }
      
      if (!Array.isArray(path)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must be an array" 
        });
      }
      
      // Path should point to a table
      if (path.length !== 1) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a table" 
        });
      }
      
      const result = await SupabaseService.listSubcollections(path);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in listSubcollections:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // GET - Get specific record
  getDocument: async (req, res) => {
    try {
      console.log("GetDocument request body:", req.body);
      
      const { path } = req.body;
      
      if (!path || !Array.isArray(path)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must be an array" 
        });
      }
      
      // Path should point to a specific record
      if (path.length !== 2) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a record" 
        });
      }
      
      const result = await SupabaseService.getDocument(path);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in getDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // Health check
  healthCheck: (req, res) => {
    console.log("first")
    res.status(STATUS_CODES.SUCCESS).json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      service: "Supabase PostgreSQL" 
    });
  },

  // Test endpoint
  testEndpoint: (req, res) => {
    res.status(STATUS_CODES.SUCCESS).json({ 
      success: true, 
      message: "Supabase controller is working!",
      timestamp: new Date().toISOString()
    });
  }
};