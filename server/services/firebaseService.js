// firebaseService.js
import admin from "firebase-admin";
import { SupabaseService } from "./supabaseService.js";

export class FirebaseService {

  // Initialize Firebase only once
  static async initialize() {
    if (!admin.apps.length) {
      try {
        // Fetch service account JSON from Supabase
        const { success, data } = await SupabaseService.getTableData('firebase_service_account');
let temp_data = await SupabaseService.getTableData('firebase_service_account');
        console.log("temp_data",temp_data)
        // if (!success || !data || data.length === 0) {
        //   throw new Error("No Firebase service account found in Supabase");
        // }

        // Assume first row contains the JSON in 'json' column
        const serviceAccount = JSON.parse(data[0].json);

        // Fix line breaks in private_key if stored with \n
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });

        console.log("Firebase initialized successfully from Supabase");
      } catch (error) {
        console.error("Firebase initialization failed:", error);
        throw error;
      }
    }

    return admin.firestore();
  }

  // Build Firestore reference from path array
  static async buildReferenceFromPath(path) {
    const db = await this.initialize();
    let ref = db;

    for (let i = 0; i < path.length; i++) {
      if (i % 2 === 0) {
        ref = ref.collection(path[i]);
      } else {
        ref = ref.doc(path[i]);
      }
    }

    return ref;
  }

  // READ - single document
  static async getDocument(path) {
    const ref = await this.buildReferenceFromPath(path);
    if (ref.constructor.name !== "DocumentReference") {
      throw new Error("Path must point to a document");
    }

    const doc = await ref.get();
    if (!doc.exists) {
      return { success: false, message: "Document not found", path: ref.path };
    }

    return {
      success: true,
      documentId: ref.id,
      path: ref.path,
      data: doc.data(),
    };
  }

  // CREATE document with auto ID
  static async createDocument(path, data) {
    const ref = await this.buildReferenceFromPath(path);
    if (ref.constructor.name !== "CollectionReference") {
      throw new Error("Path must point to a collection to create a document");
    }

    const newDocRef = ref.doc();
    await newDocRef.set(data);

    return {
      success: true,
      message: "Document created successfully",
      path: newDocRef.path,
      documentId: newDocRef.id,
      data,
    };
  }

  // UPDATE document
  static async updateDocument(path, data, merge = true) {
    const ref = await this.buildReferenceFromPath(path);
    if (ref.constructor.name !== "DocumentReference") {
      throw new Error("Path must point to a document");
    }

    const doc = await ref.get();
    if (!doc.exists) {
      throw new Error("Document not found");
    }

    await ref.set(data, { merge });

    const updatedDoc = await ref.get();
    return {
      success: true,
      message: "Document updated successfully",
      documentId: ref.id,
      path: ref.path,
      data: updatedDoc.data(),
    };
  }

  // DELETE document
  static async deleteDocument(path) {
    const ref = await this.buildReferenceFromPath(path);
    if (ref.constructor.name !== "DocumentReference") {
      throw new Error("Path must point to a document");
    }

    const doc = await ref.get();
    if (!doc.exists) {
      throw new Error("Document not found");
    }

    await ref.delete();
    return {
      success: true,
      message: "Document deleted successfully",
      documentId: ref.id,
      path: ref.path,
      deletedData: doc.data(),
    };
  }

  // LIST subcollections/documents
  static async listSubcollections(path) {
    const ref = await this.buildReferenceFromPath(path);

    if (ref.constructor.name === "CollectionReference") {
      const snapshot = await ref.get();
      const documents = snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
      return { success: true, type: "documents", path: ref.path, count: documents.length, items: documents };
    } else if (ref.constructor.name === "DocumentReference") {
      const collections = await ref.listCollections();
      const collectionNames = collections.map((c) => c.id);
      return { success: true, type: "collections", path: ref.path, count: collectionNames.length, items: collectionNames };
    } else {
      throw new Error("Unknown reference type");
    }
  }
}
