const cookieParser = require('cookie-parser');
let express = require('express');
const config = require('../config');
const path = require('path');
const { authentication } = require('../middlewares/authentication');
const { getArchivedFile } = require('../use-cases/archive-file');
let router = express.Router();

router.get('/:fileId', cookieParser(), authentication, async (req, res) => {
  console.log(`Archived file requested: ${req.params.fileId}`);
  let file = await getArchivedFile(req.params.fileId);

  if (file) {
    console.log('File found. Authorizing.');
    // Only allow group chat members to access this file.
    if (file.groupChatId === req.authSession.groupChatId) {
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