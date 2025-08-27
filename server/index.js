import express, { json } from "express";
import { createTransport } from "nodemailer";
import TelegramBot from "node-telegram-bot-api";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
const app = express();
app.use(json());
app.use(cors());
dotenv.config();

//Xecron Imports
import {RecordUsageUpdate,GetTableRecordCount,RecordLimitCheck,GetTableRecordData} from "./utils/updateCount.js";
import sendPDFToTelegram from './utils/telegramBotApis.js';

const xecronDomain = `https://api.xecrontechnologies.in`;
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


////////////////////////////////
import { google } from 'googleapis';
import { readFile } from 'fs/promises';


// Load Service Account
const serviceAccount = JSON.parse(
  await readFile(new URL('./xecron-e86d9-ffc6cc6a8928.json', import.meta.url))
);

// Initialize Google Sheets
const sheets = google.sheets('v4');
const auth = new google.auth.JWT({
  email: "sheets-api-bot@xecron-e86d9.iam.gserviceaccount.com",
  key: serviceAccount.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

// Config
const SPREADSHEET_ID = '1rAHKgaAhGTkWnNUVq27V9K2pBnbLySfs_Gg7kOeoyM8';
const SHEET_NAME = 'Logs';
const LOG_COLUMNS = ['Timestamp', 'Message', 'Status', 'FullData'];
const ERROR_SHEET_NAME = 'ErrorLogs'; // New sheet for errors

// Initialize Sheets
async function initSheet() {
  try {
    // Create main logs sheet if needed
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      resource: { values: [LOG_COLUMNS] }
    });
    
    // Create error logs sheet if needed
    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${ERROR_SHEET_NAME}!A1`,
      valueInputOption: 'RAW',
      resource: { values: [['Timestamp', 'Error', 'Details', 'Context']] }
    });
    
    console.log('Sheets initialized');
  } catch (error) {
    console.log('Sheets already exist or error:', error.message);
  }
}

// Log error to error sheet
async function logErrorToSheet(error, context = {}) {
  try {
    const errorEntry = [
      new Date().toISOString(),
      error.message,
      JSON.stringify(error.stack || error),
      JSON.stringify(context)
    ];

    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${ERROR_SHEET_NAME}!A:D`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [errorEntry] }
    });
  } catch (error) {
    console.error('FAILED TO LOG ERROR:', error);
  }
}

// Mass insert function with error logging
async function massInsert(logData, total = 100000) {
  const BATCH_SIZE = 1000;
  const DELAY_MS = 100;
  let inserted = 0;

  while (inserted < total) {
    const batch = [];
    const remaining = total - inserted;
    const currentBatchSize = Math.min(BATCH_SIZE, remaining);

    // Prepare batch
    for (let i = 0; i < currentBatchSize; i++) {
      batch.push([
        new Date().toISOString(),
        `${logData.message}-${inserted + i}`,
        logData.status,
        JSON.stringify({ ...logData, iteration: inserted + i })
      ]);
    }

    try {
      const response = await sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:D`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: batch }
      });

      inserted += currentBatchSize;
      console.log(`Inserted ${inserted}/${total} records`);

      if (inserted < total) await new Promise(r => setTimeout(r, DELAY_MS));
    } catch (error) {
      console.error(`Batch failed at ${inserted}:`, error.message);
      
      // Log error to error sheet
      await logErrorToSheet(error, {
        batchStart: inserted,
        batchSize: currentBatchSize,
        message: logData.message
      });

      await new Promise(r => setTimeout(r, 5000)); // Longer delay on error
    }
  }
  return inserted;
}

// Main logging function
async function logToSheet(req, res) {
  if (!req.body.message || !req.body.status) {
    return res.status(400).json({ 
      error: 'Missing required fields: message and status' 
    });
  }

  try {
    if (req.body.massInsert) {
      massInsert(req.body)
        .then(count => console.log(`✅ Inserted ${count} records`))
        .catch(async (err) => {
          console.error('Mass insert failed:', err);
          await logErrorToSheet(err, { type: 'massInsert' });
        });

      return res.json({
        success: true,
        message: 'Started mass insertion of 100k records',
        note: 'Check server logs and ErrorLogs sheet for progress'
      });
    }

    // Single insert
    const logEntry = [
      new Date().toISOString(),
      req.body.message,
      req.body.status,
      JSON.stringify(req.body)
    ];

    const response = await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:D`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [logEntry] }
    });

    return res.json({
      success: true,
      range: response.data.updates.updatedRange,
      timestamp: logEntry[0]
    });

  } catch (error) {
    console.error('API Error:', error);
    await logErrorToSheet(error, { 
      endpoint: '/gs',
      body: req.body 
    });
    
    return res.status(502).json({
      error: 'Google Sheets API error',
      details: error.message
    });
  }
}

