const config = require("../../config.json");
const logger = require("../utils/logger");

const prefix = config.prefix;

function send(api, msg, threadID) {
  api.sendMessage(msg, threadID)
    .then(() => {})
    .catch(e => logger.warn(`sendMessage خطأ [${threadID}]: ${JSON.stringify(e)}`));
}

module.exports = {
  name: "اوامر",
  description: "عرض قائمة الأوامر المتاحة",
  usage: `${prefix}اوامر`,

  execute(api, event, args, commandList) {
    const { threadID } = event;

    let msg = `📋 قائمة الأوامر:\n${"─".repeat(25)}\n`;

    for (const cmd of commandList) {
      msg += `\n• ${cmd.usage || prefix + cmd.name}\n  ${cmd.description}\n`;
    }

    msg += `\n${"─".repeat(25)}\nالبادئة: ${prefix}`;

    send(api, msg, threadID);
  }
};
