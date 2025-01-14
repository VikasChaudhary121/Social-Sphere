import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    if (!text && !img) {
      return res.status(404).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = cloudinary.uploader.upload(img);
      img = (await uploadedResponse).secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in creating post", err);
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the post by ID
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Authorization check
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    // Delete image from Cloudinary if it exists
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(imgId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        return res.status(500).json({ error: "Failed to delete image" });
      }
    }

    // Delete the post
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error in deleting the post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(404).json({ error: "Post must have text " });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = { user: userId, text };

    post.comment.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error in commenting on the post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      //unlike the post...
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      res.status(202).json(updatedLikes);
    } else {
      // like the post...and send notification..
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const nofication = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await nofication.save();
      const updatedLikes = post.likes;
      res.status(200).json(updatedLikes);
    }
  } catch (err) {
    console.error("Error in likeUnlikePost the post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comment.user" });
    if (posts.length == 0) {
      return res.stataus(200).json([]);
    }
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getting all the post:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikedPost = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({ path: "comment.user", select: "-password" });
    res.status(200).json(likedPosts);
  } catch (err) {
    console.error("Error in getting likedposts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "user not found" });
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "user",
        select: "-password",
      });
    res.status(200).json(feedPosts);
  } catch (err) {
    console.log("error in getFollowingPosts controller:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getPostByUser = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ userName: username });
    if (!user) return res.status(404).json({ error: "user not found" });
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comment.user",
        select: "-password",
      });
    res.status(200).json(posts);
  } catch (err) {
    console.log("error in getPostsByUser controller:", err);
    res.status(500).json({ error: err.message });
  }
};
