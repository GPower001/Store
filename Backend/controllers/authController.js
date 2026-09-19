import jwt from "jsonwebtoken";
import { 
  registerTenant as registerTenantService,
  registerUser as registerUserService,
  loginUser as loginUserService 
} from "../services/authService.js";
import User from "../models/userModel.js";
import Tenant from "../models/Tenant.js";
import TokenBlacklist from "../models/TokenBlacklist.js"

/**
 * @desc Register new tenant (SME signup)
 * @route POST /api/auth/register-tenant
 * @access Public
 */
export const registerTenant = async (req, res) => {
  try {
    const { companyName, industry, city, state, referralCode, email, password, confirmPassword, ownerName, phone } = req.body;

    // Validation
    if (!companyName || !industry || !city || !state || !email || !password || !confirmPassword || !ownerName || !phone) {
      return res.status(400).json({
        message: "Business details, user details, phone, email, password, and password confirmation are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const response = await registerTenantService({
      companyName,
      industry,
      city,
      state,
      referralCode,
      email,
      password,
      ownerName,
      phone,
    });

    res.status(201).json(response);
  } catch (error) {
    console.error("Tenant Registration Error:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * @desc Register new user within tenant
 * @route POST /api/auth/register
 * @access Private (Admin only)
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, branchId } = req.body;
    const tenantId = req.user.tenantId;

    // Only admins can register new users
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        message: "Only administrators can register new users",
      });
    }

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    const response = await registerUserService({
      name,
      email,
      password,
      role,
      branchId,
      tenantId,
    });

    res.status(201).json(response);
  } catch (error) {
    console.error("User Registration Error:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const response = await loginUserService({ email, password });
    res.status(200).json(response);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * @desc Logout user (blacklist token)
 * @route POST /api/auth/logout
 * @access Private
 */
export const logout = async (req, res) => {
  try {
    // Extract token from Authorization header
    let token = req.header("Authorization");
    
    if (!token) {
      return res.status(400).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    // Remove "Bearer " prefix if present
    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    // Decode token to get expiration time
    const decoded = jwt.decode(token);
    
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid token" 
      });
    }

    // Check if token is already blacklisted
    const existingBlacklist = await TokenBlacklist.findOne({ token });
    if (existingBlacklist) {
      return res.status(200).json({
        success: true,
        message: "Already logged out"
      });
    }

    // Add token to blacklist
    await TokenBlacklist.create({
      token,
      userId: req.user.id,
      reason: "logout",
      expiresAt: new Date(decoded.exp * 1000) // Convert to milliseconds
    });

    // Optional: Update user's last logout time
    await User.findByIdAndUpdate(req.user.id, {
      lastLogout: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};


/**
 * @desc Get all users in tenant (Admin only)
 * @route GET /api/auth/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const users = await User.find({ tenantId })
      .select("-password")
      .populate("branchId", "name location")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @desc Update user
 * @route PUT /api/auth/users/:id
 * @access Private/Admin
 */
export const updateUser = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { name, email, password, role, branchId, isActive } = req.body;

    const user = await User.findOne({
      _id: req.params.id,
      tenantId,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    user.name = name || user.name;
    if (email) user.email = email.toLowerCase();
    user.role = role || user.role;
    if (branchId !== undefined) user.branchId = branchId;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      user.password = password;
    }

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select("-password")
      .populate("branchId", "name location");

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/auth/users/:id
 * @access Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const user = await User.findOne({
      _id: req.params.id,
      tenantId,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

/**
 * @desc Get current user profile
 * @route GET /api/auth/me
 * @access Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("branchId", "name location")
      .populate("tenantId", "companyName industry city state phone address billingEmail currency region notificationPreferences subscriptionTier status");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (name?.trim()) user.name = name.trim();
    if (email?.trim()) user.email = email.trim().toLowerCase();
    if (password?.trim()) user.password = password;
    await user.save();
    const updated = await User.findById(user._id).select("-password").populate("tenantId", "companyName industry city state phone address billingEmail currency region notificationPreferences subscriptionTier status").populate("branchId", "name location").lean();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || "Unable to update profile" });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const { companyName, industry, city, state, phone, address, billingEmail, currency, region, notificationPreferences } = req.body;
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: "Organization not found" });
    if (companyName?.trim()) tenant.companyName = companyName.trim();
    if (industry !== undefined) tenant.industry = industry.trim();
    if (city !== undefined) tenant.city = city.trim();
    if (state !== undefined) tenant.state = state.trim();
    if (phone !== undefined) tenant.phone = phone.trim();
    if (address !== undefined) tenant.address = address.trim();
    if (billingEmail !== undefined) tenant.billingEmail = billingEmail.trim().toLowerCase();
    if (currency !== undefined) tenant.currency = currency.trim().toUpperCase();
    if (region !== undefined) tenant.region = region.trim().toUpperCase();
    if (notificationPreferences && typeof notificationPreferences === "object") {
      tenant.notificationPreferences = {
        ...tenant.notificationPreferences?.toObject?.(),
        ...notificationPreferences,
      };
    }
    await tenant.save();
    res.json({ success: true, data: tenant.toObject() });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || "Unable to update organization" });
  }
};