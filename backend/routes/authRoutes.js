const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Register
router.post("/register", async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const existingUserName = await User.findOne({ username });
    if (existingUserName)
      return res.status(400).json({ message: "Username already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      passwordHash: hashedPassword,
      username
    });
    await user.save();

    req.session.userId = user._id;
    res.status(201).json({ message: "User registered", userId: user._id });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    req.session.userId = user._id;
    res
      .status(200)
      .json({ message: "Logged in successfully", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.status(200).json({ message: "Logged out" });
  });
});

// Auth check
router.get("/me", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Not logged in" });

  const user = await User.findById(req.session.userId).select("-passwordHash");
  res.status(200).json({ user });
});

module.exports = router;
