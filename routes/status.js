let express = require('express');
let router = express.Router();

router.get('/', async (req, res) => {
  res.status(200).send('OK');
});

module.exports = router;