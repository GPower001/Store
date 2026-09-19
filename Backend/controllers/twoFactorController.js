import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { generateSecret, generateURI, verify } from "otplib";
import User from "../models/userModel.js";

const cleanCode = (code) => String(code || "").replace(/\s/g, "");
const validCode = (code) => /^\d{6}$/.test(cleanCode(code));

export const getTwoFactorStatus = async (req, res) => {
  const user = await User.findById(req.user.id).select("twoFactorEnabled").lean();
  res.json({ success: true, data: { enabled: Boolean(user?.twoFactorEnabled) } });
};

export const setupTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("email twoFactorEnabled");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.twoFactorEnabled) return res.status(400).json({ success: false, message: "Two-factor authentication is already enabled" });
    const secret = generateSecret();
    user.twoFactorSecret = secret;
    await user.save();
    const uri = generateURI({ issuer: "StockRoom", label: user.email, secret });
    res.json({ success: true, data: { secret, qrCode: await QRCode.toDataURL(uri) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to set up two-factor authentication" });
  }
};

export const enableTwoFactor = async (req, res) => {
  try {
    const code = cleanCode(req.body.code);
    if (!validCode(code)) return res.status(400).json({ success: false, message: "Enter the 6-digit authenticator code" });
    const user = await User.findById(req.user.id).select("twoFactorSecret twoFactorEnabled");
    if (!user?.twoFactorSecret) return res.status(400).json({ success: false, message: "Start two-factor setup first" });
    if (!(await verify({ secret: user.twoFactorSecret, token: code }))) return res.status(400).json({ success: false, message: "Invalid authenticator code" });
    user.twoFactorEnabled = true;
    await user.save();
    res.json({ success: true, message: "Two-factor authentication enabled", data: { enabled: true } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to enable two-factor authentication" });
  }
};

export const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("password twoFactorSecret twoFactorEnabled");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!(await user.comparePassword(req.body.password || ""))) return res.status(400).json({ success: false, message: "Current password is incorrect" });
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
    res.json({ success: true, message: "Two-factor authentication disabled", data: { enabled: false } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to disable two-factor authentication" });
  }
};

export const verifyTwoFactorLogin = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.challengeToken, process.env.JWT_SECRET);
    if (decoded.purpose !== "2fa-login") return res.status(401).json({ success: false, message: "Invalid two-factor challenge" });
    const code = cleanCode(req.body.code);
    if (!validCode(code)) return res.status(400).json({ success: false, message: "Enter the 6-digit authenticator code" });
    const user = await User.findById(decoded.id).select("+twoFactorSecret").populate("tenantId", "companyName status subscriptionTier");
    if (!user || !user.twoFactorEnabled || !(await verify({ secret: user.twoFactorSecret, token: code }))) return res.status(401).json({ success: false, message: "Invalid authenticator code" });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId._id, branchId: user.branchId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, message: "Login successful", token, user: { id: user._id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId._id, companyName: user.tenantId.companyName, branchId: user.branchId, subscriptionTier: user.tenantId.subscriptionTier } });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid or expired two-factor challenge" });
  }
};
