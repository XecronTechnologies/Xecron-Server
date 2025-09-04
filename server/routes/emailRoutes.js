import express from "express";
import { emailController } from "../controllers/emailController.js";
import { validateEmailRequest } from "../middleware/validation.js";

const router = express.Router();

router.post("/gmail", validateEmailRequest, emailController.sendGmail);
router.post("/zohomail", emailController.sendZohoMail);

export default router;