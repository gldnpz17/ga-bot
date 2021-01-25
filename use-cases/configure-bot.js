import Models from '../models/models';

module.exports.initializeConversation = async (groupChatId) => {
  let newChatConfig = new Models.GroupChatConfig({
    groupChatId: groupChatId
  });

  newChatConfig.save((err, doc) => {
    console.log(`Initialized new conversation. doc: ${doc}`);
  });
};

module.exports.removeConversation = async (groupChatId) => {
  await new Models.GroupChatConfig.deleteOne({ groupChatId: groupChatId }).exec();

  console.log(`Conversation removed. groupChatId: ${groupChatId}`)
};

module.exports.listConfiguration = async (groupChatId) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (chatConfig !== null) {
    console.log(`List of configs retrieved. configs: ${chatConfig.configs}`)

    return chatConfig.configs;
  }
}

module.exports.addConfiguration = async (groupChatId, configItem) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  // If there's already a config with the same name, remove the old one.
  let index = chatConfig.configs.findIndex(config => config.name === configItem.name);
  if (index !== -1) {
    chatConfig.configs.splice(index, 1);
  }

  chatConfig.configs.push(configItem);

  await chatConfig.save();

  console.log(`Added config. config: ${configItem}`);
}