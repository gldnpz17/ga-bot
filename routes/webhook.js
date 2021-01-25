const config = require('./config');

let express = require('express');
let router = express.Router();

const line = require('@line/bot-sdk');
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}

const Models = require('../models/models');

router.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  req.body.events.map(event => {
    
  });
});