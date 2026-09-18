import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true  // Index for faster lookups
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    reason: {
      type: String,
      enum: ["logout", "password_change", "account_deactivation"],
      default: "logout"
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  { timestamps: true }
);

// TTL Index - MongoDB will automatically delete documents after expiresAt
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for faster user queries
tokenBlacklistSchema.index({ userId: 1 });

export default mongoose.model("TokenBlacklist", tokenBlacklistSchema);