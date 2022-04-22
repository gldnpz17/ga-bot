const ApplicationError = require('../common/application-error');
const botConfig = require('../config');
const Models = require('../models/models');
const bcrypt = require('bcrypt');
const generateRandomToken = require('../utilities/generate-random-token');

// Still defaults to a randomly-generated key if the `key` param is not supplied
module.exports.resetKey = async (groupChatId, key = generateRandomToken(64)) => {
  let config = await Models.GroupChatConfig.findOne({ groupChatId }).exec();

  if (config) {
    config.key = key;
    await config.save();

    console.log(`New key set for ${groupChatId}.`);
    return key;
  } else {
    throw new ApplicationError('Group chat doesn\'t exist.');
  }
}

module.exports.login = async (key, existingToken=null) => {
  let config = await Models.GroupChatConfig.findOne({ key }).exec();

  if (config) {
    if (existingToken) {
      let session = await Models.AuthSession.findOne({ token: existingToken }).exec();

      if (!session.groupChatIds.includes(config.groupChatId)) {
        session.groupChatIds.push(config.groupChatId);

        await session.save();
      }

      return existingToken;
    } else {
      let token = generateRandomToken(256);

      let session = new Models.AuthSession({
        token: token,
        groupChatIds: [config.groupChatId]
      });
  
      await session.save();
  
      return token;
    }
  } else {
    return null;
  }
}

module.exports.getAuthSession = async (token) => {
  let session = await Models.AuthSession.findOne({ token }).exec();

  return session;
}

module.exports.revokeAuthSessions = async (groupChatId) => {
  let sessions = await Models.AuthSession.deleteMany({ groupChatId });
}