const ApplicationError = require('../common/application-error');
const Models = require('../models/models');

module.exports.addCustomTag = async (groupChatId, tagName, userIds) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId }).exec();

  if (chatConfig === null || chatConfig === undefined) {
    throw new Error(`Config not found. groupChatId: ${groupdChatId}`);
  }

  if (tagName === null || tagName === undefined) {
    throw new ApplicationError('\'tagName\' can\'t be empty.');
  }

  let index = chatConfig.customTags.indexOf(customTag => customTag.tagName === tagName);
  
  let userIdArr = [];
  userIds.map(userId => {
    userIdArr.push({
      userId: userId
    });
  });

  if ( index !== -1) {
    // If the tag already exists, update the existing tag

    chatConfig.customTags[index].userIds = userIdArr;
  } else {
    chatConfig.customTags.push({
      tagName: tagName,
      userIds: userIdArr
    });
  };

  await chatConfig.save();
};

module.exports.deleteCustomTag = async (groupChatId, tagName) => {
  let chatConfig = await Models.GroupChatConfig.findOne({ groupChatId }).exec();

  if (chatConfig === null || chatConfig === undefined) {
    throw new Error(`Config not found. groupChatId: ${groupdChatId}`);
  }

  if (tagName === null || tagName === undefined) {
    throw new ApplicationError('\'tagName\' can\'t be empty.');
  }

  let index = chatConfig.customTags.indexOf(customTag => customTag.tagName === tagName);

  if (index !== -1) {
    chatConfig.customTags.splice(index, 1);

    await chatConfig.save();

    console.log(`Custom tag \'${tagName}\' removed from ${groupChatId}`);
  } else {
    throw new ApplicationError('Custom tag not found.')
  }
};