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
const { JoinEvent, LeaveEvent, CommandEvent, UnsendMessageEvent, ImageMessageEvent, VideoMessageEvent, AudioMessageEvent, FileMessageEvent, TextMessageEvent } = require('../services/line-messaging-service')

const { measurePerformanceAsync } = require('../common/measure-performance');

const line = require('@line/bot-sdk');
const axios = require('axios').default;

// const Kuroshiro = require('kuroshiro').default;
// const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji').default;

const { archiveFile, calculateUsage } = require('../use-cases/archive-file');
const authenticationUseCase = require('../use-cases/authentication');

const bot = new BotCommand();

// Error handler.
bot.err(async (event, err) => {
  if (err instanceof ApplicationError && event instanceof MessageEvent) {
    event.replyText(err.message)
  } else {
    console.log('An error occured in one of the commands.');
    console.log(err.message);
    console.log(JSON.stringify(err.stack));
  }
});

// Initialize group chat.
bot.registerFunctionality([JoinEvent])(null, async (event) => {
  await configureBotUseCase.initializeConversation(event.groupChatId);
  
  await event
    .reply()
    .text('[Bot initialization complete]\nHello there! o/\n\nType `@BacodBot help` if you need help.')
    .send()
});

// Erase data when kicked out of group chat.
/*bot.registerFunctionality([LeaveEvent])(null, async (event) => {
  configureBotUseCase.removeConversation(event.source.groupId);
});*/

// Coordinate conversion.
bot.registerFunctionality([CommandEvent])(event => /^konversi .*/.test(event.command.raw), async (event) => {
  console.log(`converting coordinates. argument: ${event.command.raw}`);

  await event.reply().text(convertCoordinates(event.command.raw)).send()
});

// Add configuration.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('add-configuration'), async (event) => {
  await configureBotUseCase.addConfiguration(event.groupChatId, JSON.parse(event.command.body));

  await event.reply().text('Configuration saved.').send()
});

// List configurations.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('list-configurations'), async (event) => {
  const [number] = event.command.args;
  if (!number) {
    await event.reply().text('No amount supplied!').send()
    return;
  }

  const result = await configureBotUseCase.listConfigurations(event.source.groupId);

  await event.reply().text(JSON.stringify(result.reverse().slice(0, parseInt(number)), null, 2)).send()
});

// Remove configurations.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('remove-configuration'), async (event) => {
  console.log(`Attempting to remove configuration ${event.command.args[0]}`);
  await configureBotUseCase.removeConfiguration(event.source.groupId, event.command.args[0]);

  await event.reply().text('Configuration removed.').send()
});

// Set nickname.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('set-nickname'), async (event) => {
  let nickname = event.command.args[0];

  console.log(`Attempting to set nickname ${nickname} for group ${event.source.groupId}.`);

  await setNicknameUseCase.setNickname(event.source.groupId, nickname);

  await event.reply().text(`Nickname set to ${nickname}.`).send()
});

// Initialize counter.
bot.registerFunctionality([CommandEvent])(event => event.isCommand(['initialize-counter', 'ic']), async (event) => {
  let label = event.command.args[0];
  
  console.log(`Attempting to initialize ${label} counter for ${event.source.userId}.`);

  await setCounterDataUseCase.initializeCounter(event.source.userId, label);

  await event.reply().text(`${label} counter initialized for user ${event.source.userId}.`).send()
});

// Set counter value.
bot.registerFunctionality([CommandEvent])(event => event.isCommand(['set-counter', 'sc']), async (event) => {
  let label = event.command.args[0];
  let amount = event.command.args[1];

  console.log(`Attempting to set ${label} counter to ${amount} for user ${event.source.userId}.`);

  await setCounterDataUseCase.setCounterValue(event.source.userId, amount, label);

  await event.reply().text(`${label} counter value set to ${amount}.`).send()
});

// Add counter.
bot.registerFunctionality([CommandEvent])(event => event.isCommand(['add-counter', 'ac']), async (event) => {
  let label = event.command.args[0];
  let amount = event.command.args[1];

  console.log(`Attempting to increase counter ${label} by ${amount} for user ${event.source.userId}`);

  await setCounterDataUseCase.incrementCounter(event.source.userId, amount, label);

  await event.reply().text(`Added ${amount} to the ${label} counter.`).send()
});

