import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { fullName, userName, password, email } = req.body;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existingUser) {
      if (existingUser.userName === userName) {
        return res.status(400).json({ error: "Username already taken" });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already taken" });
      }
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password should be of minimum length 6" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      fullName,
      userName,
      password: hashedPassword,
      email,
    });

    await newUser.save(); // Save the user to the database

    // Set JWT cookie
    generateTokenAndSetCookie(newUser._id, res);

    // Respond with user data
    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      userName: newUser.userName,
      email: newUser.email,
      profileImg: newUser.profileImg,
      followers: newUser.followers,
      following: newUser.following,
      coverImg: newUser.coverImg,
    });
  } catch (err) {
    console.error("Error in signup controller", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(400).json({ error: "Username not found" });
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Generate token and set cookie
    generateTokenAndSetCookie(user._id, res);

    // Send success response
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      userName: user.userName,
      email: user.email,
      profileImg: user.profileImg,
      followers: user.followers,
      following: user.following,
      coverImg: user.coverImg,
    });
  } catch (err) {
    console.error("Error in login controller", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error in login controller", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error("Error in getme controller", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};
