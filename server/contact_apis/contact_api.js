import { createTransport } from "nodemailer";

export async function sendContactEmail(req, res) {
  try {
    console.log("Contact form request:", req.body);

    const { user_email, user_name, subject, message } = req.body;

    if (!user_email || !user_name || !subject || !message) {
      return res.status(400).json({ 
        error: "All fields are required: email, name, subject, message" 
      });
    }

    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: req.body.to_which_mail,
        pass: "yihs glxo irdg owke"
      },
    });

    await transporter.verify();

    const mailOptions = {
      from: req.body.to_which_mail,
      to: req.body.to_which_mail,
      replyTo: user_email,
      subject: `Portfolio Contact Form: ${subject}`,
      text: `Name: ${user_name}\nEmail: ${user_email}\nSubject: ${subject}\n\nMessage:\n${message}`,
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
}

export default { sendContactEmail };