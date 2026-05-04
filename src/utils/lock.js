const path = require("path");
const config = require("../../config.json");
const storage = require("./storage");

const dataPath = path.resolve(__dirname, "../../", config.lockDataPath);

function getData() {
  return storage.load(dataPath, { smartLock: false, lockedGroups: [] });
}

function saveData(data) {
  return storage.save(dataPath, data);
}

function isLocked(threadID) {
  const data = getData();
  if (data.smartLock) return true;
  return data.lockedGroups.includes(String(threadID));
}

function setSmartLock(enabled) {
  const data = getData();
  data.smartLock = enabled;
  return saveData(data);
}

function setGroupLock(threadID, enabled) {
  const data = getData();
  const id = String(threadID);
  if (enabled) {
    if (!data.lockedGroups.includes(id)) data.lockedGroups.push(id);
  } else {
    data.lockedGroups = data.lockedGroups.filter(g => g !== id);
  }
  return saveData(data);
}

function getStatus() {
  return getData();
}

module.exports = { isLocked, setSmartLock, setGroupLock, getStatus };
