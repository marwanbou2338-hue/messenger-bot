const chalk = require("chalk");

const levels = { info: 0, warn: 1, error: 2, debug: 3 };

function timestamp() {
  return new Date().toLocaleString("ar-SA", { timeZone: "Asia/Riyadh" });
}

function info(msg) {
  console.log(chalk.cyan(`[${timestamp()}] [INFO] `) + msg);
}

function warn(msg) {
  console.log(chalk.yellow(`[${timestamp()}] [WARN] `) + msg);
}

function error(msg) {
  console.log(chalk.red(`[${timestamp()}] [ERROR] `) + msg);
}

function success(msg) {
  console.log(chalk.green(`[${timestamp()}] [OK] `) + msg);
}

function debug(msg) {
  console.log(chalk.gray(`[${timestamp()}] [DEBUG] `) + msg);
}

module.exports = { info, warn, error, success, debug };
