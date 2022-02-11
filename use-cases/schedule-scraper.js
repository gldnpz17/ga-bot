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
  let scheduleProfile = await Models.ScheduleProfile.findOne({ groupChatId: groupChatId }).exec();
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

const printMatkul = (entry) => (
`Matakuliah: ${entry["Matakuliah"]}
Kelas: ${entry["Kelas"]} (${entry["Hari/Jam"]})
Dosen: ${entry["Dosen"]}
URL:\n - ${entry["URL"].join('\n - ')}`
);

const filterByName = async (name, schedules) => {
  let result = '';
  let regex = new RegExp(name, 'i');
  schedules.filter(entry => regex.test(entry))
  .forEach((entry) => {
    result += printMatkul(entry);
  });

  return (result !== '') ? result : null;
};

const filterByProfile = async (profile, schedules) => {
  let result = '';

  if (profile?.matkul?.length > 0) {
    let added_entries = [];
    for (let i = 0; i < profile.matkul.length; i++) {
      let regex = new RegExp(profile.matkul[i], 'i');
      schedules.filter(entry => regex.test(entry['Matakuliah']))
      .forEach((entry) => {
        if(!added_entries.includes(entry['#'])) {
          added_entries.push(entry['#']);
          result += printMatkul(entry);
        }
      });
    }
  }

  return (result !== '') ? result : null;
};

module.exports.search = async (groupId, keywords) => {
  /*let schedules = await getSchedule();
  if (schedules == null){
    throw new ApplicationError("Error fetching schedules.");
  }*/
  
  const schedules = await Models.Schedule.find({
    $text: {
      $search: keywords,
      $caseSensitive: false
    }
  }).lean().exec()

  if (!schedules) return `No result for ${keywords}.`

  return schedules
    .map(printMatkul)
    .join("\n===================================\n")

  /*try {
    let result = await filterByName(profileName, schedules);
    if (result == null) {
      let scheduleProfile = await getScheduleProfile(groupId);
      let profile = scheduleProfile.profiles?.find(entry => entry?.name === profileName);
      result = await filterByProfile(profile, schedules);
    }

    if (result != null) {
      return result;
    }
    else {
      return ;
    }
  } catch (err) {
    return `Error: ${err}`;
  }*/
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

  status += `Added profiles. profile name: ${profileItems.name}`;
  return status;
};

module.exports.removeProfile = async (groupId, profileName) => {
  let profile = await getScheduleProfile(groupId);
  let status = '';

  let index = profile.profiles.findIndex(profile => profile.name === profileName);
  if (index !== -1) {
    profile.profiles.splice(index, 1);
    await profile.save();

    status += `Removed profiles. profiles: ${profileName}`;
  } else {
    status += `profile \'${profileName}\' not found.`;
  }
  return status;
};
