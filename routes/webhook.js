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
const ApplicationError = require('../common/application-error');

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
        await configureBotUseCase.initializeConversation(groupId);

        lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: '[Bot initialization complete]\nHello there! o/\n\nType `@BacodBot help` if you need help.'
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
              text: JSON.stringify(result, null, 2)
            });
            break;
  
          case 'remove-configuration':
            console.log(`Attempting to remove configuration ${event.command.value}`);
            await configureBotUseCase.removeConfiguration(groupId, event.command.value);
  
            lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: 'Configuration removed.'
            });
            break;

          case 'help':
            lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: 'How to use:\nhttps://github.com/gldnpz17/bacod-bot\n\nRegex article:\nhttps://en.wikipedia.org/wiki/Regular_expression'
            });
            break;

          default: 
            lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: 'Command unknown. Type `@BacodBot help` if you need some help.'
            });
            break;
        }
      } else if (event.type === 'message' && event.message.type === 'text') {
        let reply = await processMessageUseCase.replyToMessage(groupId, event.message.text);

        console.log(`Received reply: ${reply}. Sending...`);
        if (reply !== null) {
          console.log(`Replying to message. replyToken: ${event.replyToken}. reply: ${reply}`);
          lineClient.replyMessage(event.replyToken, {
            type: 'text',
            text: reply
          });
        }
      }

      return;
    } catch(err) {
      console.log(err.message);
      console.log(JSON.stringify(err.stack));

      if (err instanceof ApplicationError) {
        lineClient.replyMessage(event.replyToken, {
          type: 'text',
          text: err.message
        });
      }

      return;
    }
  });
});

module.exports = router;