const mongoose = require('mongoose');

const groupChatConfigSchema = new mongoose.Schema({
  groupChatId: String,
  configs: [{
    configName: String,
    regex: String,
    reply: String
  }]
});

module.exports.GroupChatConfig = mongoose.model('GroupChatConfig', groupChatConfigSchema);