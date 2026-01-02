// syncIndexes.js
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Item from "./models/Item.js";

dotenv.config({ path: "./Backend/.env" }); // 👈 important

const run = async () => {
  try {
    await connectDB();
    console.log("✅ Connected to DB");

    await Item.syncIndexes();
    console.log("✅ Item indexes synced successfully!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to sync indexes:", err.message);
    process.exit(1);
  }
};

run();
