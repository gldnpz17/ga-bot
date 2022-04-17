const Models = require('../models/models');

module.exports.getNickname = async (groupChatId) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId }).exec();

  if (chatConfig !== null && (chatConfig.nickname !== null || chatConfig.nickname !== undefined)) {
    return chatConfig.nickname;
  } else {
    return null;
  }
};