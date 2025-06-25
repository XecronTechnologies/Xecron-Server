const express = require("express");
const router = express.Router();
const { db } = require("../firebase-config");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

let Refresh = "Not Done";
// Signup Endpoint
router.post("/signup", async (req, res) => {
  try {
    // const {email,password,name} = req.body;
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    // 1. Create Firebase Auth User
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // 3. Generate Tokens
    const accessToken = jwt.sign(
      { uid: userRecord.uid },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } //Short Lived
    );
    const refreshToken = uuidv4(); //Unique long-lived token
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); //7 days

    // 4. Store Refresh Token in Firestore (for validation later)
    await db.collection("refreshTokens").doc(refreshToken).set({
      uid: userRecord.uid,
      expiresAt: refreshTokenExpiry,
    });

    // 2. Store Additional User Data in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      name: name,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: refreshTokenExpiry,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 5. Send Tokens to Client
    res.status(201).json({
      success: true,
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: refreshTokenExpiry,
      user: {
        uid: userRecord.uid,
        email: email,
        name: name,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = router;
