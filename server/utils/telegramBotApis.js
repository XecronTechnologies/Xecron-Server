import TelegramBot from 'node-telegram-bot-api';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Setup Telegram bot
const token = process.env.TELEGRAM_BOT;
const chatId = '@testing23212'; // Replace with your channel username or user ID
const bot = new TelegramBot(token, { polling: false });

// Generate PDF from HTML string
async function generatePDF(htmlContent, outputPath) {
  const browser = await puppeteer.launch({
    headless: 'new', // helps avoid Chromium warnings in some environments
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, {
    waitUntil: 'networkidle0',
    timeout: 0,
  });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
  });
  await browser.close();
}

// Send PDF to Telegram
async function sendPDFToTelegram(htmlContent) {
  const outputPath = path.resolve('./output.pdf');

  try {
    await generatePDF(htmlContent, outputPath);
    await bot.sendDocument(chatId, fs.createReadStream(outputPath), {
      caption: 'Here is your PDF',
    });
    console.log('✅ PDF sent to Telegram!');
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to send PDF to Telegram:', err.message);
    return { success: false, error: err.message };
  }
}

export default sendPDFToTelegram;
