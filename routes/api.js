let express = require('express');
let router = express.Router();
const authenticationUseCase = require('../use-cases/authentication');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  max: 60
});

router.get('/login', limiter, express.json(), cookieParser(), async (req, res) => {
  let dto = req.body;

  let authToken = await authenticationUseCase.login(dto.key);

  if (authToken) {
    res.cookie('Auth-Token', authToken, {
      secure: true,
      httpOnly: true
    });

    res.sendStatus(200);
  } else {
    res.status = 500;
    res.send('Invalid key');
  }
});

module.exports = router;