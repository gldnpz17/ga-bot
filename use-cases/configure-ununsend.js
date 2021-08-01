const ApplicationError = require('../common/application-error');
const Models = require('../models/models');
const axios = require('axios').default;
const config = require('../config');

const getGroupChatMessageHistory = async (groupChatId) => {
  let messageHistory = await Models.GroupChatMessageHistory.findOne({ groupChatId: groupChatId }).exec();
  if (messageHistory === null || messageHistory == undefined) {
    // If no existing message history, create one.
    let newMessageHistory = new Models.GroupChatMessageHistory({
      groupChatId: groupChatId,
      messages: [],
      unsentMessages: []
    });

    newMessageHistory.save((err, doc) => {
      console.log(`Initialized new message history. doc: ${doc}`);
    });
    
    messageHistory = newMessageHistory
  }

  return messageHistory;
};

const getUsername = async (groupId, userId) => {
  try {
    let response = await axios.get(`https://api.line.me/v2/bot/group/${groupId}/member/${userId}`, {
      headers: {
        'Authorization': `Bearer ${config.channelAccessToken}`
      }
    });
  
    return response.data.displayName;
  } catch(error) {
    throw new ApplicationError('Error fetching username.');
  }
}

const sortByTimestamp = (first, second) => {
  if (first.timestamp < second.timestamp) {
    return -1;
  } else if (first.timestamp > second.timestamp) {
    return 1;
  } else {
    return 0;
  }
}

module.exports.dumpUnunsend = async (groupChatId, amount) => {
  let messageHistory = await getGroupChatMessageHistory(groupChatId);
  let unsentMessages = messageHistory.unsentMessages;
  
  if (amount > 0 && amount < unsentMessages.length) {
    unsentMessages = unsentMessages.slice(-amount);
  }

  // Get username.
  for (let index = 0; index < unsentMessages.length; index++) {
    let message = unsentMessages[index];
    message.username = await getUsername(groupChatId, message.userId);    
  }
  
  return unsentMessages;
};

module.exports.pushUnunsend = async (groupChatId, messageId) => {
  let messageHistory = await getGroupChatMessageHistory(groupChatId);
  
  let unsentMessage = messageHistory.messages.find(message => message.id === messageId);
  if (unsentMessage === null || unsentMessage === undefined) {
    throw new ApplicationError(`Cannot find a message with the id ${messageId}.`);
  }
  
  messageHistory.unsentMessages.push(unsentMessage);
  messageHistory.unsentMessages.sort(sortByTimestamp);
  
  // delete excess unsent messages
  let maxMessageCount = 100;
  while (messageHistory.unsentMessages.length > maxMessageCount) {
    messageHistory.unsentMessages.shift();
  }
  
  await messageHistory.save();
};

module.exports.popUnunsend = async (groupChatId, amount) => {
  let messageHistory = await getGroupChatMessageHistory(groupChatId);
  let unsentMessages = messageHistory.unsentMessages;
  
  while (amount > 0) {
    unsentMessages.pop();
    amount--;
  }
  
  await messageHistory.save();
};

module.exports.logMessage = async (timestamp, source, message) => {
  let messageHistory = await getGroupChatMessageHistory(source.groupId);
  
  messageHistory.messages.push({
    id: message.id,
    timestamp: timestamp,
    userId: source.userId,
    text: message.text
  });
  
  // delete older messages
  let timeout = 3600*1000;
  let maxMessageCount = 100;
  while (Date.now()-timeout > messageHistory.messages[0].timestamp && messageHistory.messages.length > maxMessageCount) {
    messageHistory.messages.shift();
  }
  
  await messageHistory.save();
};
