import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase only once
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// const db = admin.firestore();

export class FirebaseService {
  static buildReferenceFromPath(path) {
    let serviceAccount = {
  "type": "service_account",
  "project_id": "learning-23088",
  "private_key_id": "6fcc700acaf192296f4f3812e32c990c0aed3546",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDClrM04BUhklI6\nHpU7gPpqTGUByXsJmCTX0WCWk318S7PAz510EXJ1XSwiAWrdQvUBoAiCUVKQiWtP\nQuWcjX3T+pEhRjY7bgH+l0ldINoJAJK3z5s/mtvdj68iW24/oda1A7lhll851kla\nPYDnLTj2KLNvhSK/xCOLSXDmGFS6fqnILAO9wqOXuz9R6Qs68haz6gGAPKQotZYf\noyp4EURQPJ1xZuCZ2djtypCR+yuH5uSIe/eKwmiRgZl9zS1gn51BXhAb+pIpw6NZ\nWTuiOgBsp9NX936E4mCnjEYIxmyLV5Ne3nxfVQiSeeVZUK6sTBzbWZfMkwpDLB7B\nG5ugIJQXAgMBAAECggEAFFyD41wwpIhUwFjOPCFn5/2XHX5sDc9KHlHTbeOAYE7k\n6p+5lcP0RSGlv5KEZc4Jfc0KzDrJjURD4qcDsxj/JKegeL80Z42VpIKcyPjqDRfD\n7SX1Kc0A2rNGm9gTYOcvZKuUwghjwyqQFw2T0nI3S/1q9pgTexuBWKQrrc1ioveg\nAwmaZ6tXyZ8oakmIs/i9DwzaYG08Lg5c57wPQ/kFLlD3nouvZbUTIv29Vomdrc2Z\nC1PTBsdg+ZlV6gEqkq3R4HQcJzvUF5gGdz4r6NrOQ465ublrzDG8J7PSylfJ1iYg\nuc9PRr4TsbZZnLNL0Z8agfZc3WRORYipRvBmqDy9kQKBgQDhIxzWtNp7WPvKmL8T\nqyDqbROXy2g/nOmn1aiFIIQu8z0mpKqIrELgQpM1UbP/IXqTiUxLEVVfsX8KOKDJ\nHJzh+yd/lHGyLxulTmWM5QRGprBizWaTn/1IDymW7R+PBu++LpFOSSKRAChS/cgo\nk9LRm3e61M/UcFfPBVOrlvDtSQKBgQDdQ4dzXiEbQWNPfPoFymwBl0m8WHnhiuSS\nBE8srR1F3i5ENdJ1KwfQlfrU2dt6t1uSueSwPz/5ONHvq3GH8mqdLPptaduMvcQM\n2lxze3G2GfK2hOYZQq/ADlAzEKexO6/pAEStiyC+YgYW/am6grtQdf3OJPNw/GSj\nXmRkbvJWXwKBgQDGrqIIqNoW+NRcWqhlxyPpPhGIaC271dIuF1P9CFEezfItZCxL\nKRprptUavNvIT9dI1GXL6aQaKx4d+xOJ6AJbO7YD1RDxWrlfDOx5hrJbV0daKkJY\nDV0MdrURSHoNUuXIRHhfShODO0xa0TQO+0WVTUpASwaOSAZ14BGS4EYGYQKBgCMT\nMmSqdksQyYJvSF8koIx8BBdUWzXSw7sV7csiQjKyLtlnQs6KHLoHHHUjd/RzHpQa\n3dLGpAiI5la88clgN2BlIem4TzJ3Xp2++8retb7tTBl85dD5Tkz+t93wdPTWhmNE\nRJ7SIEWt2lNIsOA9Gx59JdfI6cJucDGpo/Z70/S3AoGAceYC77KPZMYeOQKuVBf9\nt74s0ab5/ZXuDWAubheepyIj4zzd9oFmdLUWPfoV7zo23rnaEvBPOpukF24CafSC\nRR5GiRIyRut6PBzAVwbbMwB7f7b4+N6q7qYD6aquzeISFF3rY9EYEqjQqnJ3PIv5\n1XgNg8vpuHLtsgAHW+tqNME=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@learning-23088.iam.gserviceaccount.com",
  "client_id": "106187795167305743425",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40learning-23088.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
 if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
  const db = admin.firestore();

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