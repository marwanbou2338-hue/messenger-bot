const path = require("path");
const config = require("../../config.json");
const storage = require("./storage");

const dataPath = path.resolve(__dirname, "../../", config.adminDataPath);

function getData() {
  return storage.load(dataPath, { admins: [] });
}

function saveData(data) {
  return storage.save(dataPath, data);
}

function isSuperAdmin(userID) {
  return String(userID) === String(config.superAdminID);
}

function isAdmin(userID) {
  if (isSuperAdmin(userID)) return true;
  const data = getData();
  return data.admins.includes(String(userID));
}

function addAdmin(userID) {
  if (isSuperAdmin(userID)) return { success: false, reason: "superadmin" };
  const data = getData();
  const id = String(userID);
  if (data.admins.includes(id)) return { success: false, reason: "already_admin" };
  data.admins.push(id);
  saveData(data);
  return { success: true };
}

function removeAdmin(userID) {
  if (isSuperAdmin(userID)) return { success: false, reason: "superadmin" };
  const data = getData();
  const id = String(userID);
  const idx = data.admins.indexOf(id);
  if (idx === -1) return { success: false, reason: "not_admin" };
  data.admins.splice(idx, 1);
  saveData(data);
  return { success: true };
}

function getAdminList() {
  const data = getData();
  return data.admins;
}

module.exports = { isSuperAdmin, isAdmin, addAdmin, removeAdmin, getAdminList };
