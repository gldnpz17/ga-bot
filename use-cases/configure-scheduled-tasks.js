const config = require('../config');

const cron = require('node-cron');

const line = require('@line/bot-sdk');
const lineConfig = {
  channelAccessToken: config.channelAccessToken,
  channelSecret: config.channelSecret
}
const lineClient = new line.Client(lineConfig);

const tasks = [];

module.exports.scheduleMessage = async (groupChatId, configItem) => {
  if (configItem.cronExpression !== null && configItem.cronExpression !== undefined) {
    try {
      let task = cron.schedule(configItem.cronExpression, async () => {
        lineClient.pushMessage(groupChatId, {
          type: 'text',
          text: configItem.reply
        });
      });

      tasks.push({
        configName: configItem.configName,
        task: task
      });

      console.log(`Scheduled task ${configItem.configName} in group ${groupChatId}.`);
    } catch {
      throw new ApplicationError('Error scheduling task.');
    }
  }
}

module.exports.unscheduleMessage = async (configItem) => {
  let index = tasks.findIndex(task => task.configName === configItem.configName);

  if (index !== -1) {
    tasks[index].task.destroy();

    tasks.splice(index, 1);
  }

  console.log(`Unscheduled task ${configItem.configName}.`);
};