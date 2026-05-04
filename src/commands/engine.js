const admins = require("../utils/admins");
const engineUtil = require("../utils/engine");
const logger = require("../utils/logger");
const config = require("../../config.json");

const prefix = config.prefix;

function send(api, msg, threadID) {
  api.sendMessage(msg, threadID)
    .then(() => {})
    .catch(e => logger.warn(`sendMessage خطأ [${threadID}]: ${JSON.stringify(e)}`));
}

module.exports = {
  name: "محرك",
  description: "التحكم في محرك الرسائل التلقائية",
  usage: `${prefix}محرك [تشغيل|إيقاف|رسالة|وقت|الذكي]`,

  execute(api, event, args) {
    const { threadID, senderID } = event;

    if (!admins.isAdmin(senderID)) {
      return send(api, "⛔ ليس لديك صلاحية لاستخدام هذا الأمر.", threadID);
    }

    const sub = args[0];

    if (!sub) {
      const data = engineUtil.getData();
      return send(api,
        `⚙️ حالة المحرك:\n` +
        `• الوضع: ${data.enabled ? "✅ تشغيل" : "❌ إيقاف"}\n` +
        `• الرسالة: ${data.message}\n` +
        `• الوقت: ${data.interval / 1000} ثانية\n` +
        `• الذكي: ${data.smartMode ? "✅ مفعل" : "❌ معطل"}\n` +
        `• الغروب: ${data.targetThread || "غير محدد"}\n\n` +
        `الأوامر:\n` +
        `${prefix}محرك تشغيل\n` +
        `${prefix}محرك إيقاف\n` +
        `${prefix}محرك رسالة [نص]\n` +
        `${prefix}محرك وقت [ثواني]\n` +
        `${prefix}محرك الذكي [تشغيل|إيقاف]`,
        threadID
      );
    }

    if (sub === "تشغيل") {
      engineUtil.setEnabled(true, threadID, api);
      return send(api, `✅ تم تشغيل المحرك في هذا الغروب.`, threadID);
    }

    if (sub === "إيقاف" || sub === "ايقاف") {
      engineUtil.setEnabled(false, threadID, null);
      engineUtil.stopEngine(threadID);
      return send(api, `🛑 تم إيقاف المحرك.`, threadID);
    }

    if (sub === "رسالة") {
      const msg = args.slice(1).join(" ");
      if (!msg) return send(api, `⚠️ مثال: ${prefix}محرك رسالة مرحباً`, threadID);
      engineUtil.setMessage(msg);
      return send(api, `✅ تم تحديد الرسالة: "${msg}"`, threadID);
    }

    if (sub === "وقت") {
      const seconds = parseInt(args[1]);
      if (isNaN(seconds) || seconds < 1) return send(api, `⚠️ مثال: ${prefix}محرك وقت 60`, threadID);
      engineUtil.setInterval(seconds * 1000);
      return send(api, `✅ كل ${seconds} ثانية.`, threadID);
    }

    if (sub === "الذكي") {
      const toggle = args[1];
      if (!toggle) {
        const data = engineUtil.getData();
        return send(api, `الوضع الذكي: ${data.smartMode ? "✅ مفعل" : "❌ معطل"}\nمثال: ${prefix}محرك الذكي تشغيل`, threadID);
      }
      const enabled = toggle === "تشغيل";
      engineUtil.setSmartMode(enabled);
      return send(api, enabled ? `✅ الوضع الذكي مفعل.` : `✅ الوضع الذكي معطل.`, threadID);
    }

    send(api, `⚠️ استخدم ${prefix}محرك للمساعدة.`, threadID);
  }
};
