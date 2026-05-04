const admins = require("../utils/admins");
const engineUtil = require("../utils/engine");
const config = require("../../config.json");

const prefix = config.prefix;

function send(api, msg, threadID) {
  api.sendMessage(msg, threadID, (err) => {
    if (err) require("../utils/logger").warn(`sendMessage خطأ: ${err?.message || err}`);
  });
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
        `• الغروب المستهدف: ${data.targetThread || "غير محدد"}\n\n` +
        `الأوامر الفرعية:\n` +
        `${prefix}محرك تشغيل — تشغيل المحرك في هذا الغروب\n` +
        `${prefix}محرك إيقاف — إيقاف المحرك\n` +
        `${prefix}محرك رسالة [نص] — تحديد رسالة المحرك\n` +
        `${prefix}محرك وقت [ثواني] — تحديد وقت الإرسال\n` +
        `${prefix}محرك الذكي [تشغيل|إيقاف] — الوضع الذكي`,
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
      if (!msg) return send(api, `⚠️ يرجى تحديد نص الرسالة.\nمثال: ${prefix}محرك رسالة مرحباً بالجميع`, threadID);
      engineUtil.setMessage(msg);
      return send(api, `✅ تم تحديد رسالة المحرك:\n"${msg}"`, threadID);
    }

    if (sub === "وقت") {
      const seconds = parseInt(args[1]);
      if (isNaN(seconds) || seconds < 1) return send(api, `⚠️ يرجى تحديد وقت صحيح بالثواني.\nمثال: ${prefix}محرك وقت 60`, threadID);
      engineUtil.setInterval(seconds * 1000);
      return send(api, `✅ تم تحديد وقت المحرك: كل ${seconds} ثانية.`, threadID);
    }

    if (sub === "الذكي") {
      const toggle = args[1];
      if (!toggle) {
        const data = engineUtil.getData();
        return send(api, `وضع المحرك الذكي حالياً: ${data.smartMode ? "✅ مفعل" : "❌ معطل"}\n\nمثال: ${prefix}محرك الذكي تشغيل`, threadID);
      }
      const enabled = toggle === "تشغيل";
      engineUtil.setSmartMode(enabled);
      return send(api,
        enabled
          ? `✅ تم تفعيل الوضع الذكي: سيرسل المحرك فقط عند وجود نشاط في الغروب.`
          : `✅ تم تعطيل الوضع الذكي: سيرسل المحرك بشكل منتظم.`,
        threadID
      );
    }

    send(api, `⚠️ أمر غير معروف. استخدم ${prefix}محرك للمساعدة.`, threadID);
  }
};
