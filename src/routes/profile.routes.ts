import { Router } from "express";
import {
  analyzeProfile,
  getAllProfiles,
  getTopProfiles,
  getProfileById,
} from "../controllers/profile.controller";

const router = Router();

// POST /api/profiles/analyze
router.post("/analyze", analyzeProfile);

// GET /api/profiles/top  — must be BEFORE /:id so "top" is not treated as an id
router.get("/top", getTopProfiles);

// GET /api/profiles
router.get("/", getAllProfiles);

// GET /api/profiles/:id
router.get("/:id", getProfileById);

export default router;
