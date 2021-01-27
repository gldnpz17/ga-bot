const { config } = require('dotenv/types');
const Models = require('../models/models');

module.exports.replyToMessage = async (groupChatId, message) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig.configs.length !== 0) {
    let configIndex = chatConfig.configs.findIndex(config => (new RegExp(config.regex)).test(message))
    
    if (configIndex !== -1) {
      console.log(`Replied to \'${message}\' with \'${chatConfig.configs[configIndex]}\'.`);
      return chatConfig.configs[configIndex];
    } else {
      return null;
    }
  } else {
    return null;
  }
}