require('dotenv').config();

const config = require('./config');

const mongoose = require('mongoose');
mongoose.connect(config.mongoDbUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

const Models = require('./models/models');

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const statusRouter = require('./routes/status');
const apiRouter = require('./routes/api');
const archiveRouter = require('./routes/archive');
const { requestLogger } = require('./middlewares/request-logger');

//const configureScheduledTasksUseCase = require('./use-cases/configure-scheduled-tasks');
const { mkdir, mkdirSync } = require('fs');
const { WebhookRouter } = require('./routes/webhook');
const { LineMessagingService, LineWebhookHandler, MockLineMessagingService, MockLineWebhookHandler } = require('./services/line-messaging-service');
const { BotCustomizationUseCase } = require('./use-cases/bot-customization');

// Initialize directories.
mkdirSync(config.fileArchiveDirectory, { recursive: true });

// Initialize scheduled tasks.
/*Models.GroupChatConfig.find({}).exec().then(groupChatConfigs => {
  groupChatConfigs.map(groupChatConfig => {
    const { groupChatId } = groupChatConfig;
  
    groupChatConfig.configs.map(configItem => {
      configureScheduledTasksUseCase.scheduleMessage(groupChatId, configItem);
    });
  });
});*/

const app = express();

const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}

console.log(`Environment : ${config.environment}`)

const messagingService = config.environment === 'production' 
  ? new LineMessagingService(lineConfig, new BotCustomizationUseCase())
  : new MockLineMessagingService()
const webhookHandler = config.environment === 'production' 
  ? new LineWebhookHandler(messagingService, lineConfig)
  : new MockLineWebhookHandler(messagingService)

app.use(logger('dev'));
app.use('/webhook', (new WebhookRouter(webhookHandler)).getRouter());
app.use('/status', statusRouter);
app.use('/api', apiRouter);
app.use('/archive', archiveRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((err, req, res, next) => {
  console.log(err.message);
  console.log(JSON.stringify(err.stack));
});

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

module.exports = app;
