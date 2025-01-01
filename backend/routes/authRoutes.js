import express from "express";

import {
  getMe,
  signup,
  login,
  logout,
} from "../controllers/authControllers.js";
import { protectedRoute } from "../midleware/protectRoute.js";

const router = express.Router();

router.get("/me", protectedRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
