const ApplicationError = require('../common/application-error');
const config = require('../config');
const Models = require('../models/models');
const axios = require('axios').default;
const stream = require('stream');
var path = require('path');
const fs = require('fs');
const util = require('util');
const generateRandomToken = require('../utilities/generate-random-token');
const { logPerformanceAsync } = require('../common/measure-performance');

const finished = util.promisify(stream.finished);

const downloadLineFile = async (messageId, directory, filename) => {
  let fileUrl = `https://api-data.line.me/v2/bot/message/${messageId}/content`;

  const writer = fs.createWriteStream(path.join(directory, filename));

  let opened = new Promise((resolve, reject) => {
    writer.on('open', () => resolve());
    writer.on('error', reject);
  })

  await opened;
  
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

// Returns the file size in bytes.
const getFileSize = (filename) => {
  return new Promise((resolve, reject) => {
    fs.stat(path.join(config.fileArchiveDirectory, filename), (err, stats) => {
      resolve(stats.size);
    });
  });
};

const getExtensionFromContentType = (contentType) => contentType.match(/.*\/(.*)/)[1];

module.exports.getArchivedFile = async (fileId) => {
  return await Models.FileArchive.findOne({ fileId }).exec();
}

module.exports.archiveFile = async (groupChatId, messageId, timestamp, originalFilename) => {
  let fileId;

  do {
    fileId = generateRandomToken(11); // Inspired by the length of youtube video IDs
  }
  while (await Models.FileArchive.findOne({ fileId }).exec()); // Check for ID collision before proceeding
  
  let response = await downloadLineFile(messageId, config.fileArchiveDirectory, fileId);
  
  let archiveFile = new Models.FileArchive({
    groupChatId: groupChatId,
    fileId: fileId,
    originalFilename: originalFilename ?? `${fileId}.${getExtensionFromContentType(response.headers['content-type'])}`,
    timestamp: timestamp
  });

  await archiveFile.save();

  return fileId;
}

module.exports.calculateUsage = async (groupChatId) => {
  let files = await logPerformanceAsync("FetchFileArchiveFromDB", async () => {
    return await Models.FileArchive.aggregate(
      [
        {
          '$match': {
            'groupChatId': groupChatId
          }
        }, {
          '$unset': [
            '_id', '__v', 'timestamp', 'groupChatId', 'originalFilename'
          ]
        }
      ]
    ).exec();
  })

  let totalSize = await logPerformanceAsync("CalculateTotalSize", async () => {
    let promises = []
    files.forEach(file => {
      promises.push(getFileSize(file.fileId))
    });

    let sizes = await Promise.all(promises);

    return sizes.reduce((sum, size) => sum + size, 0);
  })

  return ({
    totalSize: Math.round(totalSize / (1024 * 1024)),
    fileCount: files.length
  }); 
}