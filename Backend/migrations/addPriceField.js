import mongoose from "mongoose";
import dotenv from "dotenv";
import Item from "../models/Item.js";
import connectDB from "../config/db.js";

dotenv.config();

const migratePrice = async () => {
  try {
    await connectDB();
    
    console.log("Starting migration: Adding price field...");
    
    const result = await Item.updateMany(
      { price: { $exists: false } }, // Only update items without price
      { $set: { price: 0 } }         // Set default price to 0
    );
    
    console.log(`✅ Migration complete! Updated ${result.modifiedCount} items.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migratePrice();