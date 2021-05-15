const Models = require('../models/models');

module.exports.setNickname = async (groupChatId, nickname) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig !== null || chatConfig !== undefined) {
    chatConfig.nickname = nickname;

    await chatConfig.save();

    console.log(`Nickname set. groupId: ${groupChatId}, nickname: ${nickname}.`);
  }
};