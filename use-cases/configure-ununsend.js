const ApplicationError = require('../common/application-error');
const Models = require('../models/models');
const axios = require('axios').default;
const config = require('../config');
const { measurePerformanceAsync } = require('../common/measure-performance');

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

module.exports.dumpUnunsend = async (groupChatId, amount) => {
  // Fetch unsent messages.
  let messages = await measurePerformanceAsync('QueryMessageHistory', () => {
    let query = Models.MessageHistory
      .aggregate([
        {
          '$match': {
            'groupChatId': groupChatId, 
            'unsent': true
          }
        }, {
          '$sort': {
            'timestamp': -1
          }
        }, {
          '$unset': [
            'groupChatId', 'messageId', '_id', '__v', 'unsent'
          ]
        }
      ])
    
    if (amount) {
      query.limit(amount);
    }

    return await query.exec();
  })

  if (!messages) {
    throw new ApplicationError('No unsent messages to show.')
  }

  messages.reverse()
    
  // Get username.
  await measurePerformanceAsync('FetchUsernames', () => {
    let usernameCache = {}
    for (let index = 0; index < messages.length; index++) {
      let message = messages[index];
      
      if (!usernameCache[message.userId]) {
        usernameCache[message.userId] = await getUsername(groupChatId, message.userId);
      }
  
      message.username = usernameCache[message.userId];
    }
  })

  return messages;
};

module.exports.pushUnunsend = async (groupChatId, messageId) => {
  let unsentMessage = await Models.MessageHistory.findOne({
    messageId: messageId
  }).exec();

  if (!unsentMessage) {
    console.log(`Can't find message to mark as unsent.`);
  }

  unsentMessage.unsent = true
  await unsentMessage.save()
};

module.exports.popUnunsend = async (groupChatId, amount, initiatorId) => {
  throw new ApplicationError('Feature is a work in progress.')
  /*let messageHistory = await getGroupChatMessageHistory(groupChatId);
  
  let unsentMessages = messageHistory.unsentMessages;
  const maxUnsentAmount = unsentMessages.length;
  
  if (amount > maxUnsentAmount) {
      amount = maxUnsentAmount;
  }
  
  let temp = [];
  while (amount > 0) {
    let deletedMessage = unsentMessages.pop();
    if (deletedMessage.userId === initiatorId && Date.now() - deletedMessage.timestamp < ONE_HOUR) {
      temp.unshift(deletedMessage);
    }
    amount--;
  }
  let remainingMessages = unsentMessages.concat(temp);
  
  let successCount = maxUnsentAmount - remainingMessages.length;
  let notes = (temp.length != 0) ? `Cannot delete ${temp.length} message(s) of your own unless one hour has passed.` : '';
  
  messageHistory.unsentMessages = remainingMessages;
  await messageHistory.save();
  
  return { count: successCount, notes: notes };*/
};

module.exports.logMessage = async (timestamp, source, message) => {
  let loggedMessage = new Models.MessageHistory({
    groupChatId: source.groupId,
    messageId: message.id,
    timestamp: timestamp,
    userId: source.userId,
    text: message.text,
    unsent: false
  });

  await loggedMessage.save()
};
