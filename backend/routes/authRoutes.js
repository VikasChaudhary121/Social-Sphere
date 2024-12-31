import express from "express";

import { signup, login, logout } from "../controllers/authControllers.js";

const router = express.Router();

router.get("/signup", signup);
router.get("/login", login);
router.get("/logout", logout);

export default router;
