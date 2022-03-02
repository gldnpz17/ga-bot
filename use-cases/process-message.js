const Models = require('../models/models');

module.exports.replyToMessage = async (groupChatId, message) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig.configs.length !== 0) {
    const stringToRegex = (input) => {
      // Parse input
      var [,, pattern, flags] = input.match(/(\/?)(.+)\1([a-z]*)/i);

      // Invalid flags
      if (flags && !/^(?!.*?(.).*?\1)[gmixXsuUAJ]+$/.test(flags)) {
        return RegExp(input);
      }

      // Create the regular expression
      return new RegExp(pattern, flags);
    };

    let configIndex = chatConfig.configs.findIndex(config => stringToRegex(config.regex).test(message));
    
    if (configIndex !== -1) {
      const matches = message.match(stringToRegex(chatConfig.configs[configIndex].regex));
      let replacedReply = chatConfig.configs[configIndex].reply;

      // A naive method?
      for (let matchIndex = 1; matchIndex < matches.length; ++matchIndex) {
          replacedReply = replacedReply.replaceAll(`$${matchIndex}`, matches[matchIndex]);
      }

      console.log(`Replied to \'${message}\' with \'${replacedReply}\'.`);

      return replacedReply;
    } else {
      return null;
    }
  } else {
    return null;
  }
}