// Reset counter.
bot.registerFunctionality([CommandEvent])(event => event.isCommand(['reset-counter', 'rc']), async (event) => {
  let label = event.command.args[0];
  
  console.log(`Attempting to reset the ${label} counter for user ${event.source.userId}`);

  await setCounterDataUseCase.resetCounter(event.source.userId, label);

  await event.reply().text(`${label} counter reset.`).send()
});

// View counter value
bot.registerFunctionality([CommandEvent])(event => event.isCommand(['view-counter', 'vc']), async (event) => {
  let label = event.command.args[0]

  console.log(`Attempting to show ${label} counter's value for user ${event.source.userId}`);

  let pity = await getCounterDataUseCase.getCurrentValue(event.source.userId, label);

  await event.reply().text(`${label} counter's value: ${pity}`).send()
});

// View counter history
bot.registerFunctionality([CommandEvent])(event => event.isCommand(['history-counter', 'hc']), async (event) => {
  let label = event.command.args[0];

  console.log(`Attempting to show ${label} counter's history for user ${event.source.userId}`);

  let histories = await getCounterDataUseCase.getHistories(event.source.userId, label);

  let message = '';
  histories.map(history => {
    message += `${history.note}\n`;
  });

  await event.reply().text(message).send()
});

// Un-unsend
bot.registerFunctionality([UnsendMessageEvent])(null, async (event) => {
  await configureUnunsendUseCase.pushUnunsend(event.source.groupId, event.unsend.messageId);
  
  console.log(`message ${event.unsend.messageId} is added to the unsend log`);
});

// Show unsent messages
bot.registerFunctionality([CommandEvent])(event => event.isCommand('ununsend'), async (event) => {
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
  
  await event.reply().text(reply).send()
});

// Delete ununsent messages.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('unununsend'), async (event) => {
  let amount = event.command.args[0];
  let reply = await configureUnunsendUseCase.popUnunsend(event.source.groupId, Number.parseInt(amount), event.source.userId);
  
  await event.reply().text(`Unununsent ${reply.count} message(s).\n${reply.notes}`).send()
});

// Get schedulescraper by name.
bot.registerFunctionality([CommandEvent])(event => event.isCommand(['jadwal-kuliah', 'jk']), async (event) => {
  let name = event.command.args?.join(" ");

  let reply = await schedulescraperUseCase.search(event.source.groupId, name);

  await event.reply().text(reply).send()
});

// Add schedulescraper batch command.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('add-jadwalkuliah'), async (event) => {
  let items = JSON.parse(event.command.body);

  let reply = await schedulescraperUseCase.addProfile(event.source.groupId, items);

  await event.reply().text(reply).send()
});

// Delete schedulescraper batch command.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('remove-jadwalkuliah'), async (event) => {
  let name = event.command.args.join(" ");

  let reply = await schedulescraperUseCase.removeProfile(event.source.groupId, name);

  await event.reply().text(reply).send()
});

// Set custom group key
bot.registerFunctionality([CommandEvent])(event => event.isCommand('set-group-key'), async (event) => {
  const [newKey] = event.command.args;

  // Validate first (FIXME: This regex is still so small and dumb and wildly incomplete)
  if (!/^[\w-]{8,64}$/.test(newKey)) {
    await event.replyText('Currently, group key can only contain alphanumeric characters and the "-" symbol. Key must be longer than 8 characters and no more than 64 characters.')
    return;
  }

  await authenticationUseCase.resetKey(event.groupChatId, newKey);

  await event.reply().text('The key for this group has been reset!').send()
});

// Auto-generate new random group key/password
bot.registerFunctionality([CommandEvent])(event => event.isCommand('generate-random-group-key'), async (event) => {
  console.log(`Automatically generating a random new key for group: ${event.groupChatId}`);
  let key = await authenticationUseCase.resetKey(event.groupChatId);

  await event.reply().text(`The key for this group has been reset to a randomly-generated value!\n\nThis key below is equivalent to this group chat\'s password. Please keep it safe :)\nKey: ${key}`).send()
});

