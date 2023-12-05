import { sendTelegramMessage } from '../services/telegramService.js';

export async function sendBannedNotification(number, message = 'Your Whatsapp Got Banned!') {
  try {
    const timestamp = new Date();
    const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'Asia/Jakarta' }).format(timestamp);
    const time = new Intl.DateTimeFormat('id-ID', { timeStyle: 'long', timeZone: 'Asia/Jakarta' }).format(timestamp);
    const fullMessage = `${message}\n\nNumber: ${number}\n\n${date}\n${time}`;
    await sendTelegramMessage(fullMessage);
    return { success: true, message: 'Notification sent successfully.' };
  } catch (error) {
    console.error('Error sending expired notification:', error.message);
    throw { success: false, message: 'Failed to send notification.' };
  }
}

export async function sendExpiredNotification(number, message = 'Your Whatsapp Got Expired!') {
  try {
    const timestamp = new Date();
    const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full', timeZone: 'Asia/Jakarta' }).format(timestamp);
    const time = new Intl.DateTimeFormat('id-ID', { timeStyle: 'long', timeZone: 'Asia/Jakarta' }).format(timestamp);
    const fullMessage = `${message}\n\nNumber: ${number}\n\n${date}\n${time}`;
    await sendTelegramMessage(fullMessage);
    return { success: true, message: 'Notification sent successfully.' };
  } catch (error) {
    console.error('Error sending expired notification:', error.message);
    throw { success: false, message: 'Failed to send notification.' };
  }
}