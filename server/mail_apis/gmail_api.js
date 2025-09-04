import { createTransport } from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function sendGmail(req, res) {
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
}

export default { sendGmail };