const express = require("express");
const app = express();
app.use(express.json());
const nodemailer = require("nodemailer");
require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);


// Add this new endpoint to your existing code
app.post("/zohomail", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Log incoming request

    if (!req.body.client_body.from || !req.body.client_body.to) {
      return res.status(400).json({ error: "Both 'from' and 'to' emails are required" });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true,
      auth: {
        user: req.body.client_body.from,
        pass: process.env.ZOHO_APP_PASSWORD
      },
      debug: true, // Enable verbose logging
      logger: true
    });

    console.log("Attempting to verify SMTP connection...");
    await transporter.verify(); // This will throw an error if auth fails
    console.log("SMTP connection verified");

    const mailOptions = {
      from: req.body.client_body.from,
      to: req.body.client_body.to,
      subject: req.body.client_body.subject || "Test Email from Zoho SMTP",
      text: req.body.client_body.text || "This is a test email sent via Zoho SMTP and Nodemailer",
      html: req.body.client_body.html || `<p>This is a <strong>test email</strong> sent via Zoho SMTP and Nodemailer</p>`
    };

    console.log("Sending email with options:", mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);

    return res.json({
      success: true,
      message: "Test email sent successfully",
      messageId: info.messageId
    });

  } catch (err) {
    console.error("FULL ERROR OBJECT:", err);
    return res.status(500).json({
      error: "Failed to send test email",
      details: err.message,
      code: err.code,
      stack: err.stack // Include stack trace for debugging
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
      .from('client_gmail_api_password')
      .select('mail_id, app_pwd')
      .eq('mail_id', email)
      .single();

    if (error || !data) {
      throw new Error('Credentials not found');
    }

    // Validate we got both email and password
    if (!data.mail_id || !data.app_pwd) {
      throw new Error('Incomplete credentials');
    }

    console.log(`Creating transporter for: ${data.mail_id}`);
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: data.mail_id,
        pass: data.app_pwd
      }
    });
  } catch (err) {
    console.error('Transporter creation failed:', err);
    throw err;
  }
};

    // Validate request
    if (!req.body?.client_body?.from) {
      return res.status(400).json({ error: "Sender email (from) is required" });
    }

    // Create transporter with proper credentials
    const transporter = await createTransporter(req.body.client_body.from);
    
    // Verify connection
    await transporter.verify();
    console.log("Server is ready to take our messages");

    // Prepare email options
    const mailOptions = {
      from: req.body.client_body.from,
      to: req.body.client_body.to,
      subject: req.body.client_body.subject,
      text: req.body.client_body.text,
      html: req.body.client_body.html || req.body.client_body.text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    
    return res.json({
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId
    });

  } catch (err) {
    console.error("Email Error:", err);
    return res.status(500).json({
      error: "Failed to send email",
      details: err.message,
      code: err.code
    });
  }
});



const addClient = async (req, res) => {
  let clientLimit = null;
  // Xecron Limit Check
  try {
    const { data, error } = await supabase
      .from("xecron_clients_limitations")
      .select("rec_lmt")
      .eq("cl", req.body.client_limit.cl);

    clientLimit = data[0].rec_lmt;
  } catch (err) {
    console.warn("Unexpected error while fetching limit:", err.message);
  }

  try {
    const inputClient = req.body.client_limit.cl;
    const { count: clientCount, error: countError } = await supabase
      .from(inputClient)
      .select("*", { count: "exact", head: true });
    if (!clientCount) return res.json({ error: "No client Name" });

    if (countError) throw countError;
    if (clientCount >= clientLimit) {
      return res.status(400).json({
        error: `Client limit reached (${clientCount}/${clientLimit})`,
        limit: clientLimit,
        current: clientCount,
      });
    }

    const { error: insertError } = await supabase
      .from(`${req.body.client_limit.cl}`)
      .insert([req.body.client_body]);
    if (insertError) throw insertError;
    res.json({
      success: true,
      message: "Client added successfully",
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
