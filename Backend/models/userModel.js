// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     password: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);


// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     role: { type: String, enum: ["staff", "manager", "admin"], default: "staff" }, // ✅ new
//     branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true }, // ✅ new
//   },
//   { timestamps: true }
// );

// export default mongoose.model("User", userSchema);


import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "Nurse" },
    branchId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: false   // ❌ make it optional at schema level
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);


