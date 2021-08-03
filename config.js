const config = {
  environment: process.env.NODE_ENV,
  mongoDbUri: process.env.MONGODB_URI,
  port: (process.env.HTTP_PORT !== null || process.env.HTTP_PORT !== undefined) ? parseInt(process.env.HTTP_PORT) : 80,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  botName: process.env.BOT_NAME,
  fileArchiveDirectory: process.env.FILE_ARCHIVE_DIRECTORY ?? '/var/lib/gabot',
  serverDomainName: process.env.SERVER_DOMAIN_NAME ?? 'gabot.gldnpz.com',
  bcryptHashRounds: process.env.BCRYPT_HASH_ROUNDS ? parseInt(process.env.BCRYPT_HASH_ROUNDS) : 32
}

module.exports = config;