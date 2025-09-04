import { createTransport } from "nodemailer";
import { supabase, DB_TABLES } from "../config/database.js";

export class EmailService {
  static async getEmailCredentials(email) {
    try {
      const { data, error } = await supabase
        .from(DB_TABLES.CREDENTIALS)
        .select("mail_id, app_pwd")
        .eq("mail_id", email)
        .single();

      if (error || !data) throw new Error("Email credentials not found");
      return data;
    } catch (error) {
      throw new Error(`Failed to get credentials: ${error.message}`);
    }
  }

  static async sendGmail(emailOptions) {
    try {
      const credentials = await this.getEmailCredentials(emailOptions.from);
      
      const transporter = createTransport({
        service: "gmail",
        auth: {
          user: credentials.mail_id,
          pass: credentials.app_pwd,
        },
      });

      await transporter.verify();
      return await transporter.sendMail(emailOptions);
    } catch (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  static async sendZohoMail(emailOptions, appPassword) {
    try {
      const transporter = createTransport({
        host: "smtp.zoho.in",
        port: 465,
        secure: true,
        auth: {
          user: emailOptions.from,
          pass: appPassword,
        },
      });

      await transporter.verify();
      return await transporter.sendMail(emailOptions);
    } catch (error) {
      throw new Error(`Failed to send Zoho email: ${error.message}`);
    }
  }
}