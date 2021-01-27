const { config } = require('dotenv/types');
const Models = require('../models/models');

module.exports.replyToMessage = async (groupChatId, message) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig.configs.length !== 0) {
    let configIndex = chatConfig.configs.findIndex(config => {
      let regex = new RegExp(config.regex);

      if (regex.test(message)) {
        console.log(`Replied to \'${message}\' with \'${config.reply}\'.`);

        return true;
      }
    });

    return (configIndex === -1) ? chatConfig.configs[configIndex] : null;
  } else {
    return null;
  }
}