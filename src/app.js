import express from 'express';
import rateLimit from 'express-rate-limit';
import { sendBannedNotification } from './routes/routesNotifcation.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Apply rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, message: 'Rate limit exceeded. Please wait and try again later.' },
});
app.use('/notificationTele', apiLimiter);


app.post('/notificationTele', async (req, res) => {
  const { number, message } = req.body;
  try {
    await sendBannedNotification(number, message);
    res.status(200).json({ success: true, message: 'Notification sent successfully.' });
  } catch (error) {
    console.error('Error sending expired notification:', error.message);
    res.status(500).json({ success: false, message: 'Failed to send notification.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
