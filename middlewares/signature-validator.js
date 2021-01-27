const config = require('../config');

const line = require('@line/bot-sdk');

module.exports.signatureValidator = async (req, res, next) => {
  if (line.validateSignature(req.body, config.channelSecret, req.header('x-line-signature')) === true) {
    console.log('Signature is valid.');
    next();
  } else {
    console.log('Invalid signature.')
  }
}