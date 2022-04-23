let express = require('express');
let router = express.Router();
const authenticationUseCase = require('../use-cases/authentication');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { authentication } = require('../middlewares/authentication');
const config = require('../config');
const axios = require('axios').default;

const limiter = rateLimit({
  max: 60
});

router.get('/auth/group-chats', cookieParser(), authentication, async (req, res) => {
  const groupChats = await Promise.all(req.authSession.groupChatIds.map(async (groupChatId) => {
    const response = await axios.get(`https://api.line.me/v2/bot/group/${groupChatId}/summary`, {
      headers: {
        'Authorization': `Bearer ${config.channelAccessToken}`
      }
    });
    
    return response.data;
  }))
  
  res.json({ groupChats })
})

router.post('/login', limiter, express.json(), cookieParser(), async (req, res) => {
  let dto = req.body;

  if (dto.key) {
    let authToken = await authenticationUseCase.login(dto.key, req.cookies['Auth-Token']);

    if (authToken) {
      res.cookie('Auth-Token', authToken, {
        secure: true,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10 // 10 years
      });
  
      res.sendStatus(200);
    } else {
      res.status = 500;
      res.send('Invalid key');
    }
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;