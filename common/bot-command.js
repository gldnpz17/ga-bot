const { logMessage } = require('../use-cases/configure-ununsend');

module.exports.BotCommand = class CommandPipeline {
  pipelineItems = [];
  errorHandler = async (event, err) => {
    console.log('An error occured. This is the bot\'s default error handler. Consider implementing your own.');
  };
  
  addFunctionality(condition, action) {
    this.pipelineItems.push({
      condition,
      action: async (event, ...args) => {
        // Implement ununsend logging in all commands instead
        // by wrapping each action functions
        const { type, message, timestamp, source, message } = event;
        if (type === 'message' && message.type === 'text') {
          await logMessage(timestamp, source, message);
        }

        await action(event, ...args);
      }
    });
  }

  async execute(event) {
    for(let x = 0; x < this.pipelineItems.length; x++) {
      try {
        if(this.pipelineItems[x].condition(event)) {
          await this.pipelineItems[x].action(event);
          break;
        }
      } catch(err) {
        await this.errorHandler(event, err);
        break;
      }
    }
  }

  err(errorHandler) {
    this.errorHandler = errorHandler;
  }
}