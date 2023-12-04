# Telegram Notification Bot

This Node.js application sends notifications to a Telegram group using a Telegram bot.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

## Installation

```
git clone https://github.com/yourusername/telegram-notification-bot.git
cd telegram-notification-bot
npm install
```
Create a .env file in the project root:
```
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GROUP_CHAT_ID=@your_group_chat
```
# Usage
For the start the bot you can just run it in the Terminal
```
node bot.js
```
Bot will run on http://localhost:3000.

# API Endpoint
Endpoint: POST /sendnotif
Request Body: JSON object with an optional message property.
Example using cURL:

```
curl -X POST -H "Content-Type: application/json" -d '{"message": "Custom notification"}'
```
Or you can just run it on postman
```
http://localhost:3000/sendnotif
```

