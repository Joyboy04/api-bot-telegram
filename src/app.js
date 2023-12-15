import express from 'express';
import mysql from 'mysql';
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

// ...

app.post('/notifycheckDate', async (req, res) => {
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
    // console.log('Rows from the database:', results); // Log the rows to the console

    // Use the 'Asia/Jakarta' time zone
    const currentDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

    if (Array.isArray(results) && results.length > 0) {
      const notifications = [];

      for (const row of results) {
        // console.log('Row:', row);

        const expiredDate = new Date(row.tanggal_expired).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
        const aktifDate = new Date(row.tanggal_aktif).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });

        // console.log('Expired Date:', expiredDate);
        // console.log('Aktif Date:', aktifDate);

        if (new Date(expiredDate) < new Date(currentDate)) {
          console.log('Sending expiration notification for:', row.nomor_telp);
          notifications.push(sendBannedNotification(row.nomor_telp, 'Phone number has expired!', req, res));
        }

        if (new Date(aktifDate) < new Date(currentDate)) {
          console.log('Sending grace period notification for:', row.nomor_telp);
          notifications.push(sendBannedNotification(row.nomor_telp, 'Phone number has entered the grace period!', req, res));
        } 
      }

      await Promise.all(notifications);
      // console.log('Notifications:', notifications);
    } else {
      console.error('Error processing notifications: Rows are not an array or are empty.');
    }

    connection.end();

    res.status(200).json({ success: true, message: 'Notifications processed successfully.' });
  } catch (error) {
    console.error('Error processing notifications:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process notifications.' });
  }
});

// ...

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
