const Models = require('../models/models');

module.exports.replyToMessage = async (groupChatId, message) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig.configs.length !== 0) {
    chatConfig.configs.map(config => {
      let regex = new RegExp(config.regex);

      if (regex.test(message)) {
        console.log(`Replied to \'${message}\' with \'${config.reply}\'.`)

        return config.reply;
      }
    });
  }

  return null;
}