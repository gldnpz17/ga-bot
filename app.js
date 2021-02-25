require('dotenv').config();

const config = require('./config');

const mongoose = require('mongoose');
mongoose.connect(config.mongoDbUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

const Models = require('./models/models');

const line = require('@line/bot-sdk');
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let webhookRouter = require('./routes/webhook');
const { rawBodyMiddleware } = require('./middlewares/raw-body');
const { requestLogger } = require('./middlewares/request-logger');
const { signatureValidator } = require('./middlewares/signature-validator');
const { commandParser } = require('./middlewares/command-parser');

const configureScheduledTasksUseCase = require('./use-cases/configure-scheduled-tasks');

// Initialize scheduled tasks
Models.GroupChatConfig.find({}).exec().then(groupChatConfigs => {
  groupChatConfigs.map(groupChatConfig => {
    let groupChatId = groupChatConfig.groupChatId;
  
    groupChatConfig.configs.map(configItem => {
      configureScheduledTasksUseCase.scheduleMessage(groupChatId, configItem);
    });
  });
});

var app = express();

app.use(logger('dev'));
app.use(line.middleware(lineConfig));
app.use(requestLogger);
app.use(commandParser);
app.use('/webhook', webhookRouter);
app.use((err, req, res, next) => {
  console.log(err.message);
  console.log(JSON.stringify(err.stack));
});

module.exports = app;
