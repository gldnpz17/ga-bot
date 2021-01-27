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
            let args = event.message.text.match(/(.*?)\n/)[1].split(' ');
            args.splice(0, 1);
      
            if(args.length > 0) {
              event.command = {
                name: args[0],
                value: args[--args.length],
                body: event.message.text.substr(event.message.text.indexOf('\n'))
              }
            } else {
              throw new Error(`Error parsing command. message: ${event.message.text}`);
            }
          } catch(err) {
            console.log(err);
  
            await lineClient.replyMessage(event.replyToken, {
              type: 'text',
              text: 'Error parsing command.'
            });
          } 
        }
      }
  
      next()
    });
  } catch (err) {
    next(err);
  }
};