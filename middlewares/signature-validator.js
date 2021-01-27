const config = require('../config');

const line = require('@line/bot-sdk');

module.exports.signatureValidator = async (req, res, next) => {
  try {
    console.log('Validating signature...');
    if (line.validateSignature(req.rawBody, config.channelSecret, req.header('x-line-signature')) === true) {
      console.log('Signature is valid.');
      next();
    } else {
      console.log('Invalid signature.')
    }
  } catch (err) {
    next(err);
  }
}