// telegramService.js

import fetch from 'node-fetch';

export async function sendTelegramMessage(telegramBotToken, groupChatId, message) {
  try {
    const apiUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const requestData = { chat_id: groupChatId, text: message };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    console.log('Response Status:', response.status);

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Failed to send message to Telegram: ${data.description}`);
    }

    console.log('Message sent to Telegram group:', message);
  } catch (error) {
    console.error('Error sending message to Telegram:', error.message);
    throw error;
  }
}