// Handle the old command calls
bot.registerFunctionality([CommandEvent])(event => event.isCommand('generate-key'), async (event) => {
  await event.reply().text('The bot now supports setting a custom group key. Please use the new `@gb set-group-key <new-key>` command, or `@gb generate-random-group-key` for the old behavior (randomly-generated group key).').send()
});

// Revoke auth sessions.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('revoke-auth-sessions'), async (event) => {
  await authenticationUseCase.revokeAuthSessions(event.groupChatId);

  await event.reply().text('Auth sessions revoked. Users are now logged out from all devices.').send()
});

// Get archive size.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('check-storage-use'), async (event) => {
  let { result, timeMillis } = await measurePerformanceAsync(async () => await calculateUsage(event.groupChatId));

  await event.reply().text(`File archive storage use: ${result.totalSize} MB (${result.fileCount} file(s)).\nCalculation time: ${timeMillis} ms.`).send()
});

// Send an XKCD image directly from the URL
bot.registerFunctionality([CommandEvent])(event => event.isCommand('get-xkcd'), async event => {
  const [comicNumber] = event.command.args;

  try {
    const { data: {
      img: comicImgUrl,
      alt: comicAltText
    }} = await axios.get(`https://xkcd.com/${comicNumber}/info.0.json`);

    await event.reply().image(comicImgUrl).text(`Alt text: "${comicAltText}"`).send()
  }
  catch (err) {
    if (!err.response) {
      throw err;
    }

    await event
      .reply()
      .text(
        err.response.status === 404
          ? `XKCD comic #${comicNumber} not found`
          : `An error occured in obtaining XKCD #${comicNumber}`
      )
      .send()
  }
});

// Convert japanese characters to romaji
bot.registerFunctionality([CommandEvent])(event => event.isCommand('to-romaji'), async (event) => {
  // const jpText = event.command.args.join(' ');

  // try {
  //   const kuroshiro = new Kuroshiro();
  //   await kuroshiro.init(new KuromojiAnalyzer());

  //   await lineClient.replyMessage(event.replyToken, {
  //     type: 'text',
  //     text: await kuroshiro.convert(jpText, { to: 'romaji' })
  //   });
  // }
  // catch (err) {
  //   await lineClient.replyMessage(event.replyToken, {
  //     type: 'text',
  //     text: `Error: ${err.name} (${err.message})`
  //   });
  // }

  await event.reply().text('Error: This feature is currently disabled').send()
});

// Show help.
bot.registerFunctionality([CommandEvent])(event => event.isCommand('help'), async (event) => {
  await event.reply().text('How to use:\nhttps://github.com/gldnpz17/bacod-bot\n\nRegex article:\nhttps://en.wikipedia.org/wiki/Regular_expression').send()
});

// Unknown command.
bot.registerFunctionality([CommandEvent])(null, async (event) => {
  await event.reply().text(`Command \`${event.command.raw}\`${event.command.body ? '\n```' + event.command.body + '```\n' : ''} is unknown. Type \`@BacodBot help\` if you need some help.`).send()
});

// Archive files.
bot.registerFunctionality([ImageMessageEvent, VideoMessageEvent, AudioMessageEvent, FileMessageEvent])(null, async (event) => {
  let fileId = await archiveFile(event.groupChatId, event.messageId, event.timestamp, event.fileName);
  
  await event.reply().text(`📁️ https://${config.serverDomainName}/archive/${fileId}`).send()
});

// Reply to messages.
bot.registerFunctionality([TextMessageEvent])(null, async (event) => {  
  await configureUnunsendUseCase.logMessage(event.timestamp, event.groupChatId, event.messageId, event.userId, event.text);

  const replyObj = await processMessageUseCase.replyToMessage(event.groupChatId, event.text);

  if (replyObj !== null) {
    console.log(`Replying to message. replyToken: ${event.replyToken}. reply: ${
      replyObj.originalContentUrl
      ? `image (${replyObj.originalContentUrl})`
      : replyObj.text
    }`);

    switch(replyObj.type) {
      case 'image':
        await event.reply().image(replyObj.originalContentUrl).send()
        break
      case 'text':
        await event.reply().text(replyObj.text).send()
        break
    }
  }
});

module.exports.bot = bot;
