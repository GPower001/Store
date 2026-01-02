// import { Router } from "express";
// import { createBranch, getBranches, getBranchById, deleteBranch } from "../controllers/branchController.js";

// const router = Router();

// router.post("/", createBranch);     // Add new branch
// router.get("/", getBranches);       // Get all branches
// router.get("/:id", getBranchById);  // Get single branch
// router.delete("/:id", deleteBranch);// Delete branch

// export default router;


import { Router } from "express";
import { createBranch, getBranches, deleteBranch } from "../controllers/branchController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminOnly.js";

const router = Router();

router.post("/", createBranch);   // Create branch
router.get("/", getBranches);     // Fetch all branches
router.delete("/:id", authenticate, adminOnly, deleteBranch);

export default router;

