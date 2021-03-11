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
          let commandLine = event.message.text;
          
          if (commandLine.indexOf('\n') === -1){
            commandLine += '\n';
          } 
          
          commandLine = commandLine.match(new RegExp(`^@${config.botName} (.*?)\n`))[1];
          
          let commandLineComponents = commandLine.split(' ');
          commandLineComponents.splice(0, 1);
    
          if(commandLineComponents.length > 0) {
            event.command = {
              name: commandLineComponents.splice(0, 1)[0],
              args: commandLineComponents,
              body: (event.message.text.indexOf('\n') === -1) ? '' : event.message.text.substr(event.message.text.indexOf('\n')),
              raw: commandLine
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