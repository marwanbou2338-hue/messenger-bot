const admins = require("../utils/admins");
const logger = require("../utils/logger");
const config = require("../../config.json");

const prefix = config.prefix;

function send(api, msg, threadID) {
  api.sendMessage(msg, threadID)
    .then(() => {})
    .catch(e => logger.warn(`sendMessage خطأ [${threadID}]: ${JSON.stringify(e)}`));
}

module.exports = {
  name: "رفع",
  description: "رفع شخص إلى صلاحية أدمن للبوت",
  usage: `${prefix}رفع [الرد على الشخص أو كتابة الايدي]`,

  execute(api, event, args) {
    const { threadID, senderID, messageReply } = event;

    if (!admins.isSuperAdmin(senderID)) {
      return send(api, "⛔ هذا الأمر متاح للسوبر أدمن فقط.", threadID);
    }

    let targetID = null;

    if (messageReply) {
      targetID = String(messageReply.senderID);
    } else if (args[0]) {
      targetID = String(args[0]);
    } else {
      return send(api, `⚠️ يرجى الرد على رسالة الشخص أو كتابة ايديه.\nمثال: ${prefix}رفع 123456789`, threadID);
    }

    if (admins.isSuperAdmin(targetID)) {
      return send(api, "⚠️ هذا الشخص هو السوبر أدمن ولا يمكن تعديل صلاحياته.", threadID);
    }

    const result = admins.addAdmin(targetID);

    if (!result.success && result.reason === "already_admin") {
      return send(api, `⚠️ هذا الشخص (${targetID}) هو أدمن بالفعل.`, threadID);
    }

    send(api, `✅ تم رفع الشخص (${targetID}) إلى صلاحية أدمن.`, threadID);
  }
};
