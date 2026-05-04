const config = require("../../config.json");

const prefix = config.prefix;

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

    api.sendMessage(msg, threadID, (err) => {
      if (err) require("../utils/logger").warn(`sendMessage خطأ: ${err?.message || err}`);
    });
  }
};
