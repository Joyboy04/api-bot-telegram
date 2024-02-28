import express from 'express';
import cron from 'node-cron';
import { sendTelegramMessage } from './services/telegramService.js';
// import { createConnection, executeQuery } from './db/connection.js';
import mysql from 'mysql';


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const connection = createConnection(); 

function createConnection() {
  return mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dbnumber',
    connectTimeout: 0,
    acquireTimeout: 0,
  });
} 

async function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

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

async function checkDatesAndAddToQueue(config, connection) {
  try {
    const results = await executeQuery('SELECT * FROM tnumber ORDER BY id ASC', [], connection);

    const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

    if (Array.isArray(results) && results.length > 0) {
      for (const row of results) {
        const expiredDate = new Date(row.tanggal_expired).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
        const aktifDate = new Date(row.tanggal_aktif).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

        if (new Date(expiredDate) < new Date(currentDate)) {
          console.log('Adding to queue for expiration notification:', row.nomor_telp);
          await executeQuery(
            'INSERT INTO queue (nomor_telp, message, telegram_bot_token) VALUES (?, ?, ?)',
            [row.nomor_telp, `Phone number ${row.nomor_telp} has expired!`, config.telegramBotToken],
            connection
          );
        }

        if (new Date(aktifDate) < new Date(currentDate)) {
          console.log('Adding to queue for grace period notification:', row.nomor_telp);
          await executeQuery(
            'INSERT INTO queue (nomor_telp, message, telegram_bot_token) VALUES (?, ?, ?)',
            [row.nomor_telp, `Phone number ${row.nomor_telp} has entered the grace period!`, config.telegramBotToken],
            connection
          );
        }
      }
    } else {
      console.error('Error processing notifications: Rows are not an array or are empty.');
    }

    console.log('Dates checked and added to queue successfully.');
  } catch (error) {
    console.error('Error checking dates and adding to queue:', error.message);
  }
}

async function processQueue(config, connection) {
  try {
    if (connection && connection.state === 'connected') {
      const queueResults = await executeQuery('SELECT * FROM queue', [], connection);

      if (Array.isArray(queueResults) && queueResults.length > 0) {
        const notifications = [];

        for (const row of queueResults) {
          notifications.push(row.message);

          // Delete the processed entry from the queue
          await executeQuery('DELETE FROM queue WHERE id = ?', [row.id], connection);
        }

        if (notifications.length > 0) {
          await sendTelegramNotifications(notifications, config.telegramBotToken, config.groupChatId, config.message);
        }
      } else {
        console.log('No entries in the queue.');
      }
    } else {
      console.error('Connection is closed or undefined. Reconnecting...');
      connection = createConnection();
      connection.connect();

      // Repeat the code to execute the queries with the new connection
      const queueResults = await executeQuery('SELECT * FROM queue', [], connection);

      if (Array.isArray(queueResults) && queueResults.length > 0) {
        const notifications = [];

        for (const row of queueResults) {
          notifications.push(row.message);

          // Delete the processed entry from the queue
          await executeQuery('DELETE FROM queue WHERE id = ?', [row.id], connection);
        }

        if (notifications.length > 0) {
          await sendTelegramNotifications(notifications, config.telegramBotToken, config.groupChatId, config.message);
        }
      } else {
        console.log('No entries in the queue.');
      }
    }
  } catch (error) {
    console.error('Error processing the queue:', error.message);
  }
}

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

// Schedule the cron job to run every minute for testing purposes
cron.schedule('* * * * *', async () => {
  try {
    console.log('Running the cron job every minute...');

    // Fetch the latest configurations from the database
    const configurations = await fetchConfigurationsFromDatabase();

    // Destructure the configurations and run the checkDatesAndAddToQueue function
    if (configurations) {
      const connection = createConnection();
      for (const config of configurations) {
        await checkDatesAndAddToQueue(config, connection);
      }
      connection.end();
    } else {
      console.log('No configurations received from the database.');
    }
  } catch (error) {
    console.error('Error running the cron job:', error.message);
  }
});

// Schedule a separate cron job or interval to process the queue every 3 seconds
cron.schedule('*/3 * * * * *', async () => {
  try {
    console.log('Processing the queue every 3 seconds...');

    // Fetch the latest configurations from the database
    const configurations = await fetchConfigurationsFromDatabase();

    // Destructure the configurations and run the processQueue function
    if (configurations) {
      for (const config of configurations) {
        const connection = createConnection(); // Create a connection
        await processQueue(config, connection); // Pass the connection to processQueue
        connection.end(); // Close the connection after processing the queue
      }
    } else {
      console.log('No configurations received from the database.');
    }
  } catch (error) {
    console.error('Error processing the queue:', error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
