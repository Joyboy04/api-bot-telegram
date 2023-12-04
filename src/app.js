import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve('./.env') });

import express from 'express';
import { sendBannedNotification, sendExpiredNotification } from './routes/routesNotifcation.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/notificationsBanned', async (req, res) => {
  try {
    const result = await sendBannedNotification(req.body.message);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.post('/notificationsExpired', async (req, res) => {
  try {
    const result = await sendExpiredNotification(req.body.message);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
