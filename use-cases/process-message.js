const Models = require('../models/models');

module.exports.replyToMessage = async (groupChatId, message) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig.configs.length !== 0) {
    const stringToRegex = (input) => {
      // Parse input
      var m = input.match(/(\/?)(.+)\1([a-z]*)/i);

      // Invalid flags
      if (m[3] && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(m[3])) {
          return RegExp(input);
      }

      // Create the regular expression
      return new RegExp(m[2], m[3]);
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