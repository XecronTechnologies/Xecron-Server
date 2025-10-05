// firebaseService.js
import admin from "firebase-admin";
import { SupabaseService } from "./supabaseService.js";
import { generateId } from "../utils/idGenerator.js";

export class FirebaseService {

  // Initialize Firebase only once
  static async initialize(ser_acc_id) {
    if (!admin.apps.length) {
      try {
        // Fetch service account JSON from Supabase
        const { success, data } = await SupabaseService.getRecordById('firebase_service_account',ser_acc_id);
let temp_data = await SupabaseService.getRecordById('firebase_service_account',ser_acc_id)
        console.log("temp_data",temp_data)
        // if (!success || !data || data.length === 0) {
        //   throw new Error("No Firebase service account found in Supabase");
        // }
        const serviceAccount = JSON.parse(data.json);

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
  static async buildReferenceFromPath(path,ser_acc_id) {
    const db = await this.initialize(ser_acc_id);
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

  // CREATE - Create new document with auto-generated ID
  static async createDocument(path, data,ser_acc_id) {
    try {
      console.log("Create document request:", { path, data });
      
      const ref = await this.buildReferenceFromPath(path,ser_acc_id);
    
      if (ref.constructor.name !== 'CollectionReference') {
        throw new Error("Path must point to a collection to create new document");
      }
      
      // Create new document with auto-generated ID
      // const newDocRef = ref.doc();

      // await newDocRef.set(data);
      const customId = generateId();
      console.log("Generated custom ID:", customId);
      
      // Create document with our custom ID
      // const docRef = ref.doc(customId);
      const newDocRef = ref.doc(customId);

      await newDocRef.set({
        ...data,
        id: customId, // Also store the ID in the document data if needed
        created_at: new Date().toISOString()
      });

    
      
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

  // READ - Get all documents in a collection
static async getAllDocumentsInCollection(path,ser_acc_id) {
  try {
    console.log("Get all documents in collection request:", { path });
    
    const ref = await this.buildReferenceFromPath(path,ser_acc_id);
    
    // Ensure we're at collection level
    // if (ref.constructor.name !== 'CollectionReference') {
    //   throw new Error("Path must point to a collection to get all documents");
    // }
    
    // Get all documents in the collection
    const snapshot = await ref.get();
    
    if (snapshot.empty) {
      return { 
        success: true,
        message: "Collection is empty",
        documents: [],
        path: ref.path,
        count: 0
      };
    }
    
    const documents = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
      path: doc.ref.path
    }));
    
    return { 
      success: true,
      message: "Documents retrieved successfully",
      documents: documents,
      path: ref.path,
      count: documents.length
    };
    
  } catch (error) {
    console.error("Error getting all documents in collection:", error);
    throw new Error(`Get all documents failed: ${error.message}`);
  }
}

  // CREATE - Create document with specific ID
  static async createDocumentWithId(path, documentId, data,ser_acc_id) {
    try {
      console.log("Create document with ID request:", { path, documentId, data });
      
      let ref = await this.buildReferenceFromPath(path,ser_acc_id);
      
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
  static async updateDocument(path, data, merge = true,row_body,ser_acc_id) {
    try {
      console.log("updateDocument+row_body",row_body)
      const supa_resp = await fetch("http://localhost:3000/api/supabase/updaterow",{
        method:"PUT",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify(row_body)
      })
      const supa_respdata = await supa_resp.json()
      console.log("supa_respdata",supa_respdata)

      if(!supa_respdata.success) return {
        status:false,
        reason : supa_respdata.reason,
        solution:supa_respdata.solution
      }

      // const supa_resp_usage = await fetch(`http://localhost:3000/api/supabase/record?table=${row_body.table}&cl_unique_id=${row_body.cl_unique_id}`,{
      //   method:"GET",
      // })
      // console.log("supa_resp_usage",supa_resp_usage)

      // const supa_respdata_usage = await supa_resp_usage.json()


      console.log("supabase from firebase")
      console.log("Update document request:", { path, data, merge });
      
      const ref = await this.buildReferenceFromPath(path,ser_acc_id);
      // console.log("ref",ref)
      
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
        // path: ref.path,
        documentId: ref.id,
        data: updatedDoc.data(),
        supabase_usage: supa_respdata
      };
      
    } catch (error) {
      console.error("Error updating document:", error);
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  // DELETE - Delete document
  static async deleteDocument(path,ser_acc_id) {
    try {
      console.log("Delete document request:", { path });
      
      const ref = await this.buildReferenceFromPath(path,ser_acc_id);
      
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
  static async getDocument(path,ser_acc_id) {
    try {
      const ref = await this.buildReferenceFromPath(path,ser_acc_id);
      
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
  static async listSubcollections(path,ser_acc_id) {
    try {
      const ref = await this.buildReferenceFromPath(path,ser_acc_id);
      
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
