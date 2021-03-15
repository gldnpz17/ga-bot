const config = require('../config');

const { BotCommand } = require('../common/bot-command');

const ApplicationError = require('../common/application-error');

const configureBotUseCase = require('../use-cases/configure-bot');
const processMessageUseCase = require('../use-cases/process-message');
const { convertCoordinates } = require('../use-cases/coordinate-conversion');

const line = require('@line/bot-sdk');
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}
const lineClient = new line.Client(lineConfig);

const bot = new BotCommand();

bot.err(async (event, err) => {
  if (err instanceof ApplicationError) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: err.message
    });
  } else {
    console.log('an error occured in one of the commands.');
    console.log(JSON.stringify(err));
  }
});

bot.addFunctionality((event) => event.type === 'join', async (event) => {
  await configureBotUseCase.initializeConversation(event.source.groupId);
    
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: '[Bot initialization complete]\nHello there! o/\n\nType `@BacodBot help` if you need help.'
  });
});

bot.addFunctionality((event) => event.type === 'leave', async (event) => {
  configureBotUseCase.removeConversation(event.source.groupId);
});

bot.addFunctionality((event) => /^konversi .*/.test(event.command.raw), async (event) => {
  console.log(`converting coordinates. argument: ${event.command.raw}`);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: convertCoordinates(event.command.raw)
  });
});

bot.addFunctionality((event) => event.command.name === 'add-configuration', async (event) => {
  await configureBotUseCase.addConfiguration(event.source.groupId, JSON.parse(event.command.body));

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'Configuration saved.'
  });
});

bot.addFunctionality((event) => event.command.name === 'list-configurations', async (event) => {
  let result = await configureBotUseCase.listConfigurations(event.source.groupId);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: JSON.stringify(result, null, 2)
  });
});

bot.addFunctionality((event) => event.command.name === 'remove-configuration', async (event) => {
  console.log(`Attempting to remove configuration ${event.command.args[0]}`);
  await configureBotUseCase.removeConfiguration(event.source.groupId, event.command.args[0]);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'Configuration removed.'
  });
});

bot.addFunctionality((event) => event.command.name === 'help', async (event) => {
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'How to use:\nhttps://github.com/gldnpz17/bacod-bot\n\nRegex article:\nhttps://en.wikipedia.org/wiki/Regular_expression'
  });
});

bot.addFunctionality((event) => event.command !== null && event.command !== undefined, async (event) => {
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'Command unknown. Type `@BacodBot help` if you need some help.'
  });
});

bot.addFunctionality((event) => event.type === 'message' && event.message.type === 'text', async (event) => {
  let reply = await processMessageUseCase.replyToMessage(event.source.groupId, event.message.text);

  console.log(`Received reply: ${reply}. Sending...`);
  if (reply !== null) {
    console.log(`Replying to message. replyToken: ${event.replyToken}. reply: ${reply}`);
    
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: reply
    });
  }
});

module.exports.bot = bot;