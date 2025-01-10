import express from "express";
import { protectedRoute } from "../midleware/protectRoute.js";
import {
  deleteNotification,
  getNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protectedRoute, getNotifications);
router.delete("/", protectedRoute, deleteNotification);

export default router;
