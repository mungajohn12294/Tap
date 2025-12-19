// server/routes/chat.js
import express from "express";
const router = express.Router();

// Example: a GET endpoint just to test
router.get("/", (req, res) => {
  res.send("Chat route works!");
});

export default router;
