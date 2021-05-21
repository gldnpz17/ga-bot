const ApplicationError = require('../common/application-error');
const Models = require('../models/models');

const getCounterProfile = async (userId) => {
  let profile = await Models.CounterProfile.findOne({ userId: userId }).exec();

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

module.exports.initializeCounter = async (userId, label) => {
  let profile = await Models.CounterProfile.findOne({ userId: userId }).exec();
  if (profile === null || profile === undefined) {
    // If the user doesn't have a profile yet, create one.
    let newCounterProfile = new Models.CounterProfile({
      userId: userId,
      counters: []
    });

    await newCounterProfile.save();

    profile = newCounterProfile;
  }

  // If there's a pre-existing counter with a label, throw an error.
  let preExistingCounters = profile.counters.find(counter => counter.label === label);
  if (!(preExistingCounters === null || preExistingCounters === undefined)) {
    throw new ApplicationError(`A counter with the label ${label} has already existed.`);
  }

  profile.counters.push({
    label: label,
    count: 0,
    history: [{
      timestamp: new Date(),
      note: `Initialized the ${label} counter.`
    }]
  });

  await profile.save();
};

module.exports.setCounterValue = async (userId, amount, label) => {
  let profile = await getCounterProfile(userId);

  let counter = await getCounter(profile, label);

  counter.count = amount;
  counter.history.push({
    timestamp: new Date(),
    note: `Value set to ${amount}.`
  });

  await profile.save();
};

module.exports.incrementCounter = async (userId, amount, label) => {
  let profile = await getCounterProfile(userId);

  let counter = await getCounter(profile, label);

  counter.count += Number.parseInt(amount);
  counter.history.push({
    timestamp: new Date(),
    note: `Incremented by ${amount}.`
  });

  await profile.save();
};

module.exports.resetCounter = async (userId, label) => {
  let profile = await getCounterProfile(userId);

  let counter = await getCounter(profile, label);

  counter.count = 0;
  counter.history.push({
    timestamp: new Date(),
    note: `Counter reset.`
  });

  await profile.save();
};