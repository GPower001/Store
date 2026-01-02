// import User from "../models/userModel.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const registerUser = async ({ name, password }) => {
//   const existingUser = await User.findOne({ name });
//   if (existingUser) throw new Error("User already exists");

//   const hashedPassword = await bcrypt.hash(password, 10);
//   const newUser = new User({ name, password: hashedPassword });
//   await newUser.save();

//   return { message: "User registered successfully" };
// };

// const loginUser = async ({ name, password }) => {
//   const user = await User.findOne({ name });
//   if (!user) throw new Error("Invalid credentials");

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) throw new Error("Invalid credentials");

//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
//   return { message: "Login successful", token };
// };

// export { registerUser, loginUser };

import User from "../models/userModel.js";
import Branch from "../models/branchModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ✅ Register user - must belong to an existing branch OR Admin with global access
const registerUser = async ({ name, password, role = "Nurse", branchId, branchName, branchLocation }) => {
  const existingUser = await User.findOne({ name });
  if (existingUser) throw new Error("User already exists");

  let branch = null;

  if (role === "Admin") {
    // ✅ Admins don’t need a branch
    branch = null;
  } else if (branchId) {
    // ✅ If branchId is passed, verify it exists
    branch = await Branch.findById(branchId);
    if (!branch) throw new Error("Invalid branch ID - branch does not exist");
  } else if (branchName) {
    // ✅ If no branchId but branchName is given, create a new branch
    const existingBranch = await Branch.findOne({ name: branchName });
    if (existingBranch) {
      branch = existingBranch;
    } else {
      branch = new Branch({ name: branchName, location: branchLocation || "" });
      await branch.save();
    }
  } else {
    throw new Error("Either branchId or branchName is required for non-admin roles");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    password: hashedPassword,
    role,
    branchId: branch ? branch._id : null, // ✅ Admin has null
  });

  await newUser.save();

  return {
    message: "User registered successfully",
    user: {
      id: newUser._id,
      name: newUser.name,
      role: newUser.role,
      branchId: newUser.branchId,
    },
  };
};


// ✅ Login user and return JWT with branchId + role
const loginUser = async ({ name, password }) => {
  const user = await User.findOne({ name });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      role: user.role,
      branchId: user.branchId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
      branchId: user.branchId,
    },
  };
};

export { registerUser, loginUser };



