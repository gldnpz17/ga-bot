const config = require('./config');

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

router.post('/', line.middleware(lineConfig), async (req, res, next) => {
  req.body.events.map(event => {
    if (event.type === 'message' && event.message?.type === 'text') {
      let regex = new RegExp(`^${config.botName}.*`);

      if (regex.test(event.message.text)) {
        try {
          let args = event.message.text.match(/(.*?)\n/)[1].split(' ');
          args.splice(0, 1);
    
          if(args.length > 0) {
            event.command = {
              name: args[0],
              value: args[--args.length],
              body: event.message.text.substr(event.message.text.indexOf('\n'))
            }
          } else {
            throw new Error(`Error parsing command. message: ${event.message.text}`);
          }
        } catch(err) {
          console.log(err);

          await lineClient.replyMessage(event.replyToken, {
            type: 'text',
            text: 'Error parsing command.'
          });
        } 
      }
    }

    next()
  });
}, async (req, res) => {
  req.body.events.map(event => {
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
      } else if (event.command !== null) {
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
      lineClient.replyMessage(event.replyToken, {
        type: 'text',
        text: err.message
      });

      return;
    }
  });
});