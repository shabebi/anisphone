const adminModel = require("../models/adminModel");
const { success, created } = require("../utils/response");

async function stats(req, res) {
  return success(res, await adminModel.dashboardStats());
}

async function users(req, res) {
  return success(res, await adminModel.listUsers());
}

async function updateUser(req, res) {
  const user = await adminModel.updateUser(req.params.id, req.body);
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  return success(res, user);
}

async function contactMessages(req, res) {
  return success(res, await adminModel.listContactMessages());
}

async function readContact(req, res) {
  const item = await adminModel.markContactRead(req.params.id, req.body.is_read !== false);
  if (!item) return res.status(404).json({ success: false, message: "Message not found." });
  return success(res, item);
}

async function createContact(req, res) {
  if (!req.body.name || !req.body.message) {
    return res.status(400).json({ success: false, message: "Name and message are required." });
  }
  return created(res, await adminModel.createContactMessage(req.body));
}

async function productRequests(req, res) {
  return success(res, await adminModel.listProductRequests());
}

async function createProductRequest(req, res) {
  return created(res, await adminModel.createProductRequest(req.user.id, req.body));
}

module.exports = {
  stats, users, updateUser, contactMessages, readContact,
  createContact, productRequests, createProductRequest
};
