const config = require("../../config.json");

const prefix = config.prefix;

module.exports = {
  name: "اوامر",
  description: "عرض قائمة الأوامر المتاحة",
  usage: `${prefix}اوامر`,

  async execute(api, event, args, commandList) {
    const { threadID } = event;

    let msg = `📋 قائمة الأوامر:\n${"─".repeat(25)}\n`;

    for (const cmd of commandList) {
      msg += `\n• ${cmd.usage || prefix + cmd.name}\n  ${cmd.description}\n`;
    }

    msg += `\n${"─".repeat(25)}\nالبادئة: ${prefix}`;

    return api.sendMessage(msg, threadID);
  }
};
