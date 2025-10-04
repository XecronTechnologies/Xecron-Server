import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
// const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase only once
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// const db = admin.firestore();

export class FirebaseService {
  static buildReferenceFromPath(path) {
    let client_cert_url_value = "firebase-adminsdk-fbsvc%40learning-23088" || process.env.FIREBASE_CLIENT_CERT_URL_VALUE
    let serviceAccount = {
  "type": "service_account",
  "project_id": "xecron-client-management",
  "private_key_id": "c4df08f485582b362d4858ed3a321b41c01346e6",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC27aJB5Mk+n/Pa\n9xF2A9DT5OE8dF9xogjF8eqlteAIP+nkrcUQNKTDmS01+wiy8SJuqHMqFfZXnQ5/\n0i/czv4VusJjPewc73Vb716cL6DH6rJa11o1NTNZ1ZuUzuA1WY21ym/DKcWRnHVf\nQlZh4nt9SkuMkOifju8HS9q6IpnAh/xqhWF8aRiPbjy2xrdqOfYOAEX1oMGa/raa\nv8nygzRfCY3cnvjmhXxR3TftsU9wv62B+eyhtPCzM54VWLiU3hrehZrSPtMeNtvk\nWZ1P4TYkg1Ik3tja5Ud1CZNMrq5LHjNs4GrDFsCykUZndEF1y0IXrRWEZ8e6YwFO\nwkV9hX5vAgMBAAECggEADzy+HkUDal8CfgPEhZMNywiupk1/QcTgfDSJeiIrNiS0\nw+Khnpbz/oL83Bk8AUPKvXL0nNXVfjjL42PLrtXjHkY/OOsIhuR/XxgSRmpFN0Ha\nd2ymy/XRgDMl0YBl9qut/S2On7AUD+v7buLktSSbarVMk7niVqAeUvpDjuug6QOG\ne/EZJY9Ul8bE/q2xDRWYqZzQkOxQ/OHGdgROOunzV+jyVMdeLjEyRGpBUhYjJHRy\n923rSll4tAmWUp34XCsUWjPozgBSwhveBs8K5Z9s18lXdFYU4deeNJZqhK+rAcDI\nkC6Jcexqr6tfwUeFAVTEXzCEAGbaRZrXzW5XAUEqQQKBgQDzMGYUIoU1lxj6+xI0\nqaj8wnn3Wvw0gK45hH4EFHGlvoNfckK0tTc2VqK9ud1UqmoYoBXMwhpJJ3CC+bLa\np0Jt1Ujgt47kdyWMxyYR0AO+WWj7PZpjBtMXDo9OcQl9Jws2omE0nFLTQZQYU13R\nLjbfTBdk43C/eiWk7RJ12+TyoQKBgQDAkJHEzw752Y2Kok1+utCTSdxl4FWViNts\nKubU9RXoA/mUJMhEfp41Ng6klF0LBQFWnInpXmthvgUeAYN+cYDT2hhuC3C6oDEM\n9dppSCOB3aonvfmDAm1ByemvxhyZ4npUTHw6TbHYJaA20TPUFEmCK4mJAZ9ak8Ed\n55C/AKznDwKBgAMcDVIYlud2hSVAbJ0rxjNlMTYOfccWFiQ6I3pd4I4j/34K8ftp\njckuFmqio8ffXffupBi4KqngzTl/g9/z34+T+JiXAEa/l0VTjpMPu9yFPChqQz0c\n6zoSP5bbLyngg+4w6VlI3m5BGmmtNzfjhWQZjvsFRX3NTAnt1hyXsTfBAoGANftR\nId75z8jRCQAewVwVhHS8OEL/OwA2osgUFbbvAS+8E2+MRMdKCpiw2ipNOv2YNnOD\npcw2RhxCyvqZpiSjfMAzAQZr/6VQmtWA+OqkKY++V43GGJfhkQPNYt0iv3Dh4ife\n22lUZceGdleHM/jL8pXJ5IJz7axmAsAbr6+8yLkCgYB6w90QXn16WldgWsaRWkVm\nxkH3oaKaAasbnFYI+iA/mI2mJT7gTQtmo/c7y8KmA+IM6+W2P0XHedP5E8A15h6+\n6o7YXjztvSTJdeqctzot3pvUiJaEEl1W6X+gv4VBiCAZS4DNw2PLU0wzdxx6GkKN\noo5i7eiqRBd9aBHKh7Z/kA==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@xecron-client-management.iam.gserviceaccount.com",
  "client_id": "101612298437554032831",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40xecron-client-management.iam.gserviceaccount.com",
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

  // READ - Get all documents in a collection
static async getAllDocumentsInCollection(path) {
  try {
    console.log("Get all documents in collection request:", { path });
    
    const ref = this.buildReferenceFromPath(path);
    
    // Ensure we're at collection level
    if (ref.constructor.name !== 'CollectionReference') {
      throw new Error("Path must point to a collection to get all documents");
    }
    
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
  static async updateDocument(path, data, merge = true,row_body) {
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
      
      const ref = this.buildReferenceFromPath(path);
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