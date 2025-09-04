import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { RecordUsageUpdate, GetTableRecordCount, RecordLimitCheck, GetTableRecordData } from "../utils/updateCount.js";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function storeContact(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    if (!req.body.c_limit || !req.body.c_limit.cl || !req.body.c_body) {
      return res.status(400).json({
        error: "Missing required fields",
        details: !req.body.c_limit ? "c_limit missing" : !req.body.c_limit.cl ? "c_limit.cl missing" : "c_body missing",
      });
    }

    // Get client limits
    let clientLimit;
    try {
      const data = await RecordLimitCheck(req.body.c_limit.cl);
      clientLimit = data.data.rec_lmt;
    } catch (err) {
      console.warn("Limit check warning:", err.message);
      clientLimit = null;
    }

    // Check client count if limit exists
    if (clientLimit !== null) {
      const { count: clientCount, error: countError } = await supabase
        .from(req.body.c_limit.cl)
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;
      if (clientCount >= clientLimit) {
        return res.status(429).json({
          error: `Records limit reached (${clientCount}/${clientLimit})`,
          limit: clientLimit,
          current: clientCount,
        });
      }
    }

    // Insert the record
    const { data, error } = await supabase
      .from(req.body.c_limit.cl)
      .insert([{ ...req.body.c_body, created_at: new Date().toISOString() }])
      .select();

    if (error) throw error;

    // Update usage count
    const { data: limitData, error: fetchError } = await supabase
      .from("xecron_clients_limitations")
      .select("rec_usage")
      .eq("cl", req.body.c_limit.cl)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const { error: updateError } = await supabase
      .from("xecron_clients_limitations")
      .update({ rec_usage: (limitData?.rec_usage || 0) + 1 })
      .eq("cl", req.body.c_limit.cl);

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: "Contact added successfully",
      data: data[0],
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}

export async function addClient(req, res) {
  let clientLimit = 0;
  let clientUsage = 0;
  
  try {
    const data = await RecordLimitCheck(req.body.c_limit.cl);
    clientLimit = data.data.rec_lmt;
    clientUsage = data.data.rec_usage;
  } catch (err) {
    console.warn("Unexpected error while fetching limit:", err.message);
  }

  try {
    let clientCount = await GetTableRecordCount(req.body.c_limit.cl);
    
    if (clientCount >= clientLimit) {
      return res.status(400).json({
        Warning: `Client limit reached (${clientCount}/${clientLimit})`,
      });
    }

    const { error: insertError } = await supabase
      .from(`${req.body.c_limit.cl}`)
      .insert([req.body.c_body]);
      
    if (insertError) throw insertError;
    
    const updateTable = await GetTableRecordCount(req.body.c_limit.cl);
    const updateClientLimitation = await RecordUsageUpdate(updateTable, req.body.c_limit.cl);
    
    res.json({
      success: true,
      usage: updateClientLimitation
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
}

export async function getClients(req, res) {
  const { data, error } = await supabase.from("customers").select("*");
  if (error) return res.status(500).json({ error });
  res.json(data);
}

export async function deleteClient(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id parameter" });

  const { data, error } = await supabase
    .from(req.body.c_limit.cl)
    .delete()
    .eq("id", id);
    
  const updateTable = await GetTableRecordCount(req.body.c_limit.cl);
  const updateClientLimitation = await RecordUsageUpdate(updateTable, req.body.c_limit.cl);
  
  if (error) return res.status(500).json({ error });
  res.json({
    rec_lmt: updateTable,
    rec_update: true
  });
}

export async function updateRecord(req, res) {
  const { tbname, id, ...updateFields } = req.body;
  const response = await supabase
    .from(tbname)
    .update(updateFields)
    .eq("id", id);
  res.json(response);
}

export async function getTableData(req, res) {
  const data = await GetTableRecordData(req.body.c_limit.cl);
  res.json(data);
}

export async function checkRecordLimit(req, res) {
  let data = await RecordLimitCheck(req.body.c_limit.cl);
  let rec_lmt = data.data.rec_lmt;
  let rec_usage = data.data.rec_usage;

  let rowCount = await GetTableRecordCount(req.body.c_limit.cl);
  let error_map = {
    rec_count: rowCount,
    rec_lmt: rec_lmt,
    rec_usage: rec_usage,
    remaining: rec_lmt - rec_usage,
  };
  res.json(error_map);
}

export default {
  storeContact,
  addClient,
  getClients,
  deleteClient,
  updateRecord,
  getTableData,
  checkRecordLimit
};