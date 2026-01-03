// import Branch from "../models/branchModel.js";
// import Item from "../models/Item.js";
// import Notification from "../models/notificationModel.js";
// import User from "../models/userModel.js";

// /* ============================
//    GET ALL BRANCHES
// ============================ */
// export const getBranches = async (req, res) => {
//   try {
//     const branches = await Branch.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: branches || [] });
//   } catch (error) {
//     console.error("Get Branches Error:", error);
//     res.status(500).json({ message: "Failed to fetch branches" });
//   }
// };

// /* ============================
//    CREATE NEW BRANCH
// ============================ */
// export const createBranch = async (req, res) => {
//   try {
//     const { name } = req.body;

//     if (!name || !name.trim()) {
//       return res.status(400).json({ message: "Branch name is required" });
//     }

//     const cleanName = name.trim();

//     // Check duplicate
//     const exists = await Branch.findOne({ name: new RegExp(`^${cleanName}$`, "i") });
//     if (exists) {
//       return res.status(400).json({ message: "Branch with this name already exists" });
//     }

//     const branch = new Branch({ name: cleanName });
//     const savedBranch = await branch.save();

//     res.status(201).json({ success: true, data: savedBranch, message: "Branch created successfully" });
//   } catch (error) {
//     console.error("Create Branch Error:", error);
//     res.status(500).json({ message: "Failed to create branch" });
//   }
// };

// /* ============================
//    DELETE BRANCH (ADMIN ONLY)
// ============================ */
// export const deleteBranch = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Ensure user is admin
//     if (!req.user || req.user.role !== "Admin") {
//       return res.status(403).json({ message: "Admins only" });
//     }

//     const branch = await Branch.findById(id);
//     if (!branch) {
//       return res.status(404).json({ message: "Branch not found" });
//     }

//     // Cascade delete
//     await Promise.all([
//       Item.deleteMany({ branchId: id }),
//       Notification.deleteMany({ branchId: id }),
//       User.deleteMany({ branchId: id, role: { $ne: "Admin" } }),
//       Branch.findByIdAndDelete(id),
//     ]);

//     res.status(200).json({ success: true, message: "Branch deleted successfully" });
//   } catch (error) {
//     console.error("Delete Branch Error:", error);
//     // Return detailed error to frontend
//     res.status(500).json({ message: error.message || "Failed to delete branch" });
//   }
// };


import Branch from "../models/branchModel.js";
import Item from "../models/Item.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";
import Tenant from "../models/Tenant.js";

/**
 * @desc Get all branches for tenant
 * @route GET /api/branches
 * @access Private
 */
export const getBranches = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    
    const branches = await Branch.find({ tenantId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json({ success: true, data: branches || [] });
  } catch (error) {
    console.error("Get Branches Error:", error);
    res.status(500).json({ message: "Failed to fetch branches" });
  }
};

/**
 * @desc Create new branch
 * @route POST /api/branches
 * @access Private/Admin
 */
export const createBranch = async (req, res) => {
  try {
    const { name, location, address, phone, managerName } = req.body;
    const tenantId = req.user.tenantId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Branch name is required" });
    }

    const cleanName = name.trim();

    // Check if tenant has reached branch limit
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const branchCount = await Branch.countDocuments({ tenantId });
    if (branchCount >= tenant.maxBranches) {
      return res.status(400).json({ 
        message: `Branch limit reached (${tenant.maxBranches}). Please upgrade your subscription.` 
      });
    }

    // Check for duplicate branch name within tenant
    const exists = await Branch.findOne({ 
      name: new RegExp(`^${cleanName}$`, "i"),
      tenantId 
    });
    
    if (exists) {
      return res.status(400).json({ 
        message: "A branch with this name already exists in your organization" 
      });
    }

    const branch = new Branch({
      name: cleanName,
      location,
      address,
      phone,
      managerName,
      tenantId,
      isActive: true,
    });

    const savedBranch = await branch.save();

    res.status(201).json({
      success: true,
      data: savedBranch,
      message: "Branch created successfully",
    });
  } catch (error) {
    console.error("Create Branch Error:", error);
    res.status(500).json({ message: "Failed to create branch" });
  }
};

/**
 * @desc Get single branch by ID
 * @route GET /api/branches/:id
 * @access Private
 */
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const branch = await Branch.findOne({ _id: id, tenantId }).lean();
    
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Get branch statistics
    const itemCount = await Item.countDocuments({ branchId: id, tenantId });
    const userCount = await User.countDocuments({ branchId: id, tenantId });

    res.status(200).json({
      success: true,
      data: {
        ...branch,
        stats: {
          itemCount,
          userCount,
        },
      },
    });
  } catch (error) {
    console.error("Get Branch Error:", error);
    res.status(500).json({ message: "Failed to fetch branch" });
  }
};

/**
 * @desc Update branch
 * @route PUT /api/branches/:id
 * @access Private/Admin
 */
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;
    const { name, location, address, phone, managerName, isActive } = req.body;

    // Find branch - must belong to same tenant
    const branch = await Branch.findOne({ _id: id, tenantId });
    
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Check for duplicate name if name is being changed
    if (name && name !== branch.name) {
      const exists = await Branch.findOne({
        name: new RegExp(`^${name.trim()}$`, "i"),
        tenantId,
        _id: { $ne: id },
      });
      
      if (exists) {
        return res.status(400).json({ 
          message: "A branch with this name already exists" 
        });
      }
      
      branch.name = name.trim();
    }

    // Update other fields
    if (location !== undefined) branch.location = location;
    if (address !== undefined) branch.address = address;
    if (phone !== undefined) branch.phone = phone;
    if (managerName !== undefined) branch.managerName = managerName;
    if (isActive !== undefined) branch.isActive = isActive;

    const updatedBranch = await branch.save();

    res.status(200).json({
      success: true,
      data: updatedBranch,
      message: "Branch updated successfully",
    });
  } catch (error) {
    console.error("Update Branch Error:", error);
    res.status(500).json({ message: "Failed to update branch" });
  }
};

/**
 * @desc Delete branch (Admin only)
 * @route DELETE /api/branches/:id
 * @access Private/Admin
 */
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    // Ensure user is admin
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    // Find branch - must belong to same tenant
    const branch = await Branch.findOne({ _id: id, tenantId });
    
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Prevent deleting the last branch
    const branchCount = await Branch.countDocuments({ tenantId });
    if (branchCount <= 1) {
      return res.status(400).json({
        message: "Cannot delete the last branch. Organizations must have at least one branch.",
      });
    }

    // Check if branch has items
    const itemCount = await Item.countDocuments({ branchId: id, tenantId });
    if (itemCount > 0) {
      return res.status(400).json({
        message: `Cannot delete branch with ${itemCount} items. Please move or delete items first.`,
      });
    }

    // Check if branch has users
    const userCount = await User.countDocuments({ branchId: id, tenantId });
    if (userCount > 0) {
      return res.status(400).json({
        message: `Cannot delete branch with ${userCount} users. Please reassign users first.`,
      });
    }

    // Safe to delete - cascade delete related data
    await Promise.all([
      Item.deleteMany({ branchId: id, tenantId }),
      Notification.deleteMany({ branchId: id, tenantId }),
      Branch.findByIdAndDelete(id),
    ]);

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (error) {
    console.error("Delete Branch Error:", error);
    res.status(500).json({ 
      message: error.message || "Failed to delete branch" 
    });
  }
};