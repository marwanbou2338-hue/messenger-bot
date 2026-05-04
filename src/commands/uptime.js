const config = require("../../config.json");
const logger = require("../utils/logger");

const prefix = config.prefix;
const startTime = Date.now();

function send(api, msg, threadID) {
  api.sendMessage(msg, threadID)
    .then(() => {})
    .catch(e => logger.warn(`sendMessage خطأ [${threadID}]: ${JSON.stringify(e)}`));
}

module.exports = {
  name: "سيرفر",
  aliases: ["ابتيم", "uptime"],
  description: "عرض معلومات البوت والسيرفر",
  usage: `${prefix}سيرفر`,

  execute(api, event) {
    const { threadID } = event;

    const uptimeMs = Date.now() - startTime;
    const seconds = Math.floor(uptimeMs / 1000) % 60;
    const minutes = Math.floor(uptimeMs / 60000) % 60;
    const hours   = Math.floor(uptimeMs / 3600000) % 24;
    const days    = Math.floor(uptimeMs / 86400000);

    const mem = process.memoryUsage();
    const mbUsed = (mem.rss / 1024 / 1024).toFixed(1);

    const msg =
      `🖥️ معلومات السيرفر:\n` +
      `${"─".repeat(25)}\n` +
      `⏱ مدة التشغيل: ${days}يوم ${hours}س ${minutes}د ${seconds}ث\n` +
      `💾 الذاكرة: ${mbUsed} MB\n` +
      `🌐 النظام: Node.js ${process.version}\n` +
      `📅 التاريخ: ${new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" })}`;

    send(api, msg, threadID);
  }
};
