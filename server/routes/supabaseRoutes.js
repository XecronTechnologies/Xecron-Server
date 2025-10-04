import express from "express";
import { supabaseController } from "../controllers/supabaseController.js";

const router = express.Router();

// GET all data from a table
// Example: GET /api/supabase/data?table=client_tokens
router.get("/tabledata", supabaseController.getTableData);

// GET single record by ID
// Example: GET /api/supabase/record?table=client_tokens&id=1
router.get("/record", supabaseController.getRecordById);

//POST create record
router.post("/createrow", supabaseController.createTableData);

//PUT update record
router.put("/updaterow", supabaseController.updateTableData);

// Health check
// GET /api/supabase/health
router.get("/health", supabaseController.healthCheck);

export default router;