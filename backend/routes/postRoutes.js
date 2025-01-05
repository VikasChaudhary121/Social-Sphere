import express from "express";
import { protectedRoute } from "../midleware/protectRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  getFollowingPosts,
  getLikedPost,
  getPostByUser,
  likeUnlikePost,
} from "../controllers/postControllers.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllPosts);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/likes/:id", protectedRoute, getLikedPost);
router.get("/user/:username", protectedRoute, getPostByUser);
router.post("/create", protectedRoute, createPost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.delete("/:id", protectedRoute, deletePost);

export default router;
