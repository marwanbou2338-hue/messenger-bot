const fs = require("fs-extra");
const path = require("path");
const logger = require("./logger");

function load(filePath, defaultValue = {}) {
  try {
    fs.ensureDirSync(path.dirname(filePath));
    if (!fs.existsSync(filePath)) {
      fs.writeJsonSync(filePath, defaultValue, { spaces: 2 });
      return defaultValue;
    }
    return fs.readJsonSync(filePath);
  } catch (e) {
    logger.error(`Failed to load ${filePath}: ${e.message}`);
    return defaultValue;
  }
}

function save(filePath, data) {
  try {
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeJsonSync(filePath, data, { spaces: 2 });
    return true;
  } catch (e) {
    logger.error(`Failed to save ${filePath}: ${e.message}`);
    return false;
  }
}

module.exports = { load, save };
