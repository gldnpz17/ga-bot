const config = require('../config');
const { getNickname } = require('../use-cases/get-nickname');

module.exports.commandParser = async (req, res, next) => {
  try {
    req.body.events.map(async (event) => {
      if (event.message === null) {
        return;
      }
      if (event.type === 'message' && event.message.type === 'text') {
        let text = event.message.text;

        if (new RegExp(`^@(?:(?:${await getNickname(event.source.groupId) ?? config.botName})|(?:${config.botName})) .*`).test(event.message.text)) {
          let command = text.match(new RegExp(`^@(?:(?:${await getNickname(event.source.groupId) ?? config.botName})|(?:${config.botName})) (.*?)(\n|$)`))[1];

          let commandComponents = command.split(' ');

          if(commandComponents.length > 0) {
            event.command = {
              name: commandComponents.splice(0, 1)[0],
              args: commandComponents,
              body: (text.indexOf('\n') === -1) ? '' : text.substr(text.indexOf('\n') + 1),
              raw: command
            }
          } 
        }
      }
  
      next();
    });
  } catch (err) {
    next(err);
  }
};