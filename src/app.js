import express from 'express';
import mysql from 'mysql';
import cron from 'node-cron';
import { sendBannedNotification } from './routes/routesNotifcation.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Function to create a new MySQL connection
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

// Function to execute a MySQL query with promises
function executeQuery(query, connection) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Function to check dates and send notifications
async function checkDatesAndSendNotifications() {
  try {
    const connection = createConnection();

    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL:', err.message);
        throw err;
      }

      console.log('Connected to MySQL');
    });

    // Simulate a database query (replace this with your actual query)
    const results = await executeQuery('SELECT * FROM tnumber ORDER BY id ASC', connection);

    // Use the 'Asia/Jakarta' time zone
    const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

    if (Array.isArray(results) && results.length > 0) {
      const notifications = [];

      for (const row of results) {
        const expiredDate = new Date(row.tanggal_expired).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
        const aktifDate = new Date(row.tanggal_aktif).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

        if (new Date(expiredDate) < new Date(currentDate)) {
          console.log('Sending expiration notification for:', row.nomor_telp);
          notifications.push(sendBannedNotification(row.nomor_telp, 'Phone number has expired!'));
        }

        if (new Date(aktifDate) < new Date(currentDate)) {
          console.log('Sending grace period notification for:', row.nomor_telp);
          notifications.push(sendBannedNotification(row.nomor_telp, 'Phone number has entered the grace period!'));
        }
      }

      await Promise.all(notifications);
      
    } else {
      console.error('Error processing notifications: Rows are not an array or are empty.');
    }

    connection.end();

    console.log('Notifications processed successfully.');
  } catch (error) {
    console.error('Error processing notifications:', error.message);
  }
}

// Schedule the cron job to run every day at 10:00 AM
cron.schedule('0 10 * * *', async () => {
  try {
    console.log('Running the cron job at 10:00 AM every day...');
    const fakeReq = {}; // Create a fake request object for testing
    const fakeRes = {}; // Create a fake response object for testing
    await checkDatesAndSendNotifications(fakeReq, fakeRes);
  } catch (error) {
    console.error('Error running the cron job:', error.message);
  }
});

// // Schedule the task to run every day at 10 AM
// cron.schedule('0 10 * * *', () => {
//   console.log('Running daily check at 10 AM');
//   checkDatesAndSendNotifications();
// });

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
