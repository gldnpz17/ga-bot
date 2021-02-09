const mongoose = require('mongoose');

const groupChatConfigSchema = new mongoose.Schema({
  groupChatId: String,
  configs: [{
    configName: String,
    regex: String,
    cronExpression: String,
    reply: String
  }],
  customTags: [{
    tagName: String,
    userIds: [{
      userId: String
    }]
  }],
  
});

module.exports.GroupChatConfig = mongoose.model('GroupChatConfig', groupChatConfigSchema);