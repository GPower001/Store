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

// import User from "../models/userModel.js";
// import Branch from "../models/branchModel.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// // ✅ Register user - must belong to an existing branch OR Admin with global access
// const registerUser = async ({ name, password, role = "Nurse", branchId, branchName, branchLocation }) => {
//   const existingUser = await User.findOne({ name });
//   if (existingUser) throw new Error("User already exists");

//   let branch = null;

//   if (role === "Admin") {
//     // ✅ Admins don’t need a branch
//     branch = null;
//   } else if (branchId) {
//     // ✅ If branchId is passed, verify it exists
//     branch = await Branch.findById(branchId);
//     if (!branch) throw new Error("Invalid branch ID - branch does not exist");
//   } else if (branchName) {
//     // ✅ If no branchId but branchName is given, create a new branch
//     const existingBranch = await Branch.findOne({ name: branchName });
//     if (existingBranch) {
//       branch = existingBranch;
//     } else {
//       branch = new Branch({ name: branchName, location: branchLocation || "" });
//       await branch.save();
//     }
//   } else {
//     throw new Error("Either branchId or branchName is required for non-admin roles");
//   }

//   const hashedPassword = await bcrypt.hash(password, 10);

//   const newUser = new User({
//     name,
//     password: hashedPassword,
//     role,
//     branchId: branch ? branch._id : null, // ✅ Admin has null
//   });

//   await newUser.save();

//   return {
//     message: "User registered successfully",
//     user: {
//       id: newUser._id,
//       name: newUser.name,
//       role: newUser.role,
//       branchId: newUser.branchId,
//     },
//   };
// };


// // ✅ Login user and return JWT with branchId + role
// const loginUser = async ({ name, password }) => {
//   const user = await User.findOne({ name });
//   if (!user) throw new Error("Invalid credentials");

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) throw new Error("Invalid credentials");

//   const token = jwt.sign(
//     {
//       id: user._id,
//       name: user.name,
//       role: user.role,
//       branchId: user.branchId,
//     },
//     process.env.JWT_SECRET,
//     { expiresIn: "1h" }
//   );

//   return {
//     message: "Login successful",
//     token,
//     user: {
//       id: user._id,
//       name: user.name,
//       role: user.role,
//       branchId: user.branchId,
//     },
//   };
// };

// export { registerUser, loginUser };



import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Tenant from "../models/Tenant.js";
import Branch from "../models/branchModel.js";

/**
 * Register a new tenant (SME) with owner account
 */
export const registerTenant = async (tenantData) => {
  const { companyName, industry, city, state, referralCode, email, password, ownerName, phone } = tenantData;

  // Check if tenant already exists
  const existingTenant = await Tenant.findOne({ email: email.toLowerCase() });
  if (existingTenant) {
    throw new Error("A company with this email already exists");
  }

  // Create subdomain from company name
  const subdomain = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Check subdomain uniqueness
  const existingSubdomain = await Tenant.findOne({ subdomain });
  if (existingSubdomain) {
    throw new Error("Company name already taken. Please choose a different name.");
  }

  // Create tenant
  const tenant = new Tenant({
    companyName,
    industry,
    city,
    state,
    referralCode,
    email: email.toLowerCase(),
    subdomain,
    phone,
    subscriptionTier: "free",
    status: "active",
    maxBranches: 5,
    maxUsers: 10,
    maxItems: 1000,
    // Set trial period (30 days)
    trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await tenant.save();

  // Create default main branch
  const mainBranch = new Branch({
    name: "Main Branch",
    tenantId: tenant._id,
    isActive: true,
  });
  await mainBranch.save();

  // Create owner/admin user
  const owner = new User({
    name: ownerName,
    email: email.toLowerCase(),
    password, // Will be hashed by pre-save hook in userModel
    role: "Admin",
    tenantId: tenant._id,
    branchId: mainBranch._id,
    isActive: true,
  });
  await owner.save();

  // Generate JWT token
  const token = jwt.sign(
    {
      id: owner._id,
      name: owner.name,
      email: owner.email,
      role: owner.role,
      tenantId: tenant._id,
      branchId: mainBranch._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    message: "Tenant registered successfully",
    token,
    user: {
      id: owner._id,
      name: owner.name,
      email: owner.email,
      role: owner.role,
      tenantId: tenant._id,
      companyName: tenant.companyName,
      branchId: mainBranch._id,
    },
  };
};

/**
 * Register a new user within existing tenant
 */
export const registerUser = async (userData) => {
  const { name, email, password, role, branchId, tenantId } = userData;

  // Validate required fields
  if (!tenantId) {
    throw new Error("Tenant ID is required");
  }

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  // Verify tenant exists and is active
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new Error("Organization not found");
  }

  if (tenant.status !== "active") {
    throw new Error("Organization is not active");
  }

  // Check if user already exists in this tenant
  const existingUser = await User.findOne({ 
    email: email.toLowerCase(), 
    tenantId 
  });
  
  if (existingUser) {
    throw new Error("User with this email already exists in your organization");
  }

  // Check user limit
  const userCount = await User.countDocuments({ tenantId });
  if (userCount >= tenant.maxUsers) {
    throw new Error(`User limit reached (${tenant.maxUsers}). Please upgrade your subscription.`);
  }

  // Handle branch assignment
  let assignedBranchId = null;

  if (role === "Admin") {
    // Admins can optionally have a branch
    assignedBranchId = branchId || null;
  } else {
    // Non-admin users must have a branch
    if (!branchId) {
      throw new Error("Branch ID is required for non-admin users");
    }

    // Verify branch exists and belongs to the same tenant
    const branch = await Branch.findOne({ _id: branchId, tenantId });
    if (!branch) {
      throw new Error("Invalid branch for this organization");
    }

    assignedBranchId = branchId;
  }

  // Create new user
  const newUser = new User({
    name,
    email: email.toLowerCase(),
    password, // Will be hashed by pre-save hook
    role: role || "Nurse",
    tenantId,
    branchId: assignedBranchId,
    isActive: true,
  });

  await newUser.save();

  // Generate token
  const token = jwt.sign(
    {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
      branchId: newUser.branchId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    message: "User registered successfully",
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      tenantId: newUser.tenantId,
      branchId: newUser.branchId,
    },
  };
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Validate input
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user by email with tenant info
  const user = await User.findOne({ 
    email: email.toLowerCase() 
  }).populate("tenantId", "companyName status subscriptionTier");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check if user is active
  if (!user.isActive) {
    throw new Error("Your account has been deactivated. Please contact your administrator.");
  }

  // Check tenant status
  if (!user.tenantId) {
    throw new Error("User is not associated with any organization.");
  }

  if (user.tenantId.status !== "active") {
    throw new Error("Your organization account is not active. Please contact support.");
  }

  // Verify password using the method from userModel
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId._id,
      branchId: user.branchId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId._id,
      companyName: user.tenantId.companyName,
      branchId: user.branchId,
      subscriptionTier: user.tenantId.subscriptionTier,
    },
  };
};