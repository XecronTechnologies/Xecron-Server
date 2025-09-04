import { FirebaseService } from "../services/firebaseService.js";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../config/constants.js";

export const firebaseController = {
  // CREATE - New document with auto ID
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
      
      // Path should end with collection (odd number of segments)
      if (path.length % 2 !== 1) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a collection (e.g., ['users'])" 
        });
      }
      
      const result = await FirebaseService.createDocument(path, data);
      res.status(STATUS_CODES.CREATED).json(result);
    } catch (error) {
      console.error("Controller error in createDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // CREATE - New document with specific ID
  createDocumentWithId: async (req, res) => {
    try {
      console.log("Create document with ID request:", req.body);
      
      const { path, documentId, data } = req.body;
      
      if (!path || !Array.isArray(path)) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must be an array" 
        });
      }
      
      if (!documentId || typeof documentId !== 'string') {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Document ID is required and must be a string" 
        });
      }
      
      if (!data || typeof data !== "object") {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Data must be an object" 
        });
      }
      
      // Path should end with collection (odd number of segments)
      if (path.length % 2 !== 1) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a collection" 
        });
      }
      
      const result = await FirebaseService.createDocumentWithId(path, documentId, data);
      res.status(STATUS_CODES.CREATED).json(result);
    } catch (error) {
      console.error("Controller error in createDocumentWithId:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // UPDATE - Existing document
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
      
      // Path should end with document (even number of segments)
      if (path.length % 2 !== 0) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a document (e.g., ['users', 'user123'])" 
        });
      }
      
      const result = await FirebaseService.updateDocument(path, data, merge !== false);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in updateDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  // DELETE - Document
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
      
      // Path should end with document (even number of segments)
      if (path.length % 2 !== 0) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ 
          success: false,
          error: "Path must point to a document" 
        });
      }
      
      const result = await FirebaseService.deleteDocument(path);
      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in deleteDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

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
      
      const result = await FirebaseService.listSubcollections(path);

      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in listSubcollections:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

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
      
      const result = await FirebaseService.getDocument(path);

      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in getDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  saveDocument: async (req, res) => {
    try {
      console.log("SaveDocument request body:", req.body);
      
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
      
      const result = await FirebaseService.saveDocument(path, data);

      res.status(STATUS_CODES.SUCCESS).json(result);
    } catch (error) {
      console.error("Controller error in saveDocument:", error);
      res.status(STATUS_CODES.INTERNAL_ERROR).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  healthCheck: (req, res) => {
    res.status(STATUS_CODES.SUCCESS).json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      service: "Firebase Firestore" 
    });
  },

  // Test endpoint
  testEndpoint: (req, res) => {
    res.status(STATUS_CODES.SUCCESS).json({ 
      success: true, 
      message: "Firebase controller is working!",
      timestamp: new Date().toISOString()
    });
  }
};