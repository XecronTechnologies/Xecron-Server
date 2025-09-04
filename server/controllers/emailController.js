import { EmailService } from "../services/emailService.js";
import { RESPONSE_MESSAGES, STATUS_CODES } from "../config/constants.js";

export const emailController = {
  sendGmail: async (req, res) => {
    try {
      const { from, to, subject, text, html } = req.body;

      const mailOptions = { from, to, subject, text, html: html || text };
      const info = await EmailService.sendGmail(mailOptions);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: RESPONSE_MESSAGES.SUCCESS,
        data: { messageId: info.messageId }
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_ERROR).json({
        success: false,
        error: error.message
      });
    }
  },

  sendZohoMail: async (req, res) => {
    try {
      const { from, to, subject, text, html } = req.body.c_body;

      const mailOptions = { from, to, subject, text, html: html || text };
      const info = await EmailService.sendZohoMail(mailOptions, process.env.ZOHO_APP_PASSWORD);

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        message: RESPONSE_MESSAGES.SUCCESS,
        data: { messageId: info.messageId }
      });
    } catch (error) {
      res.status(STATUS_CODES.INTERNAL_ERROR).json({
        success: false,
        error: error.message
      });
    }
  }
};