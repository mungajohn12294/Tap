// server/routes/users.js
import express from "express";
import User from "../models/User.js"; // Make sure you have a User model

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
