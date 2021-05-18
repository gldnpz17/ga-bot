const mongoose = require('mongoose');

const groupChatConfigSchema = new mongoose.Schema({
  groupChatId: String,
  nickname: String,
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
  }]
});

const counterProfileSchema = new mongoose.Schema({
  userId: String,
  counters: [{
    label: String,
    count: Number,
    history: [{
      timestamp: Date,
      note: String
    }]
  }]
});

module.exports.GroupChatConfig = mongoose.model('GroupChatConfig', groupChatConfigSchema);
module.exports.CounterProfile = mongoose.model('CounterProfile', counterProfileSchema);