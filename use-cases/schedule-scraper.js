const Models = require('../models/models');
const ApplicationError = require('../common/application-error');

const printMatkul = (entry) => {
  let result = '';
  result += `===================================\n`
         + `Matakuliah: ${entry["Matakuliah"]}\n`
         + `Kelas: ${entry["Kelas"]} (${entry["Hari/Jam"]})\n`
         + `Dosen: ${entry["Dosen"]}\n`
         + `URL: ${entry["URL"].join('\n')}`;
  return result;
};

module.exports.getByName = async (groupId, profileName) => {
  let jadwals = await Models.Jadwalkuliah.find({}).exec();
  let result = JSON.stringify(jadwals[0]);
  
  let profile = (await Models.JadwalkuliahProfile.findOne({ groupChatId: groupId }).exec())?.profiles.find( profile => profile.name === profileName);
  let regex = new RegExp(profileName, 'i');
  let jadwal = jadwals.filter(jadwal => regex.test(jadwal["Matakuliah"]));
  
  if (jadwal?.length > 0){
    for(let i = 0;i<jadwal.length;i++){
      result += printMatkul(jadwal[i]);
    }
  }
  else if (profile?.matkul?.length > 0){
    for(let i = 0;i<profile.matkul.length;i++){
        regex = profile.matkul[i];
        jadwal = jadwals.filter(jadwal => regex.test(jadwal["Matakuliah"]));
        if (jadwal?.length > 0){
          for(let i = 0;i<jadwal.length;i++){
            result += printMatkul(jadwal[i]);
          }
        }
    }
  }
  else {
    result += `No result for ${profileName}`;
  }

  return result;
};

module.exports.addProfile = async (groupId, profileItems) => {
  let profile = await Models.JadwalkuliahProfile.findOne({ groupId: groupId }).exec();
  let status = '';

  if (profileItems.name === null || profileItems.name === undefined) {
    throw new ApplicationError('Error name');
  };

  if (profileItems.matkul === null || profileItems.matkul === undefined) {
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
  let profile = await Models.JadwalkuliahProfile.findOne({ groupId: groupId }).exec();
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
