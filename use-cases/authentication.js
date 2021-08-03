const ApplicationError = require('../common/application-error');
const botConfig = require('../config');
const Models = require('../models/models');
const bcrypt = require('bcrypt');
const generateRandomToken = require('../utilities/generate-random-token');

module.exports.generateKey = async (groupChatId) => {
  let config = await Models.GroupChatConfig.findOne({ groupChatId: groupChatId }).exec();

  if (config) {
    config.key = generateRandomToken(64);
    await config.save();

    console.log(`Key generated for ${groupChatId}.`);
    return key;
  } else {
    throw new ApplicationError('Group chat doesn\'t exist.');
  }
}

module.exports.login = async (key) => {
  let config = await Models.GroupChatConfig.findOne({ key: key }).exec();

  if (config) {
    let token = generateRandomToken(256);

    let session = new Models.AuthSession({
      token: token,
      groupChatId: groupChatId
    });

    await session.save();

    return token;
  } else {
    throw new ApplicationError('Group chat doesn\'t exist.');
  }
}

module.exports.getAuthSession = async (token) => {
  let session = await Models.AuthSession.findOne({ token: token }).exec();

  return session;
}

module.exports.revokeAuthSessions = async (groupChatId) => {
  let sessions = await Models.AuthSession.deleteMany({ groupChatId: groupChatId });
}