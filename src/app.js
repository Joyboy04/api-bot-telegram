
import express from 'express';
import cron from 'node-cron';
import { sendTelegramMessage } from './services/telegramService.js';
import { createConnection, executeQuery } from './db/connection.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

async function sendTelegramNotifications(notifications, telegramBotToken, groupChatId, message) {
  try {
    const formattedNotifications = notifications.map((notification, index) => {
      return `${index + 1}. ${notification}`;
    });

    const messageToSend = `${message}:\n${formattedNotifications.join('\n')}`;

    await sendTelegramMessage(telegramBotToken, groupChatId, messageToSend);

    console.log('Telegram notifications sent successfully.');
  } catch (error) {
    console.error('Error sending Telegram notifications:', error.message);
  }
}

async function checkDatesAndSendNotifications(configurations) {
  try {
    for (const config of configurations) {
      const connection = createConnection();

      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to MySQL:', err.message);
          throw err;
        }

        console.log('Connected to MySQL');
      });

      const results = await executeQuery('SELECT * FROM tnumber ORDER BY id ASC', connection);

      const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

      if (Array.isArray(results) && results.length > 0) {
        const notifications = [];

        for (const row of results) {
          const expiredDate = new Date(row.tanggal_expired).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
          const aktifDate = new Date(row.tanggal_aktif).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

          if (new Date(expiredDate) < new Date(currentDate)) {
            console.log('Sending expiration notification for:', row.nomor_telp);
            notifications.push(`Phone number ${row.nomor_telp} has expired!`);
          }

          if (new Date(aktifDate) < new Date(currentDate)) {
            console.log('Sending grace period notification for:', row.nomor_telp);
            notifications.push(`Phone number ${row.nomor_telp} has entered the grace period!`);
          }
        }

        if (notifications.length > 0) {
          await sendTelegramNotifications(notifications, config.telegramBotToken, config.groupChatId, config.message);
        } else {
          console.log('No notifications to send.');
        }
      } else {
        console.error('Error processing notifications: Rows are not an array or are empty.');
      }

      connection.end();

      console.log('Notifications processed successfully.');
    }
  } catch (error) {
    console.error('Error processing notifications:', error.message);
  }
}

// Schedule the cron job to run every minute for testing purposes
cron.schedule('* * * * *', async () => {
  try {
    console.log('Running the cron job every minute...');

    // Fetch the latest configurations from the database
    const configurations = await fetchConfigurationsFromDatabase();

    // Destructure the configurations and run the checkDatesAndSendNotifications function
    if (configurations) {
      await checkDatesAndSendNotifications(configurations);
    } else {
      console.log('No configurations received from the database.');
    }
  } catch (error) {
    console.error('Error running the cron job:', error.message);
  }
});

async function fetchConfigurationsFromDatabase() {
  const connection = createConnection();

  try {
    connection.connect();

    const results = await executeQuery('SELECT * FROM bot_token', connection);

    return results.map((row) => ({
      telegramBotToken: row.telegram_bot_token,
      groupChatId: row.group_chat_id,
      message: row.message,
    }));
  } finally {
    connection.end();
  }
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
