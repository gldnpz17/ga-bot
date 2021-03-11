const config = require('../config');

module.exports.commandParser = async (req, res, next) => {
  try {
    req.body.events.map(async (event) => {
      if (event.message === null) {
        return;
      }
      if (event.type === 'message' && event.message.type === 'text') {
        let regex = new RegExp(`^@${config.botName}.*`);
  
        if (regex.test(event.message.text)) {
          try {
            let commandLine = '';
            if (event.message.text.indexOf('\n') === -1){
              commandLine += '\n';
            } else {
              commandLine = event.message.text.match(new RegExp(`^@${config.botName}(.*?)\n`))[1];
            }
            let commandLineComponents = commandLine.split(' ');
            commandLineComponents.splice(0, 1);
      
            if(commandLineComponents.length > 0) {
              event.command = {
                name: commandLineComponents.splice(0, 1),
                args: commandLineComponents,
                body: event.message.text.substr(event.message.text.indexOf('\n') + 1),
                raw: commandLine
              }
            }
          } catch(err) {
            next(err);
          } 
        }
      }
  
      next()
    });
  } catch (err) {
    next(err);
  }
};