// Initialize and start server
(async () => {
  try {
    await auth.authorize();
    await initSheet();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Test endpoints:');
      console.log('Single: curl -X POST http://localhost:3000/gs -H "Content-Type: application/json" -d \'{"message":"Test","status":"SUCCESS"}\'');
      console.log('Mass: curl -X POST http://localhost:3000/gs -H "Content-Type: application/json" -d \'{"message":"Mass","status":"PASS","massInsert":true}\'');
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
})();

app.post('/gs', logToSheet);
/////////////////////////////////


////////////////////
// Add this endpoint to your existing server
app.post("/send-contact-email", async (req, res) => {
  try {
    console.log("Contact form request:", req.body);

    const { user_email, user_name, subject, message } = req.body;

    // Validate required fields
    if (!user_email || !user_name || !subject || !message) {
      return res.status(400).json({ 
        error: "All fields are required: email, name, subject, message" 
      });
    }

    // Create transporter using YOUR Gmail credentials
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: req.body.to_which_mail, // Your email
        pass: "yihs glxo irdg owke"
      },
    });

    // Verify connection
    await transporter.verify();

    // Prepare email options
    const mailOptions = {
      from: req.body.to_which_mail, // Send from your email
      to:req.body.to_which_mail, // Send to yourself
      replyTo: user_email, // So you can reply to the user
      subject: `Portfolio Contact Form: ${subject}`,
      text: `
Name: ${user_name}
Email: ${user_email}
Subject: ${subject}

Message:
${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${user_name}</p>
        <p><strong>Email:</strong> ${user_email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>You can reply directly to: <a href="mailto:${user_email}">${user_email}</a></p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Contact email sent:", info.messageId);

    return res.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    });

  } catch (err) {
    console.error("Contact Email Error:", err);
    return res.status(500).json({
      error: "Failed to send email",
      details: err.message,
    });
  }
});
/////////

app.post('/send-pdf', async (req, res) => {
  const htmlContent = req.body.input;

  if (!htmlContent) {
    return res.status(400).json({ error: 'Missing HTML content in request body' });
  }

  const result = await sendPDFToTelegram(htmlContent);

  if (result.success) {
    res.json({ message: 'PDF sent to Telegram successfully' });
  } else {
    res.status(500).json({ error: 'Failed to send PDF', details: result.error });
  }
});

app.get('/business-dashboard', (req, res) => {
  res.json({
    total_sales: 1000000,
    active_orders: 32,
    new_customers: 18,
    returns: 3,
    conversion_rate: 3.2,
    revenue_trend: [12000, 15000, 18000],
    category_distribution: {
      Electronics: 50,
      Clothing: 30,
      Home: 20
    },
    top_products: {
      'Gift Box': 180,
      'Smartwatch': 120,
      'T-Shirt': 90,
      'Chocolates': 70,
      'Perfume': 50
    },
    last_orders: [
      { id: 'INV-101', name: 'Rahul', amount: '₹2500' },
      { id: 'INV-102', name: 'Aditi', amount: '₹1200' },
      { id: 'INV-103', name: 'Karan', amount: '₹950' },
    ]
  });
});






app.post('/get-table', async(req,res)=>{
  const data= await GetTableRecordData(req.body.c_limit.cl)
  console.log("Table", data)
  res.json(data)
})

const recordLimitCheck = async (req, res, type) => {
  let data = await RecordLimitCheck(req.body.c_limit.cl)
  console.log("data",data)
  let rec_lmt = data.data.rec_lmt
  let rec_usage = data.data.rec_usage


  let rowCount = await GetTableRecordCount(req.body.c_limit.cl)
    let error_map = {
      rec_count:rowCount,
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

    const data = await RecordLimitCheck(req.body.c_limit.cl)
console.log("Data",data)
    clientLimit = data.data.rec_lmt;
    clientUsage = data.data.rec_usage;
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
    const updateTable = await GetTableRecordCount(req.body.c_limit.cl)
  const updateClientLimitation = await RecordUsageUpdate(updateTable,req.body.c_limit.cl)
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
    .from(req.body.c_limit.cl)
    .delete()
    .eq("id", id);
  const updateTable = await GetTableRecordCount(req.body.c_limit.cl)
  const updateClientLimitation = await RecordUsageUpdate(updateTable,req.body.c_limit.cl)
  if (error) return res.status(500).json({ error });
  res.json({
    rec_lmt:updateTable,
    rec_update: true
  });
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
