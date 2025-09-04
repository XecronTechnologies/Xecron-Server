import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export class FirebaseService {
  static buildReferenceFromPath(path) {
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

  // CREATE - Create new document with auto-generated ID
  static async createDocument(path, data) {
    try {
      console.log("Create document request:", { path, data });
      
      const ref = this.buildReferenceFromPath(path);
      
      // Ensure we're at collection level (path should end with collection)
      if (ref.constructor.name !== 'CollectionReference') {
        throw new Error("Path must point to a collection to create new document");
      }
      
      // Create new document with auto-generated ID
      const newDocRef = ref.doc();
      await newDocRef.set(data);
      
      return { 
        success: true,
        message: "Document created successfully",
        path: newDocRef.path,
        documentId: newDocRef.id,
        data: data
      };
      
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error(`Create failed: ${error.message}`);
    }
  }

  // CREATE - Create document with specific ID
  static async createDocumentWithId(path, documentId, data) {
    try {
      console.log("Create document with ID request:", { path, documentId, data });
      
      let ref = this.buildReferenceFromPath(path);
      
      // Ensure we're at collection level
      if (ref.constructor.name !== 'CollectionReference') {
        throw new Error("Path must point to a collection to create new document");
      }
      
      // Create document with specific ID
      const docRef = ref.doc(documentId);
      await docRef.set(data);
      
      return { 
        success: true,
        message: "Document created successfully with custom ID",
        path: docRef.path,
        documentId: docRef.id,
        data: data
      };
      
    } catch (error) {
      console.error("Error creating document with ID:", error);
      throw new Error(`Create with ID failed: ${error.message}`);
    }
  }

  // UPDATE - Update existing document (merge with existing data)
  static async updateDocument(path, data, merge = true) {
    try {
      console.log("Update document request:", { path, data, merge });
      
      const ref = this.buildReferenceFromPath(path);
      
      // Ensure we're at document level
      if (ref.constructor.name !== 'DocumentReference') {
        throw new Error("Path must point to a document to update");
      }
      
      // Check if document exists
      const doc = await ref.get();
      if (!doc.exists) {
        throw new Error("Document not found - cannot update");
      }
      
      // Update document with merge option
      await ref.set(data, { merge });
      
      // Get updated document
      const updatedDoc = await ref.get();
      
      return { 
        success: true,
        message: `Document ${merge ? 'updated' : 'replaced'} successfully`,
        path: ref.path,
        documentId: ref.id,
        data: updatedDoc.data()
      };
      
    } catch (error) {
      console.error("Error updating document:", error);
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  // DELETE - Delete document
  static async deleteDocument(path) {
    try {
      console.log("Delete document request:", { path });
      
      const ref = this.buildReferenceFromPath(path);
      
      // Ensure we're at document level
      if (ref.constructor.name !== 'DocumentReference') {
        throw new Error("Path must point to a document to delete");
      }
      
      // Check if document exists
      const doc = await ref.get();
      if (!doc.exists) {
        throw new Error("Document not found - cannot delete");
      }
      
      // Delete the document
      await ref.delete();
      
      return { 
        success: true,
        message: "Document deleted successfully",
        path: ref.path,
        documentId: ref.id,
        deletedData: doc.data()
      };
      
    } catch (error) {
      console.error("Error deleting document:", error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // READ - Get document data (already exists, keeping for completeness)
  static async getDocument(path) {
    try {
      const ref = this.buildReferenceFromPath(path);
      
      if (ref.constructor.name !== 'DocumentReference') {
        throw new Error("Path must point to a document");
      }
      
      const doc = await ref.get();
      
      if (!doc.exists) {
        throw new Error("Document not found");
      }
      
      return { 
        success: true,
        data: doc.data(),
        path: ref.path,
        documentId: ref.id
      };
      
    } catch (error) {
      console.error("Error in getDocument:", error);
      throw new Error(error.message);
    }
  }

  // LIST - List collections/documents (already exists, keeping for completeness)
  static async listSubcollections(path) {
    try {
      const ref = this.buildReferenceFromPath(path);
      
      if (ref.constructor.name === 'CollectionReference') {
        const snapshot = await ref.get();
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        
        return { 
          success: true,
          items: documents,
          type: 'documents',
          path: ref.path,
          count: documents.length
        };
      } 
      else if (ref.constructor.name === 'DocumentReference') {
        const collections = await ref.listCollections();
        const collectionNames = collections.map(col => col.id);
        
        return { 
          success: true,
          items: collectionNames,
          type: 'collections',
          path: ref.path,
          count: collectionNames.length
        };
      } else {
        throw new Error("Unknown reference type");
      }
      
    } catch (error) {
      console.error("Error in listSubcollections:", error);
      throw new Error(error.message);
    }
  }
}