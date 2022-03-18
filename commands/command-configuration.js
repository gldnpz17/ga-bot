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
const schedulescraperUseCase = require('../use-cases/schedule-scraper');

const { measurePerformanceAsync } = require('../common/measure-performance');

const line = require('@line/bot-sdk');
const axios = require('axios').default;

const { archiveFile, calculateUsage } = require('../use-cases/archive-file');
const authenticationUseCase = require('../use-cases/authentication');
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

  let queryStartTime = performance.now()
  let messages = await configureUnunsendUseCase.dumpUnunsend(event.source.groupId, Number.parseInt(amount));
  let queryEndTime = performance.now()

  let reply = '';
  messages.forEach(message => {
    let date = new Date(message.timestamp + 7*3600*1000).toUTCString();
    reply += `[${date}+7] @${message.username}: ${message.text}\n`
  });
  
  if (reply === '') {
    reply = 'No unsent messages to show.';
  }

  reply += `\nQuery completed in ${queryEndTime - queryStartTime} ms.`;
  
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: reply
  });
});

// Delete ununsent messages.
bot.addFunctionality((event) => event.command?.name === 'unununsend', async (event) => {
  let amount = event.command.args[0];
  let reply = await configureUnunsendUseCase.popUnunsend(event.source.groupId, Number.parseInt(amount), event.source.userId);
  
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `Unununsent ${reply.count} message(s).\n${reply.notes}`
  });
});

// Get schedulescraper by name.
bot.addFunctionality((event) => event.command?.name === 'jadwalkuliah' || event.command?.name === "jk", async (event) => {
  let name = event.command.args?.join(" ");

  let reply = await schedulescraperUseCase.search(event.source.groupId, name);
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: reply
  });
});

// Add schedulescraper batch command.
bot.addFunctionality((event) => event.command?.name === 'add-jadwalkuliah', async (event) => {
  let items = JSON.parse(event.command.body);

  let reply = await schedulescraperUseCase.addProfile(event.source.groupId, items);
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: reply
  });
});

// Delete schedulescraper batch command.
bot.addFunctionality((event) => event.command?.name === 'remove-jadwalkuliah', async (event) => {
  let name = event.command.args.join(" ");

  let reply = await schedulescraperUseCase.removeProfile(event.source.groupId, name);
  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: reply
  });
});

// Set custom group key
bot.addFunctionality(({ command }) => command?.name === 'set-group-key', async (event) => {
  const [newKey] = event.command.args;

  // Validate first (FIXME: This regex is still so small and dumb and wildly incomplete)
  if (!/^[\w-]{8,64}$/.test(newKey)) {
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      text: 'Currently, group key can only contain alphanumeric characters and the "-" symbol. Key must be longer than 8 characters and no more than 64 characters.'
    });
    
    return;
  }

  await authenticationUseCase.resetKey(event.source.groupId, newKey);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: 'The key for this group has been reset!'
  });
});

// Auto-generate new random group key/password
bot.addFunctionality(({ command }) => command?.name === 'generate-random-group-key', async (event) => {
  console.log(`Automatically generating a random new key for group: ${event.source.groupId}`);
  let key = await authenticationUseCase.resetKey(event.source.groupId);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `The key for this group has been reset to a randomly-generated value!\n\nThis key below is equivalent to this group chat\'s password. Please keep it safe :)\nKey: ${key}`
  });
});

// Handle the old command calls
bot.addFunctionality(({ command }) => command?.name === 'generate-key', async ({ replyToken }) => {
  await lineClient.replyMessage(replyToken, {
    type: 'text',
    text: 'The bot now supports setting a custom group key. Please use the new `@gb set-group-key <new-key>` command, or `@gb generate-random-group-key` for the old behavior (randomly-generated group key).'
  });
});

// Revoke auth sessions.
bot.addFunctionality(event => event.command?.name === 'revoke-auth-sessions', async (event) => {
  await authenticationUseCase.revokeAuthSessions(event.source.groupId);

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `Auth sessions revoked. Users are now logged out from all devices.`
  });
});

// Get archive size.
bot.addFunctionality(event => event.type === 'message' && event.command?.name === 'check-storage-use', async (event) => {
  let { result, timeMillis } = await measurePerformanceAsync(async () => await calculateUsage(event.source.groupId));

  await lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: `File archive storage use: ${result.totalSize} MB (${result.fileCount} file(s)).\nCalculation time: ${timeMillis} ms.`
  });
});

// Send an XKCD image directly from the URL
bot.addFunctionality(({ command }) => command?.name === 'get-xkcd', async ({ replyToken, command }) => {
  const [comicNumber] = command.args;

  try {
    const { data: {
      img: comicImgUrl,
      alt: comicAltText
    }} = await axios.get(`https://xkcd.com/${comicNumber}/info.0.json`);

    await lineClient.replyMessage(replyToken, [
      {
        type: 'image',
        originalContentUrl: comicImgUrl,
        previewImageUrl: comicImgUrl // Keep it the same since the size is still well below 1 MB
      },
      {
        type: 'text',
        text: `Alt text: "${comicAltText}"`
      }
    ]);
  }
  catch (err) {
    if (!err.response) {
      throw err;
    }
  
    await lineClient.replyMessage(replyToken, {
      type: 'text',
      text: err.response.status === 404
        ? `XKCD comic #${comicNumber} not found`
        : `An error occured in obtaining XKCD #${comicNumber}`
    });
  }
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

// Archive files.
bot.addFunctionality(event => event.type === 'message' && ['image', 'video', 'audio', 'file'].includes(event.message.type), async (event) => {
  let fileId = await archiveFile(event.source.groupId, event.message.id, event.timestamp, event.message?.fileName);
  
  await lineClient.replyMessage(event.replyToken, {
    type: 'flex',
    altText: 'Open to see archived media',
    contents: {
      type: 'bubble',
      size: 'nano',
      body: {
        type: 'box',
        layout: 'horizontal',
        paddingAll: 'sm',
        contents: [
          {
            type: 'text',
            text: 'Archived →',
            align: 'center',
            size: 'xxs',
            color: '#1976D2',
            weight: 'bold',
            action: {
              type: 'uri',
              label: 'Archive URL',
              uri: `https://${config.serverDomainName}/archive/${fileId}`
            }
          }
        ]
      }
    }
  });
});

// Reply to messages.
bot.addFunctionality((event) => event.type === 'message' && event.message.type === 'text', async (event) => {  
  await configureUnunsendUseCase.logMessage(event.timestamp, event.source, event.message);

  const reply = await processMessageUseCase.replyToMessage(event.source.groupId, event.message.text);

  console.log(`Received reply: ${reply.text ?? reply}. Sending...`);
  if (reply !== null) {
    console.log(`Replying to message. replyToken: ${event.replyToken}. reply: ${reply.text ?? reply}`);
    
    await lineClient.replyMessage(event.replyToken, {
      type: 'text',
      ...(reply.emojis && reply.text ? reply : {
        text: reply
      })
    });
  }
});

module.exports.bot = bot;
