const admin = require("firebase-admin");
require("dotenv").config();

// const getFirebaseConfig = () => {
//   if (process.env.FIREBASE_GITHUB_ENVIRONMENT === "service-account-key") {
//     return {
//       type: "service_account",
//       project_id: process.env.FIREBASE_PROJECT_ID,
//       private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
//       private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//       client_email: process.env.FIREBASE_CLIENT_EMAIL,
//       client_id: process.env.FIREBASE_CLIENT_ID,
//       auth_uri: process.env.FIREBASE_AUTH_URI,
//       token_uri: process.env.FIREBASE_TOKEN_URI,
//       auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
//       client_x509_cert_url: CLIENT_X509_CERT_URL,
//     };
//   }
// };

const getFirebaseConfig = () => {
 
  const config = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  };

  if (process.env.FIREBASE_PRIVATE_KEY) {
    config.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
  }

  return config;
};

admin.initializeApp({
  credential: admin.credential.cert(getFirebaseConfig()),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
});

const db = admin.firestore();

module.exports = { db };
