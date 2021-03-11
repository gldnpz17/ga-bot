const config = require('../config');

let express = require('express');
let router = express.Router();

const line = require('@line/bot-sdk');
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}
const lineClient = new line.Client(lineConfig);

const { commandParser } = require('../middlewares/command-parser');
const { requestLogger } = require('../middlewares/request-logger');

const { bot } = require('../commands/command-configuration');

router.post('/', line.middleware(lineConfig), requestLogger, commandParser, async (req, res, next) => {
  req.body.events.map(async (event) => {
    try {
      let groupId = event.source.groupId;
      if (groupId === null) {
        await lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: 'This bot only works in group chats.'
        });
  
        return;
      }
      
      await bot.execute(event);

      next();
    } catch(err) {
      next(err);
    }
  });
});

module.exports = router;