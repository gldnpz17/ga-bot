module.exports.BotCommand = class CommandPipeline {
  pipelineItems = [];
  errorHandler = async (event, err) => {
    console.log('An error occured. This is the bot\'s default error handler. Consider implementing your own.');
  };
  
  addFunctionality(condition, action) {
    this.pipelineItems.push({
      condition: condition,
      action: action
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