const admins = require("../utils/admins");
const config = require("../../config.json");

const prefix = config.prefix;

module.exports = {
  name: "رفع",
  description: "رفع شخص إلى صلاحية أدمن للبوت",
  usage: `${prefix}رفع [الرد على الشخص أو كتابة الايدي]`,

  async execute(api, event, args) {
    const { threadID, senderID, messageReply } = event;

    if (!admins.isSuperAdmin(senderID)) {
      return api.sendMessage("⛔ هذا الأمر متاح للسوبر أدمن فقط.", threadID);
    }

    let targetID = null;

    if (messageReply) {
      targetID = String(messageReply.senderID);
    } else if (args[0]) {
      targetID = String(args[0]);
    } else {
      return api.sendMessage(
        `⚠️ يرجى الرد على رسالة الشخص أو كتابة ايديه.\nمثال: ${prefix}رفع 123456789`,
        threadID
      );
    }

    if (admins.isSuperAdmin(targetID)) {
      return api.sendMessage("⚠️ هذا الشخص هو السوبر أدمن ولا يمكن تعديل صلاحياته.", threadID);
    }

    const result = admins.addAdmin(targetID);

    if (!result.success) {
      if (result.reason === "already_admin") {
        return api.sendMessage(`⚠️ هذا الشخص (${targetID}) هو أدمن بالفعل.`, threadID);
      }
    }

    return api.sendMessage(`✅ تم رفع الشخص (${targetID}) إلى صلاحية أدمن.`, threadID);
  }
};
