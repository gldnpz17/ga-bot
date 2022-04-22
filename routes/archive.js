const cookieParser = require('cookie-parser');
let express = require('express');
const config = require('../config');
const path = require('path');
const { authentication } = require('../middlewares/authentication');
const { getArchivedFile, getArchivedFiles } = require('../use-cases/archive-file');
let router = express.Router();

router.get('/files/:groupChatId', cookieParser(), authentication, async (req, res) => {
  const { groupChatId } = req.params

  if (!req.authSession.groupChatIds.includes(groupChatId)) {
    res.status(403).send({
      message: 'You are not allowed to access this group chat\'s data'
    })

    return
  }

  const { start, count } = req.query

  res.json(await getArchivedFiles(groupChatId, parseInt(start), parseInt(count)))
})

router.get('/:fileId', cookieParser(), authentication, async (req, res) => {
  console.log(`Archived file requested: ${req.params.fileId}`);
  let file = await getArchivedFile(req.params.fileId);

  if (file) {
    console.log('File found. Authorizing.');
    // Only allow group chat members to access this file.
    if (req.authSession.groupChatIds.includes(groupChatId)) {
      console.log(`Sending file: ${file.fileId}`);
      
      res.download(
        path.join(config.fileArchiveDirectory, file.fileId),
        file.originalFilename
      );
    } else {
      console.log('Unauthorized. Access denied.');

      res.sendStatus(403);
    }
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;