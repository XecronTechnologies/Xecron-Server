import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

import googleDriveRoutes from "./routes/googleDriveRoutes.js";

// Route imports
import firebaseRoutes from "./routes/firebaseRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import supabaseRoutes from "./routes/supabaseRoutes.js"
// import { supabase } from "./config/database.js";

const app = express();
dotenv.config();

// Global middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple logger middleware (temporary)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use("/api/firebase", firebaseRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/supabase", supabaseRoutes);
app.use("/api/drive", googleDriveRoutes);


// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "Xecron API Server" 
  });
});

// Redirects
app.get("/", (req, res) => {
  res.redirect("https://www.xecrontechnologies.in");
});

app.get("/api", (req, res) => {
  res.send("Xecron API Server is running");
});


//shortlinks

app.get("/:userName-:preferredText", async (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://uthgttsrkyhvveoxakmn.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0aGd0dHNya3lodnZlb3hha21uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM5NzQzMSwiZXhwIjoyMDc2OTczNDMxfQ.8mvM8eIQtpw3eGbsJy69TtKk2QIfmKmDSyqlUCktkAs';
const supabase = createClient(supabaseUrl, supabaseKey);
  // Helper functions inside
  const isValidInput = (input) => {
    return input && typeof input === 'string' && input.length <= 20;
  };

  const sanitizeInput = (input) => {
    return input.replace(/[^a-zA-Z0-9]/g, '');
  };

  const isSafeRedirect = (url) => {
    try {
      // Ensure URL has protocol
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Main function logic
  try {
    const { userName, preferredText } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress;

    console.log(`Received request for: ${userName}-${preferredText}`);

    // Input validation
    if (!isValidInput(userName) || !isValidInput(preferredText)) {
      return res.status(400).json({ error: 'Invalid endpoint format' });
    }

    // Sanitize inputs
    const sanitizedUserName = sanitizeInput(userName.toLowerCase());
    const sanitizedPreferredText = sanitizeInput(preferredText.toLowerCase());

    console.log(`Looking up: ${sanitizedUserName}-${sanitizedPreferredText}`);

    // Step 1: Verify user exists and get record_id
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('record_id, status')
      .eq('u_name', sanitizedUserName)
      .single();

    if (userError || !userData) {
      console.log('User not found:', sanitizedUserName);
      return res.status(404).json({ 
        error: 'User not found',
        message: `User '${sanitizedUserName}' does not exist`
      });
    }

    // Check if user has paid status
    if (userData.status !== 'paid') {
      console.log('User not paid:', sanitizedUserName);
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'User account is not active or paid'
      });
    }

    console.log(`User found with record_id: ${userData.record_id}`);

    // Step 2: Lookup in shortlinks table using user's record_id and preferred text
    const { data: shortlinkData, error: shortlinkError } = await supabase
      .from('shortlinks')
      .select('r_url')
      .eq('cl_lkp', userData.record_id)  // Match user record_id with cl_lkp
      .eq('e_txt', sanitizedPreferredText)  // Match preferred text with e_txt
      .single();

    if (shortlinkError || !shortlinkData) {
      console.log('Shortlink not found for user:', sanitizedUserName, 'text:', sanitizedPreferredText);
      return res.status(404).json({ 
        error: 'Shortlink not found',
        message: `Shortlink '${sanitizedPreferredText}' not found for user '${sanitizedUserName}'`
      });
    }

    console.log(`Redirect URL found: ${shortlinkData.r_url}`);

    // Step 3: Validate and format redirect URL
    let redirectUrl = shortlinkData.r_url;
    
    // Ensure URL has protocol
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
      redirectUrl = 'https://' + redirectUrl;
    }

    if (!isSafeRedirect(redirectUrl)) {
      return res.status(400).json({ error: 'Invalid redirect URL' });
    }

    console.log(`Redirecting to: ${redirectUrl}`);

    // Step 4: Perform redirect
    res.redirect(302, redirectUrl);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple 404 handler (temporary)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl
  });
});

// Simple error handler (temporary)
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔥 Firebase API: http://localhost:${PORT}/api/firebase`);
  console.log(`📧 Email API: http://localhost:${PORT}/api/email`);
});
