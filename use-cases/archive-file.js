const ApplicationError = require('../common/application-error');
const config = require('../config');
const Models = require('../models/models');
const axios = require('axios').default;
const stream = require('stream');
var path = require('path');
const util = require('util');
const generateRandomToken = require('../utilities/generate-random-token');

const finished = util.promisify(stream.finished);
const downloadLineFile = async (messageId, directory, filename) => {
  let fileUrl = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

  const writer = createWriteStream(path.join(directory, filename));
  
  let response = await axios.get(fileUrl, {
    responseType: 'stream',
    headers: {
      'Authorization': `Bearer ${config.channelAccessToken}`
    }
  });
  
  response.data.pipe(writer);
  await finished(writer);

  return response;
};

const getExtensionFromContentType = (contentType) => contentType.match(/.*\/(.*)/)[1];

module.exports.getArchivedFile = async (fileId) => {
  return await Models.FileArchive.findOne({ fileId: fileId }).exec();
}

module.exports.archiveFile = async (groupChatId, messageId, timestamp, originalFilename) => {
  let fileId = generateRandomToken(64);
  
  let response = await downloadLineFile(messageId, config.fileArchiveDirectory, fileId);

  let archiveFile = new Models.FileArchive({
    groupChatId: groupChatId,
    fileId: fileId,
    originalFilename: originalFilename ?? `${fileId}.${getExtensionFromContentType(response.headers['Content-Type'])}`,
    timestamp: timestamp
  });

  await archiveFile.save();

  return fileId;
}