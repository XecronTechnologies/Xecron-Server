import express from "express";
import { supabaseController } from "../controllers/supabaseController.js";
import { validateSupabasePath, validateDocumentData } from "../middleware/validation.js";

const router = express.Router();

// CREATE operations (both now work the same way since no custom IDs)
router.post("/create", validateSupabasePath, validateDocumentData, supabaseController.createDocument);
router.post("/create-with-id", validateSupabasePath, validateDocumentData, supabaseController.createDocumentWithId);

// UPDATE operations
router.put("/update", validateSupabasePath, validateDocumentData, supabaseController.updateDocument);
router.patch("/update", validateSupabasePath, validateDocumentData, supabaseController.updateDocument);

// DELETE operations
router.delete("/delete", validateSupabasePath, supabaseController.deleteDocument);

// READ operations
router.post("/list", validateSupabasePath, supabaseController.listSubcollections);
router.post("/get", validateSupabasePath, supabaseController.getDocument);
router.get("/health", supabaseController.healthCheck);
router.get("/test", supabaseController.testEndpoint);

export default router;