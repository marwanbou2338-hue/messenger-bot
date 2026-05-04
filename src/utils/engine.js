const path = require("path");
const config = require("../../config.json");
const storage = require("./storage");
const logger = require("./logger");

const dataPath = path.resolve(__dirname, "../../", config.engineDataPath);

const activeTimers = {};
const groupActivity = {};

function getData() {
  return storage.load(dataPath, {
    enabled: false,
    message: "مرحباً! أنا البوت 🤖",
    interval: 60000,
    smartMode: false,
    targetThread: null
  });
}

function saveData(data) {
  return storage.save(dataPath, data);
}

function recordActivity(threadID) {
  groupActivity[String(threadID)] = Date.now();
}

function hasRecentActivity(threadID, windowMs = 300000) {
  const last = groupActivity[String(threadID)];
  if (!last) return false;
  return Date.now() - last < windowMs;
}

function startEngine(api) {
  const data = getData();
  if (!data.enabled || !data.targetThread) return;
  const threadID = String(data.targetThread);

  if (activeTimers[threadID]) {
    clearInterval(activeTimers[threadID]);
    delete activeTimers[threadID];
  }

  logger.info(`محرك: تشغيل في الغروب ${threadID} كل ${data.interval / 1000} ثانية`);

  activeTimers[threadID] = setInterval(() => {
    const current = getData();
    if (!current.enabled) {
      clearInterval(activeTimers[threadID]);
      delete activeTimers[threadID];
      return;
    }

    if (current.smartMode && !hasRecentActivity(threadID)) {
      logger.debug(`محرك: لا يوجد نشاط في ${threadID}، تخطي الإرسال`);
      return;
    }

    api.sendMessage(current.message, threadID, (err) => {
      if (err) logger.error(`محرك: فشل الإرسال: ${err.error || err}`);
    });
  }, data.interval);
}

function stopEngine(threadID) {
  const id = String(threadID);
  if (activeTimers[id]) {
    clearInterval(activeTimers[id]);
    delete activeTimers[id];
    logger.info(`محرك: إيقاف في الغروب ${id}`);
    return true;
  }
  return false;
}

function stopAllEngines() {
  Object.keys(activeTimers).forEach(id => {
    clearInterval(activeTimers[id]);
    delete activeTimers[id];
  });
}

function setEnabled(enabled, threadID, api) {
  const data = getData();
  data.enabled = enabled;
  if (threadID) data.targetThread = String(threadID);
  saveData(data);
  if (enabled && api) startEngine(api);
  else if (!enabled && threadID) stopEngine(threadID);
}

function setMessage(msg) {
  const data = getData();
  data.message = msg;
  saveData(data);
}

function setInterval_(ms) {
  const data = getData();
  data.interval = ms;
  saveData(data);
}

function setSmartMode(enabled) {
  const data = getData();
  data.smartMode = enabled;
  saveData(data);
}

module.exports = {
  getData,
  startEngine,
  stopEngine,
  stopAllEngines,
  setEnabled,
  setMessage,
  setInterval: setInterval_,
  setSmartMode,
  recordActivity
};
