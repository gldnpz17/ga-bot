const Models = require('../models/models');

class BotCustomizationUseCase {
  async getNickname(groupChatId) {
    let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId }).exec();

    if (chatConfig !== null && (chatConfig.nickname !== null || chatConfig.nickname !== undefined)) {
      return chatConfig.nickname;
    } else {
      return null;
    }
  }
}

module.exports = { BotCustomizationUseCase }