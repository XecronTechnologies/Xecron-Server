import { createTransport } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendZohoMail(req, res) {
  try {
    console.log("Request body:", req.body);

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
      debug: true,
      logger: true,
    });

    console.log("Attempting to verify SMTP connection...");
    await transporter.verify();
    console.log("SMTP connection verified");

    const mailOptions = {
      from: req.body.c_body.from,
      to: req.body.c_body.to,
      subject: req.body.c_body.subject || "Test Email from Zoho SMTP",
      text: req.body.c_body.text || "This is a test email sent via Zoho SMTP and Nodemailer",
      html: req.body.c_body.html || `<p>This is a <strong>test email</strong> sent via Zoho SMTP and Nodemailer</p>`,
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
      stack: err.stack,
    });
  }
}

export default { sendZohoMail };