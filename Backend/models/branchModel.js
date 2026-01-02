// import mongoose from "mongoose";

// const branchSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     location: { type: String },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Branch", branchSchema);


import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Branch", branchSchema);
