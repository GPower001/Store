import dotenv from "dotenv";
import mongoose from "mongoose";
import Tenant from "../models/Tenant.js";

dotenv.config();

const migrateSubscriptionModel = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get all tenants
    const tenants = await Tenant.find({});
    console.log(`\n Found ${tenants.length} tenants to migrate\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const tenant of tenants) {
      try {
        // Calculate new limits
        const oldMaxUsers = tenant.maxUsers || 10;
        const newMaxAdmins = 1;
        const newMaxStaff = tenant.subscriptionTier === "free" ? 1 : (oldMaxUsers - 1);
        
        // Determine trial status
        const isFreePlan = tenant.subscriptionTier === "free";
        const shouldBeTrial = isFreePlan && !tenant.subscriptionStartDate;
        
        // Calculate trial dates
        const trialStart = tenant.createdAt || new Date();
        const trialEnd = new Date(trialStart);
        trialEnd.setDate(trialEnd.getDate() + 30);
        
        // Update tenant
        tenant.maxAdmins = newMaxAdmins;
        tenant.maxStaff = newMaxStaff;
        tenant.additionalStaff = tenant.additionalStaff || 0;
        tenant.monthlyStaffCost = tenant.monthlyStaffCost || 0;
        
        if (shouldBeTrial) {
          tenant.status = "trial";
        }
        
        if (!tenant.trialStartDate) {
          tenant.trialStartDate = trialStart;
          tenant.trialEndsAt = trialEnd;
        }
        
        // Remove old field
        tenant.maxUsers = undefined;
        
        await tenant.save();
        
        console.log(` ${tenant.companyName} (${tenant.email})`);
        console.log(`   Limits: ${newMaxAdmins} admin + ${newMaxStaff} staff`);
        console.log(`   Status: ${tenant.status}`);
        console.log("---");
        
        successCount++;
      } catch (error) {
        console.error(`Error updating ${tenant.email}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n Migration completed!`);
    console.log(`   Success: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateSubscriptionModel();