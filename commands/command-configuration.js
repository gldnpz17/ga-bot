const config = require('../config');

const { BotCommand } = require('../common/bot-command');

const ApplicationError = require('../common/application-error');

const configureBotUseCase = require('../use-cases/configure-bot');
const processMessageUseCase = require('../use-cases/process-message');
const { convertCoordinates } = require('../use-cases/coordinate-conversion');
const setNicknameUseCase = require('../use-cases/set-nickname');
const setCounterDataUseCase = require('../use-cases/set-counter-data');
const getCounterDataUseCase = require('../use-cases/get-counter-data');
const configureUnunsendUseCase = require('../use-cases/configure-ununsend');

const line = require('@line/bot-sdk');
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}
const lineClient = new line.Client(lineConfig);

const bot = new BotCommand();

// Error handler.
bot.err(async (event, err) => {
  if (err instanceof ApplicationError) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: err.message
    });
  } else {
    console.log('An error occured in one of the commands.');
    console.log(err.message);
    console.log(JSON.stringify(err.stack));
  }
});

// Initialize group chat.
bot.addFunctionality((event) => event.type === 'join', async (event) => {
  await configureBotUseCase.initializeConversation(event.source.groupId);
    
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: '[Bot initialization complete]\nHello there! o/\n\nType `@BacodBot help` if you need help.'
  });
});

// Erase data when kicked out of group chat.
bot.addFunctionality((event) => event.type === 'leave', async (event) => {
  configureBotUseCase.removeConversation(event.source.groupId);
});

// Coordinate conversion.
bot.addFunctionality((event) => /^konversi .*/.test(event.command?.raw), async (event) => {
  console.log(`converting coordinates. argument: ${event.command.raw}`);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: convertCoordinates(event.command.raw)
  });
});

// Add configuration.
bot.addFunctionality((event) => event.command?.name === 'add-configuration', async (event) => {
  await configureBotUseCase.addConfiguration(event.source.groupId, JSON.parse(event.command.body));

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'Configuration saved.'
  });
});

// List configurations.
bot.addFunctionality((event) => event.command?.name === 'list-configurations', async (event) => {
  let result = await configureBotUseCase.listConfigurations(event.source.groupId);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: JSON.stringify(result, null, 2)
  });
});

// Remove configurations.
bot.addFunctionality((event) => event.command?.name === 'remove-configuration', async (event) => {
  console.log(`Attempting to remove configuration ${event.command.args[0]}`);
  await configureBotUseCase.removeConfiguration(event.source.groupId, event.command.args[0]);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'Configuration removed.'
  });
});

// Set nickname.
bot.addFunctionality(event => event.command?.name === 'set-nickname', async (event) => {
  let nickname = event.command.args[0];

  console.log(`Attempting to set nickname ${nickname} for group ${event.source.groupId}.`);

  await setNicknameUseCase.setNickname(event.source.groupId, nickname);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `Nickname set to ${nickname}.`
  });
});

// Initialize counter.
bot.addFunctionality(event => event.command?.name === 'initialize-counter' || event.command?.name === 'ic', async (event) => {
  let label = event.command.args[0];
  
  console.log(`Attempting to initialize ${label} counter for ${event.source.userId}.`);

  await setCounterDataUseCase.initializeCounter(event.source.userId, label);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `${label} counter initialized for user ${event.source.userId}.`
  });
});

// Set counter value.
bot.addFunctionality(event => event.command?.name === 'set-counter' || event.command?.name === 'sc', async (event) => {
  let label = event.command.args[0];
  let amount = event.command.args[1];

  console.log(`Attempting to set ${label} counter to ${amount} for user ${event.source.userId}.`);

  await setCounterDataUseCase.setCounterValue(event.source.userId, amount, label);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `${label} counter value set to ${amount}.`
  });
});

// Add counter.
bot.addFunctionality(event => event.command?.name === 'add-counter' || event.command?.name === 'ac', async (event) => {
  let label = event.command.args[0];
  let amount = event.command.args[1];

  console.log(`Attempting to increase counter ${label} by ${amount} for user ${event.source.userId}`);

  await setCounterDataUseCase.incrementCounter(event.source.userId, amount, label);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `Added ${amount} to the ${label} counter.`
  });
});

// Reset counter.
bot.addFunctionality(event => event.command?.name === 'reset-counter' || event.command?.name === 'rc', async (event) => {
  let label = event.command.args[0];
  
  console.log(`Attempting to reset the ${label} counter for user ${event.source.userId}`);

  await setCounterDataUseCase.resetCounter(event.source.userId, label);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `${label} counter reset.`
  });
});

// View counter value
bot.addFunctionality(event => event.command?.name === 'view-counter' || event.command?.name === 'vc', async (event) => {
  let label = event.command.args[0]

  console.log(`Attempting to show ${label} counter's value for user ${event.source.userId}`);

  let pity = await getCounterDataUseCase.getCurrentValue(event.source.userId, label);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `${label} counter's value: ${pity}`
  });
});

// View counter history
bot.addFunctionality(event => event.command?.name === 'history-counter' || event.command?.name === 'hc', async (event) => {
  let label = event.command.args[0];

  console.log(`Attempting to show ${label} counter's history for user ${event.source.userId}`);

  let histories = await getCounterDataUseCase.getHistories(event.source.userId, label);

  let message = '';
  histories.map(history => {
    message += `${history.note}\n`;
  });

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: message
  });
});

// Un-unsend
bot.addFunctionality((event) => event.type === 'unsend', async (event) => {
  await configureUnunsendUseCase.pushUnunsend(event.source.groupId, event.unsend.messageId);
  
  console.log(`message ${event.unsend.messageId} is added to the unsend log`);
});

// Show unsent messages
bot.addFunctionality((event) => event.command?.name === 'ununsend', async (event) => {
  let amount = event.command.args[0];
  let messages = await configureUnunsendUseCase.dumpUnunsend(event.source.groupId, Number.parseInt(amount));
  
  let reply = '';
  messages.forEach(message => {
    let date = new Date(message.timestamp).toUTCString();
    reply += `[${date}] @${message.username}: ${message.text}\n`
  });
  
  if(reply !== null) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: reply
    });
  }
});

// Delete ununsent messages
bot.addFunctionality((event) => event.command?.name === 'unununsend', async (event) => {
  let amount = event.command.args[0];
  await configureUnunsendUseCase.popUnunsend(event.source.groupId, Number.parseInt(amount));
  
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `Unununsent ${Number.parseInt(amount)} message(s)`
  });
});

// Show help.
bot.addFunctionality((event) => event.command?.name === 'help', async (event) => {
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'How to use:\nhttps://github.com/gldnpz17/bacod-bot\n\nRegex article:\nhttps://en.wikipedia.org/wiki/Regular_expression'
  });
});

// Unknown command.
bot.addFunctionality((event) => event.command !== null && event.command !== undefined, async (event) => {
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'Command unknown. Type `@BacodBot help` if you need some help.'
  });
});

// Reply to messages.
bot.addFunctionality((event) => event.type === 'message' && event.message.type === 'text', async (event) => {
  await configureUnunsendUseCase.logMessage(event.timestamp, event.source, event.message);
  
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
