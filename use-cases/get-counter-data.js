const Models = require('../models/models');

const getCounterProfile = async (userId) => {
  let profile = await Models.CounterProfile.findOne({ userId }).exec();

  if (profile === null || profile === undefined) {
    throw new ApplicationError('Record not found. Please make sure you have at least 1 counter.');
  }

  return profile;
};

const getCounter = async (profile, label) => {
  let counter = profile.counters.find(counter => counter.label === label);

  if (counter === null || counter === undefined) {
    throw new ApplicationError(`Cannot find a counter with the label ${label}.`);
  }

  return counter;
};

module.exports.getCurrentValue = async (userId, label) => {
  let profile = await getCounterProfile(userId);

  let counter = await getCounter(profile, label);

  return counter.count;
};

module.exports.getHistories = async (userId, label) => {
  let profile = await getCounterProfile(userId);

  let counter = await getCounter(profile, label);

  let histories = counter.history;

  histories.sort((first, second) => {
    if (first.timestamp < second.timestamp) {
      return -1;
    } else if (first.timestamp > second.timestamp) {
      return 1;
    } else {
      return 0;
    }
  });

  return histories;
};