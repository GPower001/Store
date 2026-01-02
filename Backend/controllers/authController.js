// import { registerUser, loginUser } from "../services/authService.js";

// const register = async (req, res) => {
//   try {
//     const response = await registerUser(req.body);
//     res.status(201).json(response);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const response = await loginUser(req.body);
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export { register, login };


// import { registerUser, loginUser } from "../services/authService.js";

// const register = async (req, res) => {
//   try {
//     const { name, role, branchId, branchName, branchLocation, password } = req.body;

//     const response = await registerUser({ name, role, branchId, branchName, branchLocation, password });
//     res.status(201).json(response);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { name, password } = req.body;
//     const response = await loginUser({ name, password });
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export { register, login };


import { registerUser, loginUser } from "../services/authService.js";
import User from "../models/userModel.js"; // Add this import

const register = async (req, res) => {
  try {
    const { name, role, branchId, branchName, branchLocation, password } = req.body;

    const response = await registerUser({ name, role, branchId, branchName, branchLocation, password });
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { name, password } = req.body;
    const response = await loginUser({ name, password });
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ADD THESE NEW FUNCTIONS:

/**
 * @desc Get all users (Admin only)
 * @route GET /api/auth/users
 * @access Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
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
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, branchId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    if (email) user.email = email;
    user.role = role || user.role;
    user.branchId = branchId || user.branchId;

    // Only update password if provided
    if (password) {
      user.password = password;
    }

    await user.save();

    // Return user without password
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
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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

export { register, login, getAllUsers, updateUser, deleteUser };
