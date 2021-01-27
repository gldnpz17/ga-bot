const Models = require('../models/models');

module.exports.replyToMessage = async (groupChatId, message) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig.configs.length !== 0) {
    const stringToRegex = (string) => {
      var match = /^\/(.*)\/([a-z]*)$/.exec(string);
      return new RegExp(match[1], match[2]);
    };

    let configIndex = chatConfig.configs.findIndex(config => stringToRegex(config.regex).test(message));
    
    if (configIndex !== -1) {
      console.log(`Replied to \'${message}\' with \'${chatConfig.configs[configIndex].reply}\'.`);
      
      return chatConfig.configs[configIndex].reply;
    } else {
      return null;
    }
  } else {
    return null;
  }
}