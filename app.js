require('dotenv').config();

const config = require('./config');

const mongoose = require('mongoose');
mongoose.connect(config.mongoDbUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

const Models = require('./models/models');

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

let webhookRouter = require('./routes/webhook');
let statusRouter = require('./routes/status');
const { requestLogger } = require('./middlewares/request-logger');

const configureScheduledTasksUseCase = require('./use-cases/configure-scheduled-tasks');
const { mkdir, mkdirSync } = require('fs');

// Initialize directories.
mkdirSync(config.fileArchiveDirectory, { recursive: true });

// Initialize scheduled tasks.
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
app.use('/webhook', webhookRouter);
app.use('/status', statusRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use((err, req, res, next) => {
  console.log(err.message);
  console.log(JSON.stringify(err.stack));
});

app.listen(config.port, () => {
  console.log(`Server started on port ${config.port}`);
});

module.exports = app;
