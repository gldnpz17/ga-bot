const config = {
  environment: process.env.NODE_ENV,
  mongoDbUri: process.env.MONGODB_URI,
  port: parseInt(process.env.HTTP_PORT) ?? 80,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  botName: process.env.BOT_NAME
}

module.exports = config;