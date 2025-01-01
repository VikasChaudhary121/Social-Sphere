import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  // Wrap userId in an object
  const payload = { id: userId };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    httpOnly: true, // Prevent access from client-side JavaScript
    sameSite: "strict", // CSRF protection
    secure: process.env.NODE_ENV !== "development", // Use HTTPS in production
  });
};
