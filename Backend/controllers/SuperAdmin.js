import SuperAdmin from "../models/SuperAdmin.js";
import Tenant from "../models/Tenant.js";
import User from "../models/userModel.js";
import Branch from "../models/branchModel.js";
import Item from "../models/Item.js";
import StockMovement from "../models/StockMovement.js";
import jwt from "jsonwebtoken";

/**
 * @desc Super Admin Login
 * @route POST /api/super-admin/login
 * @access Public
 */
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find super admin
    const superAdmin = await SuperAdmin.findOne({ 
      email: email.toLowerCase() 
    });

    if (!superAdmin) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check if account is locked
    if (superAdmin.isLocked()) {
      return res.status(423).json({
        message: "Account is temporarily locked due to too many failed login attempts. Try again later.",
      });
    }

    // Check if active
    if (!superAdmin.isActive) {
      return res.status(401).json({
        message: "Account is inactive.",
      });
    }

    // Verify password
    const isPasswordValid = await superAdmin.comparePassword(password);
    
    if (!isPasswordValid) {
      await superAdmin.incLoginAttempts();
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Reset login attempts on successful login
    await superAdmin.resetLoginAttempts();

    // Update last login
    superAdmin.lastLogin = new Date();
    await superAdmin.save();

    // Generate token
    const token = jwt.sign(
      {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: "SuperAdmin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      token,
      superAdmin: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: "SuperAdmin",
        permissions: superAdmin.permissions,
      },
    });
  } catch (error) {
    console.error("Super Admin Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get all tenants with statistics
 * @route GET /api/super-admin/tenants
 * @access Private/SuperAdmin
 */
export const getAllTenants = async (req, res) => {
  try {
    const { status, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { companyName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    // Get tenants
    const tenants = await Tenant.find(filter)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .lean();

    // Get statistics for each tenant
    const tenantsWithStats = await Promise.all(
      tenants.map(async (tenant) => {
        const [userCount, branchCount, itemCount] = await Promise.all([
          User.countDocuments({ tenantId: tenant._id }),
          Branch.countDocuments({ tenantId: tenant._id }),
          Item.countDocuments({ tenantId: tenant._id }),
        ]);

        return {
          ...tenant,
          stats: {
            users: userCount,
            branches: branchCount,
            items: itemCount,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: tenantsWithStats,
    });
  } catch (error) {
    console.error("Get All Tenants Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get single tenant details
 * @route GET /api/super-admin/tenants/:id
 * @access Private/SuperAdmin
 */
export const getTenantDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findById(id).lean();
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Get detailed statistics
    const [users, branches, items, recentActivity] = await Promise.all([
      User.find({ tenantId: id }).select("name email role createdAt").lean(),
      Branch.find({ tenantId: id }).select("name location isActive").lean(),
      Item.countDocuments({ tenantId: id }),
      StockMovement.find({ tenantId: id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("itemId", "name")
        .populate("userId", "name")
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...tenant,
        users,
        branches,
        stats: {
          totalUsers: users.length,
          totalBranches: branches.length,
          totalItems: items,
        },
        recentActivity,
      },
    });
  } catch (error) {
    console.error("Get Tenant Details Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Update tenant (subscription, limits, status)
 * @route PUT /api/super-admin/tenants/:id
 * @access Private/SuperAdmin
 */
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      companyName,
      email,
      status,
      subscriptionTier,
      maxBranches,
      maxUsers,
      maxItems,
      subscriptionEndDate,
    } = req.body;

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Update fields
    if (companyName) tenant.companyName = companyName;
    if (email) tenant.email = email.toLowerCase();
    if (status) tenant.status = status;
    if (subscriptionTier) tenant.subscriptionTier = subscriptionTier;
    if (maxBranches !== undefined) tenant.maxBranches = maxBranches;
    if (maxUsers !== undefined) tenant.maxUsers = maxUsers;
    if (maxItems !== undefined) tenant.maxItems = maxItems;
    if (subscriptionEndDate) tenant.subscriptionEndDate = subscriptionEndDate;

    await tenant.save();

    res.status(200).json({
      success: true,
      data: tenant,
      message: "Tenant updated successfully",
    });
  } catch (error) {
    console.error("Update Tenant Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Suspend/Activate tenant
 * @route PATCH /api/super-admin/tenants/:id/status
 * @access Private/SuperAdmin
 */
export const changeTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be: active, suspended, or cancelled",
      });
    }

    const tenant = await Tenant.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.status(200).json({
      success: true,
      data: tenant,
      message: `Tenant ${status} successfully`,
    });
  } catch (error) {
    console.error("Change Tenant Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Delete tenant (hard delete - careful!)
 * @route DELETE /api/super-admin/tenants/:id
 * @access Private/SuperAdmin
 */
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmEmail } = req.body;

    const tenant = await Tenant.findById(id);
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Require email confirmation for safety
    if (confirmEmail !== tenant.email) {
      return res.status(400).json({
        message: "Email confirmation does not match. Deletion cancelled.",
      });
    }

    // Cascade delete all tenant data
    await Promise.all([
      User.deleteMany({ tenantId: id }),
      Branch.deleteMany({ tenantId: id }),
      Item.deleteMany({ tenantId: id }),
      StockMovement.deleteMany({ tenantId: id }),
      Tenant.findByIdAndDelete(id),
    ]);

    res.status(200).json({
      success: true,
      message: `Tenant "${tenant.companyName}" and all associated data deleted successfully`,
    });
  } catch (error) {
    console.error("Delete Tenant Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get system-wide statistics
 * @route GET /api/super-admin/statistics
 * @access Private/SuperAdmin
 */
export const getSystemStatistics = async (req, res) => {
  try {
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalUsers,
      totalBranches,
      totalItems,
      recentTenants,
    ] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ status: "active" }),
      Tenant.countDocuments({ status: "suspended" }),
      User.countDocuments(),
      Branch.countDocuments(),
      Item.countDocuments(),
      Tenant.find().sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    // Subscription breakdown
    const subscriptionBreakdown = await Tenant.aggregate([
      {
        $group: {
          _id: "$subscriptionTier",
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await Tenant.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalTenants,
          activeTenants,
          suspendedTenants,
          totalUsers,
          totalBranches,
          totalItems,
        },
        subscriptionBreakdown,
        monthlyGrowth,
        recentTenants,
      },
    });
  } catch (error) {
    console.error("Get System Statistics Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Get super admin profile
 * @route GET /api/super-admin/me
 * @access Private/SuperAdmin
 */
export const getSuperAdminProfile = async (req, res) => {
  try {
    const superAdmin = await SuperAdmin.findById(req.superAdmin.id).select(
      "-password"
    );

    if (!superAdmin) {
      return res.status(404).json({ message: "Super admin not found" });
    }

    res.status(200).json({
      success: true,
      data: superAdmin,
    });
  } catch (error) {
    console.error("Get Super Admin Profile Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Create new super admin
 * @route POST /api/super-admin/create
 * @access Private/SuperAdmin
 */
export const createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Check if super admin already exists
    const existing = await SuperAdmin.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existing) {
      return res.status(400).json({
        message: "Super admin with this email already exists",
      });
    }

    const newSuperAdmin = new SuperAdmin({
      name,
      email: email.toLowerCase(),
      password,
    });

    await newSuperAdmin.save();

    res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      data: {
        id: newSuperAdmin._id,
        name: newSuperAdmin.name,
        email: newSuperAdmin.email,
      },
    });
  } catch (error) {
    console.error("Create Super Admin Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};