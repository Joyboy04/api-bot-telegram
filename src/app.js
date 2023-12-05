import express from 'express';
import { sendBannedNotification, sendExpiredNotification } from './routes/routesNotifcation.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


app.post('/notificationBanned', async (req, res) => {
  const { number, message } = req.body;
  try {
    await sendBannedNotification(number, message);
    res.status(200).json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Error sending expired notification:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send notification.' });
  }
});

app.post('/notificationExpired', async (req, res) => {
  const { number, message } = req.body;
  try {
    await sendExpiredNotification(number, message);
    res.status(200).json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Error sending expired notification:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send notification.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
