const login = require("fca-unofficial");
const fs = require("fs-extra");
const path = require("path");
const logger = require("./utils/logger");
const admins = require("./utils/admins");
const lockUtil = require("./utils/lock");
const engineUtil = require("./utils/engine");

const config = require("../config.json");
const appstatePath = path.resolve(__dirname, "../", config.appstatePath);

const commandFiles = [
  "./commands/commands",
  "./commands/uptime",
  "./commands/engine",
  "./commands/promote",
  "./commands/demote",
  "./commands/lock"
];

const commands = new Map();
let commandList = [];

function loadCommands() {
  commands.clear();
  commandList = [];

  for (const file of commandFiles) {
    try {
      delete require.cache[require.resolve(file)];
      const cmd = require(file);
      commands.set(cmd.name, cmd);
      if (cmd.aliases) {
        for (const alias of cmd.aliases) commands.set(alias, cmd);
      }
      commandList.push(cmd);
      logger.success(`تم تحميل الأمر: ${cmd.name}`);
    } catch (e) {
      logger.error(`فشل تحميل الأمر ${file}: ${e.message}`);
    }
  }
}

function readAppstate() {
  try {
    if (!fs.existsSync(appstatePath)) {
      logger.error(`ملف الـ appstate غير موجود: ${appstatePath}`);
      logger.warn("يرجى وضع ملف appstate.json في مجلد البوت.");
      process.exit(1);
    }
    const content = fs.readFileSync(appstatePath, "utf8").trim();
    if (!content || content === "[]") {
      logger.error("ملف appstate.json فارغ!");
      logger.warn("يرجى ملء ملف appstate.json بكوكيز حساب الفيسبوك.");
      process.exit(1);
    }
    return JSON.parse(content);
  } catch (e) {
    logger.error(`خطأ في قراءة appstate: ${e.message}`);
    process.exit(1);
  }
}

function saveAppstate(api) {
  try {
    const newState = api.getAppState();
    fs.writeJsonSync(appstatePath, newState, { spaces: 2 });
    logger.info("تم حفظ الـ appstate تلقائياً.");
  } catch (e) {
    logger.warn(`تعذر حفظ appstate: ${e.message}`);
  }
}

let reconnectCount = 0;

function startBot() {
  const appstate = readAppstate();

  logger.info("جارٍ تسجيل الدخول إلى فيسبوك...");

  const loginOptions = {
    appState: appstate,
    listenEvents: config.listenEvents,
    selfListen: config.selfListen,
    logLevel: "silent",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    forceLogin: false,
    autoMarkRead: false,
    autoMarkDelivery: false
  };

  login(loginOptions, (err, api) => {
    if (err) {
      const msg = err.error || (typeof err === "string" ? err : JSON.stringify(err));

      if (err.error === "login-approval") {
        logger.error("الحساب يحتاج إلى موافقة تسجيل الدخول (2FA).");
        logger.warn("يرجى الموافقة من الجهاز الأصلي ثم إعادة المحاولة.");
        process.exit(1);
      }

      if (msg.includes("checkpoint")) {
        logger.error("الحساب موقوف (Checkpoint). يرجى فتح الحساب يدوياً.");
        process.exit(1);
      }

      logger.error(`فشل تسجيل الدخول: ${msg}`);

      if (config.autoReconnect && reconnectCount < config.maxReconnectAttempts) {
        reconnectCount++;
        const delay = config.reconnectDelay * Math.min(reconnectCount, 5);
        logger.warn(`إعادة المحاولة ${reconnectCount} بعد ${delay / 1000} ثانية...`);
        setTimeout(startBot, delay);
      } else {
        logger.error("استُنفدت جميع محاولات إعادة الاتصال.");
        process.exit(1);
      }
      return;
    }

    reconnectCount = 0;
    logger.success("تم تسجيل الدخول بنجاح! ✅");
    saveAppstate(api);

    loadCommands();
    engineUtil.startEngine(api);

    setInterval(() => saveAppstate(api), 30 * 60 * 1000);

    const stopListening = api.listenMqtt((err, event) => {
      if (err) {
        logger.error(`خطأ في الاستماع: ${err.error || err}`);

        if (config.autoReconnect) {
          logger.warn("جارٍ إعادة الاتصال...");
          engineUtil.stopAllEngines();
          try { stopListening(); } catch (_) {}
          setTimeout(startBot, config.reconnectDelay);
        }
        return;
      }

      handleEvent(api, event);
    });

    logger.success(`البوت يعمل الآن 🤖 | البادئة: ${config.prefix}`);
  });
}

function handleEvent(api, event) {
  if (!event) return;

  const { type, threadID, senderID, body } = event;

  if (type === "message" || type === "message_reply") {
    engineUtil.recordActivity(threadID);
    handleMessage(api, event);
  }

  if (type === "event") {
    const eventTypes = ["log:thread-name", "log:user-nickname", "log:subscribe", "log:unsubscribe"];
    if (eventTypes.includes(event.logMessageType)) {
      engineUtil.recordActivity(threadID);
    }
  }
}

function handleMessage(api, event) {
  const { threadID, senderID, body, isGroup } = event;

  if (!body) return;

  const prefix = config.prefix;

  if (!body.startsWith(prefix)) return;

  const locked = lockUtil.isLocked(threadID);
  if (locked && !admins.isAdmin(senderID)) return;

  const input = body.slice(prefix.length).trim();
  const parts = input.split(/\s+/);
  const cmdName = parts[0];
  const args = parts.slice(1);

  if (!cmdName) return;

  const cmd = commands.get(cmdName);
  if (!cmd) return;

  try {
    if (cmd.name === "اوامر") {
      cmd.execute(api, event, args, commandList);
    } else {
      cmd.execute(api, event, args);
    }
  } catch (e) {
    logger.error(`خطأ في تنفيذ الأمر ${cmdName}: ${e.message}`);
    api.sendMessage(`❌ حدث خطأ أثناء تنفيذ الأمر.`, threadID);
  }
}

process.on("uncaughtException", (err) => {
  logger.error(`استثناء غير متوقع: ${err.message}`);
  if (err.stack) logger.debug(err.stack);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`وعد غير معالج: ${reason}`);
});

process.on("SIGINT", () => {
  logger.warn("جارٍ إيقاف البوت...");
  engineUtil.stopAllEngines();
  process.exit(0);
});

startBot();
