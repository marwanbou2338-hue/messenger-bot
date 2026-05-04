const admins = require("../utils/admins");
const lockUtil = require("../utils/lock");
const logger = require("../utils/logger");
const config = require("../../config.json");

const prefix = config.prefix;

function send(api, msg, threadID) {
  api.sendMessage(msg, threadID)
    .then(() => {})
    .catch(e => logger.warn(`sendMessage خطأ [${threadID}]: ${JSON.stringify(e)}`));
}

module.exports = {
  name: "قفل",
  description: "قفل البوت وتجاهل الأوامر",
  usage: `${prefix}قفل [الذكي|عادي] [تشغيل|إيقاف]`,

  execute(api, event, args) {
    const { threadID, senderID } = event;

    if (!admins.isAdmin(senderID)) {
      return send(api, "⛔ ليس لديك صلاحية لاستخدام هذا الأمر.", threadID);
    }

    const sub = args[0];

    if (!sub) {
      const status = lockUtil.getStatus();
      return send(api,
        `🔒 حالة القفل:\n` +
        `• الذكي (جميع الغروبات): ${status.smartLock ? "✅ مفعل" : "❌ معطل"}\n` +
        `• الغروبات المقفلة: ${status.lockedGroups.length > 0 ? status.lockedGroups.join(", ") : "لا يوجد"}\n\n` +
        `الأوامر الفرعية:\n` +
        `${prefix}قفل الذكي تشغيل\n` +
        `${prefix}قفل الذكي إيقاف\n` +
        `${prefix}قفل عادي تشغيل\n` +
        `${prefix}قفل عادي إيقاف`,
        threadID
      );
    }

    if (sub === "الذكي") {
      const toggle = args[1];
      if (!toggle) return send(api, `⚠️ يرجى تحديد تشغيل أو إيقاف.`, threadID);
      const enabled = toggle === "تشغيل";
      lockUtil.setSmartLock(enabled);
      return send(api,
        enabled ? `🔒 تم تفعيل القفل الذكي.` : `🔓 تم إلغاء القفل الذكي.`,
        threadID
      );
    }

    if (sub === "عادي") {
      const toggle = args[1];
      if (!toggle) return send(api, `⚠️ يرجى تحديد تشغيل أو إيقاف.`, threadID);
      const enabled = toggle === "تشغيل";
      lockUtil.setGroupLock(threadID, enabled);
      return send(api,
        enabled ? `🔒 تم قفل البوت في هذا الغروب.` : `🔓 تم رفع القفل عن هذا الغروب.`,
        threadID
      );
    }

    send(api, `⚠️ أمر غير معروف. استخدم ${prefix}قفل للمساعدة.`, threadID);
  }
};
