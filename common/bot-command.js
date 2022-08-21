// const { logMessage } = require('../use-cases/configure-ununsend');

module.exports.BotCommand = class CommandPipeline {
  pipelineItems = [];
  errorHandler = async (event, err) => {
    console.log('An error occured. This is the bot\'s default error handler. Consider implementing your own.');
  };
  
  registerFunctionality(commandTypes) {
    return (condition, action) => {
      this.pipelineItems.push({
        commandTypes,
        condition,
        action
      })
    }
  }

  async execute(event) {
    for(let x = 0; x < this.pipelineItems.length; x++) {
      try {
        const pipelineItem = this.pipelineItems[x]

        if(pipelineItem.commandTypes.some(type => event instanceof type)) {
          if (!pipelineItem.condition || pipelineItem.condition(event)) {
            await pipelineItem.action(event)
            break
          }
        }
      } catch(err) {
        await this.errorHandler(event, err)
        break
      }
    }
  }

  err(errorHandler) {
    this.errorHandler = errorHandler;
  }
}
