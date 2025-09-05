import express from "express";
import { firebaseController } from "../controllers/firebaseController.js";
import { validateFirebasePath, validateDocumentData } from "../middleware/validation.js";

const router = express.Router();

// CREATE operations
router.post("/create", validateFirebasePath, validateDocumentData, firebaseController.createDocument);
router.post("/create-with-id", validateFirebasePath, firebaseController.createDocumentWithId);

// UPDATE operations
router.put("/update", validateFirebasePath, validateDocumentData, firebaseController.updateDocument);
router.patch("/update", validateFirebasePath, validateDocumentData, firebaseController.updateDocument);

// DELETE operations
router.delete("/delete", validateFirebasePath, firebaseController.deleteDocument);

// READ operations (existing)
router.post("/list", validateFirebasePath, firebaseController.listSubcollections);
router.post("/get", validateFirebasePath, firebaseController.getDocument);
router.get("/health", firebaseController.healthCheck);
router.get("/test", firebaseController.testEndpoint);

export default router;  