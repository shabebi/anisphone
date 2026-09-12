const bcrypt = require("bcryptjs");
const authModel = require("../models/authModel");
const { signToken } = require("../utils/jwt");
const { success, created } = require("../utils/response");

function normalizePhone(phone) {
  return String(phone || "").trim();
}

async function register(req, res) {
  const name = String(req.body.name || "").trim();
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");

  if (!name || !phone || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Name, phone and a password of at least 6 characters are required."
    });
  }

  const existing = await authModel.findByPhone(phone);
  if (existing) {
    return res.status(409).json({
      success: false,
      message: "A user with this phone number already exists."
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await authModel.createUser({ name, phone, passwordHash });
  const token = signToken(user);

  return created(res, { user, token });
}

async function login(req, res) {
  const phone = normalizePhone(req.body.phone);
  const password = String(req.body.password || "");

  const user = await authModel.findByPhone(phone);
  if (!user || !user.is_active) {
    return res.status(401).json({
      success: false,
      message: "Invalid phone number or password."
    });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({
      success: false,
      message: "Invalid phone number or password."
    });
  }

  delete user.password_hash;
  const token = signToken(user);
  return success(res, { user, token });
}

async function me(req, res) {
  const user = await authModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  return success(res, user);
}

async function updateProfile(req, res) {
  const user = await authModel.updateProfile(req.user.id, {
    name: req.body.name,
    phone: req.body.phone
  });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  return success(res, user);
}

async function changePassword(req, res) {
  const current = String(req.body.current_password || "");
  const next = String(req.body.new_password || "");

  if (next.length < 6) {
    return res.status(400).json({
      success: false,
      message: "New password must be at least 6 characters."
    });
  }

  const user = await authModel.findByPhone(req.user.phone);
  const valid = user && await bcrypt.compare(current, user.password_hash);

  if (!valid) {
    return res.status(401).json({
      success: false,
      message: "Current password is incorrect."
    });
  }

  const hash = await bcrypt.hash(next, 12);
  await authModel.updatePassword(req.user.id, hash);

  return success(res, { message: "Password changed successfully." });
}

module.exports = { register, login, me, updateProfile, changePassword };
