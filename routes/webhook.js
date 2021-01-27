const config = require('../config');

let express = require('express');
let router = express.Router();

const line = require('@line/bot-sdk');
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}
const lineClient = new line.Client(lineConfig);

const configureBotUseCase = require('../use-cases/configure-bot');
const processMessageUseCase = require('../use-cases/process-message');
const { commandParser } = require('../middlewares/command-parser');
const { signatureValidator } = require('../middlewares/signature-validator');
const { requestLogger } = require('../middlewares/request-logger');

router.post('/', async (req, res) => {
  req.body.events.map(async (event) => {
    let groupId = event.source.groupId;
    if (groupId === null) {
      lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: 'This bot only works in group chats.'
      });

      return;
    }
    try {
      if (event.type === 'join') {
        configureBotUseCase.initializeConversation(groupId);

        lineClient.pushMessage(groupId, {
          type: 'text',
          text: 'Hello there! o/\n\n The guide on how to use this bot is in the github repo: https://github.com/gldnpz17/bacod-bot'
        });
      } else if (event.type === 'leave') {
        configureBotUseCase.removeConversation(groupId);
      } else if (event.command !== null && event.command !== undefined) {
        switch (event.command.name) {
          case 'add-configuration':
            await configureBotUseCase.addConfiguration(groupId, JSON.parse(event.command.body));
            
            lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: 'Configuration saved.'
            });
            break;
  
          case 'list-configurations':
            let result = await configureBotUseCase.listConfigurations(groupId);
  
            lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: JSON.stringify(result)
            });
            break;
  
          case 'remove-configuration':
            await configureBotUseCase.removeConfigurations(groupId, event.command.value);
  
            lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: 'Configuration removed.'
            });
            break;

          default: 
            lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: 'Command unknown.'
            });
            break;
        }
      } else if (event.type === 'message' && event.message.type === 'text') {
        reply = await processMessageUseCase.replyToMessage(event.message.text);

        if (reply !== null) {
          lineClient.replyMessage(event.replyToken, {
            type: 'text',
            text: reply
          });
        }
      }

      return;
    } catch(err) {
      console.log(err.message);

      return;
    }
  });
});

module.exports = router;