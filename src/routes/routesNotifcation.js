// routesNotification.js

import { sendTelegramMessage } from '../services/telegramService.js';

export async function sendBannedNotification(number, message = 'Your Whatsapp Got Banned!') {
  try {
    const timestamp = new Date();
    const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'Asia/Jakarta' }).format(timestamp);
    const time = new Intl.DateTimeFormat('id-ID', { timeStyle: 'long', timeZone: 'Asia/Jakarta' }).format(timestamp);
    const fullMessage = `${message}\n\nNumber: ${number}\n\n${date}\n${time}`;

    // Log the message before sending
    console.log('Sending message to Telegram:', fullMessage);

    // Call the sendTelegramMessage function with the full message
    await sendTelegramMessage(fullMessage);

    console.log('Notification sent successfully.');
    return { success: true, message: 'Notification sent successfully.' };
  } catch (error) {
    console.error('Error sending expired notification:', error.message);
    throw { success: false, message: 'Failed to send notification.' };
  }
}
