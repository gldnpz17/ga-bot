const Models = require('../models/models');
const ApplicationError = require('../common/application-error');

const getSchedule = async () => {
  let schedule = await Models.Schedule.find({}).exec();
  if (schedule == null) {
    // If no existing schedule, create one.
    let newSchedule = new Models.Schedule({});

    newSchedule.save((err, doc) => {
      console.log(`Initialized new schedule profile. doc: ${doc}`);
    });
    
    schedule = newSchedule;
  }
  
  return schedule;
};

const getScheduleProfile = async (groupChatId) => {
  let scheduleProfile = await Models.ScheduleProfile.findOne({ groupChatId: groupId }).exec();
  if (scheduleProfile == null) {
    // If no existing schedule profile, create one.
    let newScheduleProfile = new Models.ScheduleProfile({
      groupChatId: groupChatId,
      profiles: []
    });

    newScheduleProfile.save((err, doc) => {
      console.log(`Initialized new schedule profile. doc: ${doc}`);
    });
    
    scheduleProfile = newScheduleProfile;
  }
  
  return scheduleProfile;
};

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
  let profile = await getScheduleProfile(groupId).profiles?.find(entry => entry.name === profileName);
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
  let schedules = await getSchedule();
  if (schedules == null){
    throw new ApplicationError("Error fetching schedules.");
  }
  
  let result = await filterByName(profileName, schedules) || await filterByProfile(groupId, profileName, schedules);

  if (result) {
    return result;
  }
  else {
    return `No result for ${profileName.toString()}.`
  }
};

module.exports.addProfile = async (groupId, profileItems) => {
  let profile = await getScheduleProfile(groupId);
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
  let profile = await getScheduleProfile(groupId);
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
