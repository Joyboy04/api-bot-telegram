// telegramService.js

import fs from 'fs';
import fetch from 'node-fetch';

const envFile = fs.readFileSync('../.env', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  process.env[key] = value;
});

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

export async function sendTelegramMessage(message) {
  try {
    const apiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const requestData = { chat_id: groupChatId, text: message };

    // Log the request data
    // console.log('Request Data:', requestData);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    // Log the response status
    console.log('Response Status:', response.status);

    const data = await response.json();

    // // Log the response data
    // console.log('Response Data:', data);

    if (!data.ok) {
      throw new Error(`Failed to send message to Telegram: ${data.description}`);
    }

    console.log('Message sent to Telegram group:', message);
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
    throw error;
  }
}
