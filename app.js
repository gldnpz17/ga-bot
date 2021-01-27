require('dotenv').config();

const config = require('./config');

const mongoose = require('mongoose');
mongoose.connect(config.mongoDbUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

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

var app = express();

app.use(logger('dev'));
app.use(line.middleware(lineConfig));
app.use(requestLogger);
app.use(rawBodyMiddleware);
//app.use(signatureValidator);
app.use(commandParser);
app.use('/webhook', webhookRouter);
app.use(function(err, req, res, next) {
  console.log(err.stack);
});

app.listen(config.port, () => {
  console.log(`App started. Listening to port ${config.port}`);
  console.log(`Configs: ${JSON.stringify(config)}`);
});

module.exports = app;
