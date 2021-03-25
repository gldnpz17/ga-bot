let express = require('express');
let router = express.Router();

router.get('/', async (req, res) => {
  res.status(200).send('Everything\'s fine.');
});

module.exports = router;