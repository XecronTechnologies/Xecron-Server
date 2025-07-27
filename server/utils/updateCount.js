import express, { json } from "express";
import { createTransport } from "nodemailer";
import cors from "cors";
const app = express();
app.use(json());
app.use(cors());
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


export const RecordUsageUpdate=async(clientUsage,clientName)=>{
    await supabase.from("xecron_clients_limitations").update({ rec_usage: clientUsage  }).eq("cl", clientName);
    return clientUsage
}

export const GetTableRecordCount = async(clientName)=>{
  let data = await supabase.from(clientName).select("*", { count: "exact", head: true });
  return data.count
}

export const RecordLimitCheck = async(clientName)=>{
  let data = await supabase.from("xecron_clients_limitations").select("rec_usage,rec_lmt").eq("cl",clientName).maybeSingle();
  return data
}

export const GetTableRecordData = async (clientName)=>{
  let data = await supabase.from(clientName).select("*").eq("form_type","whatsapp")
  return data
}