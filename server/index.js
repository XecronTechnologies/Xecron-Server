import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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