const admins = require("../utils/admins");
const lockUtil = require("../utils/lock");
const config = require("../../config.json");

const prefix = config.prefix;

module.exports = {
  name: "قفل",
  description: "قفل البوت وتجاهل الأوامر",
  usage: `${prefix}قفل [تشغيل|إيقاف|الذكي|عادي]`,

  async execute(api, event, args) {
    const { threadID, senderID } = event;

    if (!admins.isAdmin(senderID)) {
      return api.sendMessage("⛔ ليس لديك صلاحية لاستخدام هذا الأمر.", threadID);
    }

    const sub = args[0];

    if (!sub) {
      const status = lockUtil.getStatus();
      return api.sendMessage(
        `🔒 حالة القفل:\n` +
        `• الذكي (جميع الغروبات): ${status.smartLock ? "✅ مفعل" : "❌ معطل"}\n` +
        `• الغروبات المقفلة: ${status.lockedGroups.length > 0 ? status.lockedGroups.join(", ") : "لا يوجد"}\n\n` +
        `الأوامر الفرعية:\n` +
        `${prefix}قفل الذكي تشغيل — قفل جميع الغروبات\n` +
        `${prefix}قفل الذكي إيقاف — رفع القفل عن جميع الغروبات\n` +
        `${prefix}قفل عادي تشغيل — قفل هذا الغروب فقط\n` +
        `${prefix}قفل عادي إيقاف — رفع القفل عن هذا الغروب`,
        threadID
      );
    }

    if (sub === "الذكي") {
      const toggle = args[1];
      if (!toggle) return api.sendMessage(`⚠️ يرجى تحديد تشغيل أو إيقاف.`, threadID);
      const enabled = toggle === "تشغيل";
      lockUtil.setSmartLock(enabled);
      return api.sendMessage(
        enabled
          ? `🔒 تم تفعيل القفل الذكي: البوت مقفل في جميع الغروبات.`
          : `🔓 تم إلغاء القفل الذكي: البوت يعمل في جميع الغروبات.`,
        threadID
      );
    }

    if (sub === "عادي") {
      const toggle = args[1];
      if (!toggle) return api.sendMessage(`⚠️ يرجى تحديد تشغيل أو إيقاف.`, threadID);
      const enabled = toggle === "تشغيل";
      lockUtil.setGroupLock(threadID, enabled);
      return api.sendMessage(
        enabled
          ? `🔒 تم قفل البوت في هذا الغروب. سيتجاهل جميع الأوامر والرسائل.`
          : `🔓 تم رفع القفل عن هذا الغروب.`,
        threadID
      );
    }

    return api.sendMessage(`⚠️ أمر غير معروف. استخدم ${prefix}قفل للمساعدة.`, threadID);
  }
};
