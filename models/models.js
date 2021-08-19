const mongoose = require('mongoose');

const groupChatConfigSchema = new mongoose.Schema({
  groupChatId: String,
  nickname: String,
  key: String,
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

const groupChatMessageHistorySchema = new mongoose.Schema({
  groupChatId: String,
  messages: [{
    id: String,
    timestamp: Number,
    userId: String,
    text: String
  }],
  unsentMessages: [{
    id: String,
    timestamp: Number,
    userId: String,
    text: String
  }]
});

const authSessionSchema = new mongoose.Schema({
  token: String,
  groupChatId: String
});

const fileArchiveSchema = new mongoose.Schema({
  groupChatId: String,
  fileId: String,
  originalFilename: String,
  timestamp: Number
});

const scheduleSchema = new mongoose.Schema({
  "#": String,
  "Hari/Jam": String,
  Matakuliah: String,
  Kelas: String,
  Dosen: String,
  URL: [String],
  Keterangan: [String]
});

const scheduleProfileSchema = new mongoose.Schema({
  groupChatId: String,
  profiles: [{
    name: String,
    matkul: [String],
  }]
});

module.exports.GroupChatConfig = mongoose.model('GroupChatConfig', groupChatConfigSchema);
module.exports.CounterProfile = mongoose.model('CounterProfile', counterProfileSchema);
module.exports.GroupChatMessageHistory = mongoose.model('GroupChatHistory', groupChatMessageHistorySchema);
module.exports.AuthSession = mongoose.model('AuthSession', authSessionSchema);
module.exports.FileArchive = mongoose.model('FileArchive', fileArchiveSchema);
module.exports.Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports.ScheduleProfile = mongoose.model('ScheduleProfile', scheduleProfileSchema);
