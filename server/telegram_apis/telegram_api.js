import sendPDFToTelegram from '../utils/telegramBotApis.js';

export async function sendPDF(req, res) {
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
}

export default { sendPDF };