import { sendTelegramMessage } from '../services/telegramService.js';

export async function sendBannedNotification(message = 'Your Whatsapp Got Banned!') {
  try {
    await sendTelegramMessage(message);
    return { success: true, message: 'Notification sent successfully.' };
  } catch (error) {
    console.error('Error sending banned notification:', error.message);
    throw { success: false, message: 'Failed to send notification.' };
  }
}

export async function sendExpiredNotification(message = 'Your Whatsapp Got Expired!') {
  try {
    await sendTelegramMessage(message);
    return { success: true, message: 'Notification sent successfully.' };
  } catch (error) {
    console.error('Error sending expired notification:', error.message);
    throw { success: false, message: 'Failed to send notification.' };
  }
}
