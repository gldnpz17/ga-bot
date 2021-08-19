const Models = require('../models/models');
const ApplicationError = require('../common/application-error');

const printMatkul = (entry) => {
  let result = '';
  result += `===================================\n`
         + `Matakuliah: ${entry["Matakuliah"]}\n`
         + `Kelas: ${entry["Kelas"]} (${entry["Hari/Jam"]})\n`
         + `Dosen: ${entry["Dosen"]}\n`
         + `URL:\n${entry["URL"].join('\n ')}\n`;
  return result;
};

const filterByName = async (name, schedules) => {
  let result = '';
  schedules = schedules.filter(entry => new RegExp(name, 'i').test(entry)).forEach((entry) => {
    result += printMatkul(entry);
  });

  return (result !== '') ? result : null;
};

const filterByProfile = async (groupId, profileName, schedules) => {
  let profile = await Models.ScheduleProfile.findOne({ groupChatId: groupId }).exec()?.profiles?.find(entry => entry.name === profileName);
  let result = '';

  if (profile?.matkul?.length > 0) {
    let added_entries = [];
    for (let i = 0;i<profile.matkul.length;i++){
      schedules.filter(entry => new RegExp(profile.matkul[i], 'i').test(entry)).forEach((entry) => {
        if(!added_entries.includes(entry['#'])){
          added_entries.push(entry['#']);
          result += printMatkul(entry);
        }
      });
    }
  }

  return (result !== '') ? result : null;
};

module.exports.search = async (groupId, profileName) => {
  let schedules = await Models.Schedule.find({}).exec();
  if (schedules == null || schedules?.length == 0){
    throw new ApplicationError("Error fetching schedules.");
  }
  let foo = "foo";
  let result = filterByName(profileName, schedules) || filterByProfile(groupId, profileName, schedules);

  if (result) {
    return foo + result;
  }
  else {
    return foo + `No result for ${profileName.toString()}.`
  }
};

module.exports.addProfile = async (groupId, profileItems) => {
  let profile = await Models.ScheduleProfile.findOne({ groupChatId: groupId }).exec();
  let status = '';

  if (profileItems.name == null || profileItems.name?.length == 0) {
    throw new ApplicationError('Error name');
  };

  if (profileItems.matkul == null || profileItems.matkul?.length == 0) {
    throw new ApplicationError('Error matkul');
  };

  let index = profile.profiles.findIndex(profile => profile.name === profileItems.name);
  if (index !== -1) {
    status += `Removed profiles. profiles name: ${profileItems.name}`;
    profile.profiles.splice(index, 1);
  }

  profile.profiles.push(profileItems);
  await profile.save();

  status += `Added profiles. profiles: ${profileItems}`;
  return status;
};

module.exports.removeProfile = async (groupId, profileName) => {
  let profile = await Models.ScheduleProfile.findOne({ groupChatId: groupId }).exec();
  let status = '';

  let index = profile.findIndex(profile => profile.name === profileName);
  if (index !== -1) {
    profile.profiles.splice(index, 1);
    await profile.save();

    status += `Removed profiles. profiles: ${profileName}`;
  } else {
    status += `profile \'${profileName}\' not found.`;
  }
  return status;
};
