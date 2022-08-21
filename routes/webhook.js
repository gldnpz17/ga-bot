const config = require('../config');
const express = require('express');
const { bot } = require('../commands/command-configuration');
const ApplicationError = require('../common/application-error');

class WebhookRouter {
  constructor(webhookHandler) {
    this.webhookHandler = webhookHandler
  }

  getRouter() {
    const router = express.Router();

    router.post('/', ...this.webhookHandler.getMiddlewares(), async (req, res, next) => {
      await Promise.all(req.body.events.map(async (event) => {
        try {
          await bot.execute(event)
        } catch(err) {
          throw new ApplicationError(err.message)
        }
      }))

      res.sendStatus(200)
    })

    return router
  }
}

module.exports = { WebhookRouter }