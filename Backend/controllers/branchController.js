// import Branch from "../models/branchModel.js";

// // ✅ Create a new branch
// export const createBranch = async (req, res) => {
//   try {
//     const { name, location } = req.body;

//     if (!name) {
//       return res.status(400).json({ success: false, message: "Branch name is required" });
//     }

//     // Check if branch already exists
//     const existing = await Branch.findOne({ name });
//     if (existing) {
//       return res.status(400).json({ success: false, message: "Branch already exists" });
//     }

//     const branch = new Branch({ name, location });
//     await branch.save();

//     res.status(201).json({ success: true, data: branch });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Get all branches
// export const getBranches = async (req, res) => {
//   try {
//     const branches = await Branch.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, data: branches });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Get a single branch by ID
// export const getBranchById = async (req, res) => {
//   try {
//     const branch = await Branch.findById(req.params.id);
//     if (!branch) {
//       return res.status(404).json({ success: false, message: "Branch not found" });
//     }
//     res.status(200).json({ success: true, data: branch });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Delete a branch
// export const deleteBranch = async (req, res) => {
//   try {
//     const branch = await Branch.findByIdAndDelete(req.params.id);
//     if (!branch) {
//       return res.status(404).json({ success: false, message: "Branch not found" });
//     }
//     res.status(200).json({ success: true, message: "Branch deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// import Branch from "../models/branchModel.js";

// // Add a new branch
// export const createBranch = async (req, res) => {
//   try {
//     const { name, location } = req.body;

//     if (!name) {
//       return res.status(400).json({ success: false, message: "Branch name is required" });
//     }

//     // Check if branch with same name exists
//     const existing = await Branch.findOne({ name });
//     if (existing) {
//       return res.status(400).json({ success: false, message: "Branch already exists" });
//     }

//     const branch = new Branch({ name, location });
//     await branch.save();

//     res.status(201).json({ success: true, data: branch });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ✅ Get all branches
// export const getBranches = async (req, res) => {
//   try {
//     const branches = await Branch.find().select("_id name location");
//     res.status(200).json({ success: true, data: branches });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const deleteBranch = async (req, res) => {
//   try {
//     // 🛡️ Defensive check
//     if (req.user.role !== "Admin") {
//       return res.status(403).json({ message: "Admins only" });
//     }

//     const { id } = req.params;

//     const branch = await Branch.findById(id);
//     if (!branch) {
//       return res.status(404).json({ message: "Branch not found" });
//     }

//     // 🧹 Controlled cascade delete
//     await Promise.all([
//       Item.deleteMany({ branchId: id }),
//       Notification.deleteMany({ branchId: id }),
//       User.deleteMany({ branchId: id, role: { $ne: "Admin" } }),
//       Branch.findByIdAndDelete(id),
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "Branch deleted successfully",
//     });
//   } catch (error) {
//     console.error("Delete Branch Error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

import Branch from "../models/branchModel.js";
import Item from "../models/Item.js";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

/* ============================
   GET ALL BRANCHES
============================ */
export const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: branches || [] });
  } catch (error) {
    console.error("Get Branches Error:", error);
    res.status(500).json({ message: "Failed to fetch branches" });
  }
};

/* ============================
   CREATE NEW BRANCH
============================ */
export const createBranch = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Branch name is required" });
    }

    const cleanName = name.trim();

    // Check duplicate
    const exists = await Branch.findOne({ name: new RegExp(`^${cleanName}$`, "i") });
    if (exists) {
      return res.status(400).json({ message: "Branch with this name already exists" });
    }

    const branch = new Branch({ name: cleanName });
    const savedBranch = await branch.save();

    res.status(201).json({ success: true, data: savedBranch, message: "Branch created successfully" });
  } catch (error) {
    console.error("Create Branch Error:", error);
    res.status(500).json({ message: "Failed to create branch" });
  }
};

/* ============================
   DELETE BRANCH (ADMIN ONLY)
============================ */
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user is admin
    if (!req.user || req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admins only" });
    }

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // Cascade delete
    await Promise.all([
      Item.deleteMany({ branchId: id }),
      Notification.deleteMany({ branchId: id }),
      User.deleteMany({ branchId: id, role: { $ne: "Admin" } }),
      Branch.findByIdAndDelete(id),
    ]);

    res.status(200).json({ success: true, message: "Branch deleted successfully" });
  } catch (error) {
    console.error("Delete Branch Error:", error);
    // Return detailed error to frontend
    res.status(500).json({ message: error.message || "Failed to delete branch" });
  }
};