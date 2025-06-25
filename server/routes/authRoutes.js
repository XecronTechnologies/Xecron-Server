const express = require("express");
const router = express.Router();
const { db } = require("../firebase-config");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Signup Endpoint
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // ✅ Validate input
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and name are required.",
      });
    }

    // ✅ Create Firebase Auth User
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // ✅ Generate Tokens
    const accessToken = jwt.sign(
      { uid: userRecord.uid },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = uuidv4();
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // ✅ Store Refresh Token in Firestore
    await db.collection("refreshTokens").doc(refreshToken).set({
      uid: userRecord.uid,
      expiresAt: refreshTokenExpiry,
    });

    // ✅ Store User Info in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      name,
      accessToken,
      refreshToken,
      expiresAt: refreshTokenExpiry,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // ✅ Respond with tokens and user data
    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      expiresAt: refreshTokenExpiry,
      user: {
        uid: userRecord.uid,
        email,
        name,
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
