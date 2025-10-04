import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const DB_TABLES = {
  CLIENTS: "xecron_clients_limitations",
  CREDENTIALS: "client_credentials",
  CUSTOMERS: "customers",
  CLIENT_TOKENS: "client_tokens"
};