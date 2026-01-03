/**
 * Create Initial Super Admin Script
 * 
 * Run this ONCE to create your first super admin account
 * 
 * Usage: node createSuperAdmin.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import SuperAdmin from "./models/SuperAdmin.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const createSuperAdmin = async () => {
  try {
    console.log("\n🔐 Super Admin Account Setup");
    console.log("================================\n");

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to database\n");

    // Check if super admin already exists
    const existingCount = await SuperAdmin.countDocuments();
    if (existingCount > 0) {
      console.log("⚠️  Warning: Super admin account(s) already exist!");
      const proceed = await askQuestion("Do you want to create another? (yes/no): ");
      if (proceed.toLowerCase() !== "yes") {
        console.log("\nSetup cancelled.");
        rl.close();
        process.exit(0);
      }
    }

    // Get super admin details
    console.log("Please enter super admin details:\n");
    
    const name = await askQuestion("Full Name: ");
    if (!name || name.trim().length === 0) {
      console.log("\n❌ Name is required!");
      rl.close();
      process.exit(1);
    }

    const email = await askQuestion("Email: ");
    if (!email || !email.includes("@")) {
      console.log("\n❌ Valid email is required!");
      rl.close();
      process.exit(1);
    }

    // Check if email already exists
    const existingEmail = await SuperAdmin.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingEmail) {
      console.log("\n❌ Super admin with this email already exists!");
      rl.close();
      process.exit(1);
    }

    const password = await askQuestion("Password (min 8 characters): ");
    if (!password || password.length < 8) {
      console.log("\n❌ Password must be at least 8 characters!");
      rl.close();
      process.exit(1);
    }

    const confirmPassword = await askQuestion("Confirm Password: ");
    if (password !== confirmPassword) {
      console.log("\n❌ Passwords do not match!");
      rl.close();
      process.exit(1);
    }

    console.log("\n⏳ Creating super admin account...");

    // Create super admin
    const superAdmin = new SuperAdmin({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      isActive: true,
      permissions: {
        canManageTenants: true,
        canViewAnalytics: true,
        canManageSubscriptions: true,
        canAccessAllData: true,
        canSuspendTenants: true,
      },
    });

    await superAdmin.save();

    console.log("\n✅ Super Admin created successfully!");
    console.log("\n📋 Account Details:");
    console.log(`   Name: ${superAdmin.name}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: SuperAdmin`);
    console.log(`   ID: ${superAdmin._id}`);
    console.log("\n🔐 Login at: POST /api/super-admin/login");

  } catch (error) {
    console.error("\n❌ Error creating super admin:", error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed\n");
    process.exit(0);
  }
};

// Run the script
createSuperAdmin();