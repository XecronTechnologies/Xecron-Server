import admin from "firebase-admin";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account JSON
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, "serviceAccountKey.json");
  const serviceAccountFile = await readFile(serviceAccountPath, "utf8");
  serviceAccount = JSON.parse(serviceAccountFile);
} catch (error) {
  console.error("Error loading service account:", error);
  throw new Error("Failed to load Firebase service account credentials");
}

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Helper function to build Firestore reference from path array
function buildReferenceFromPath(path) {
  let ref = db;
  
  for (let i = 0; i < path.length; i++) {
    if (i % 2 === 0) {
      // Even index: collection
      ref = ref.collection(path[i]);
    } else {
      // Odd index: document
      ref = ref.doc(path[i]);
    }
  }
  
  return ref;
}

// List collections or documents endpoint
export async function listSubcollections(req, res) {
  try {
    console.log("Request body:", req.body);
    
    const { path } = req.body;
    
    if (!path) {
      return res.status(400).json({ error: "Path parameter is required" });
    }
    
    if (!Array.isArray(path)) {
      return res.status(400).json({ error: "Path must be an array" });
    }
    
    const ref = buildReferenceFromPath(path);
    
    console.log("Final reference path:", ref.path);
    console.log("Reference type:", ref.constructor.name);
    
    // If we're at a collection level, list documents
    if (ref.constructor.name === 'CollectionReference') {
      const snapshot = await ref.get();
      const documents = [];
      
      snapshot.forEach(doc => {
        documents.push(doc.id);
      });
      
      return res.json({ 
        success: true,
        items: documents,
        type: 'documents',
        path: ref.path
      });
    } 
    // If we're at a document level, list subcollections
    else if (ref.constructor.name === 'DocumentReference') {
      const collections = await ref.listCollections();
      const collectionNames = collections.map(col => col.id);
      
      return res.json({ 
        success: true,
        items: collectionNames,
        type: 'collections',
        path: ref.path
      });
    } else {
      throw new Error("Unknown reference type");
    }
    
  } catch (error) {
    console.error("Error in listSubcollections:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

// Get document data endpoint
export async function getDocument(req, res) {
  try {
    const { path } = req.body;
    
    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ error: "Path must be an array" });
    }
    
    const ref = buildReferenceFromPath(path);
    
    // Check if the final reference is a DocumentReference
    if (ref.constructor.name !== 'DocumentReference') {
      return res.status(400).json({ 
        error: "Path must point to a document" 
      });
    }
    
    const doc = await ref.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: "Document not found" });
    }
    
    res.json({ 
      success: true,
      data: doc.data(),
      path: ref.path
    });
    
  } catch (error) {
    console.error("Error in getDocument:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

// Save document endpoint
export async function saveDocument(req, res) {
  try {
    console.log("Save request body:", req.body);
    
    const { path, data } = req.body;
    
    if (!path || !Array.isArray(path)) {
      return res.status(400).json({ error: "Path must be an array" });
    }
    
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Data must be an object" });
    }
    
    const ref = buildReferenceFromPath(path);
    
    console.log("Saving to path:", ref.path);
    console.log("Reference type:", ref.constructor.name);
    
    // Check if the final reference is a DocumentReference (needed for set())
    if (ref.constructor.name !== 'DocumentReference') {
      return res.status(400).json({ 
        error: "Final path must point to a document, not a collection" 
      });
    }
    
    await ref.set(data, { merge: true });
    
    res.json({ 
      success: true,
      message: "Document saved successfully",
      path: ref.path
    });
    
  } catch (error) {
    console.error("Error in save:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
}

// Simple health check endpoint
export function healthCheck(req, res) {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
}

// Handle undefined routes
export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

// Error handling middleware
export function errorHandler(error, req, res, next) {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
}

// Export all functions as a named object
export const firebaseAPI = {
  listSubcollections,
  getDocument,
  saveDocument,
  healthCheck,
  notFound,
  errorHandler,
  buildReferenceFromPath
};

// Default export for convenience
export default firebaseAPI;