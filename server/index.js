import express, { json } from "express";
import { createTransport } from "nodemailer";
import cors from "cors";
const app = express();
app.use(json());
app.use(cors());
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

//Xecron Imports
import {RecordUsageUpdate,GetTableRecordCount,RecordLimitCheck} from "./utils/updateCount.js";
const xecronDomain = `https://api.xecrontechnologies.in`;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const recordLimitCheck = async (req, res, type) => {
  let data = await RecordLimitCheck(req.body.c_limit.cl)
  console.log("data",data)
  let rec_lmt = data.data.rec_lmt
  let rec_usage = data.data.rec_usage
    let error_map = {
      rec_lmt:rec_lmt,
      rec_usage: rec_usage,
      remaining: rec_lmt - rec_usage,
    };
    res.json(error_map)
};

app.post("/check", recordLimitCheck);

app.post("/store-contact", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ error: "Request body is missing" });
    }

    // Validate required fields
    if (
      !req.body.c_limit ||
      !req.body.c_limit.cl ||
      !req.body.c_body
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        details: !req.body.c_limit
          ? "c_limit missing"
          : !req.body.c_limit.cl
          ? "c_limit.cl missing"
          : "c_body missing",
      });
    }

    // Get client limits
    let clientLimit;
    try {
      const check = await recordLimitCheck(req, null, "fun");
      const limitData = JSON.parse(check);
      clientLimit = limitData.rec_lmt;
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
      .insert([
        {
          ...req.body.c_body,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;

    // Fetch the current rec_usage value
    const { data: limitData, error: fetchError } = await supabase
      .from("xecron_clients_limitations")
      .select("rec_usage")
      .eq("cl", req.body.c_limit.cl)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // Increment the rec_usage by 1
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
});

// Add this new endpoint to your existing code
app.post("/zohomail", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log incoming request

    if (!req.body.c_body.from || !req.body.c_body.to) {
      return res
        .status(400)
        .json({ error: "Both 'from' and 'to' emails are required" });
    }

    const transporter = createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: {
        user: req.body.c_body.from,
        pass: process.env.ZOHO_APP_PASSWORD,
      },
      debug: true, // Enable verbose logging
      logger: true,
    });

    console.log("Attempting to verify SMTP connection...");
    await transporter.verify(); // This will throw an error if auth fails
    console.log("SMTP connection verified");

    const mailOptions = {
      from: req.body.c_body.from,
      to: req.body.c_body.to,
      subject: req.body.c_body.subject || "Test Email from Zoho SMTP",
      text:
        req.body.c_body.text ||
        "This is a test email sent via Zoho SMTP and Nodemailer",
      html:
        req.body.c_body.html ||
        `<p>This is a <strong>test email</strong> sent via Zoho SMTP and Nodemailer</p>`,
    };

    console.log("Sending email with options:", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("FULL ERROR OBJECT:", err);
    return res.status(500).json({
      error: "Failed to send test email",
      details: err.message,
      code: err.code,
      stack: err.stack, // Include stack trace for debugging
    });
  }
});

// Email endpoint
app.post("/gmail", async (req, res) => {
  try {
    // Create a transporter factory function
    const createTransporter = async (email) => {
      try {
        // Fetch credentials from Supabase
        const { data, error } = await supabase
          .from("client_credientials")
          .select("mail_id, app_pwd")
          .eq("mail_id", email)
          .single();

        if (error || !data) {
          throw new Error("Credentials not found");
        }

        // Validate we got both email and password
        if (!data.mail_id || !data.app_pwd) {
          throw new Error("Incomplete credentials");
        }

        console.log(`Creating transporter for: ${data.mail_id}`);

        return createTransport({
          service: "gmail",
          auth: {
            user: data.mail_id,
            pass: data.app_pwd,
          },
        });
      } catch (err) {
        console.error("Transporter creation failed:", err);
        throw err;
      }
    };

    // Validate request
    if (!req.body?.c_body?.from) {
      return res.status(400).json({ error: "Sender email (from) is required" });
    }

    // Create transporter with proper credentials
    const transporter = await createTransporter(req.body.c_body.from);

    // Verify connection
    await transporter.verify();
    console.log("Server is ready to take our messages");

    // Prepare email options
    const mailOptions = {
      from: req.body.c_body.from,
      to: req.body.c_body.to,
      subject: req.body.c_body.subject,
      text: req.body.c_body.text,
      html: req.body.c_body.html || req.body.c_body.text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    return res.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("Email Error:", err);
    return res.status(500).json({
      error: "Failed to send email",
      details: err.message,
      code: err.code,
    });
  }
});

const addClient = async (req, res) => {
  let clientLimit = 0;
  let clientUsage = 0;
  // Xecron Limit Check
  try {
    const { data, error } = await supabase
      .from("xecron_clients_limitations")
      .select("rec_lmt,rec_usage")
      .eq("cl", req.body.c_limit.cl);
    console.log("data", data);

    clientLimit = data[0].rec_lmt;
    clientUsage = data[0].rec_usage;
    console.log("11:", clientLimit);
  } catch (err) {
    console.warn("Unexpected error while fetching limit:", err.message);
  }

  try {
    let clientCount = await GetTableRecordCount(req.body.c_limit.cl)
    // if (!clientCount) return res.json({ error: "No client Name" });

    if (clientCount >= clientLimit) {
      return res.status(400).json({
        Warning: `Client limit reached (${clientCount}/${clientLimit})`,
      });
    }

      const { error: insertError } = await supabase
      .from(`${req.body.c_limit.cl}`)
      .insert([req.body.c_body]);
      if (insertError) throw insertError;
      let updateLimit = await RecordUsageUpdate(clientUsage,req.body.c_limit.cl)
    res.json({
      success: true,
      message: "Client added successfullya",
      usage: updateLimit
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
};

app.post("/add-client", addClient);

app.get("/get-cld", async (req, res) => {
  const { data, error } = await supabase.from("customers").select("*");

  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.delete("/del-cld", async (req, res) => {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: "Missing id parameter" });

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", id);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.post("/update", async (req, res) => {
  const { tbname, id, ...updateFields } = req.body;
  const response = await supabase
    .from(tbname)
    .update(updateFields)
    .eq("id", id);
  res.json(response);
});

//Api url redirect to Xecron Domain
app.get("/", (req, res) => {
  res.redirect("https://www.xecrontechnologies.in");
});
//Render ALive Response
app.get("/api", (req, res) => {
  res.send("Xecron on Live");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server is running at http://localhost:3000");
});
