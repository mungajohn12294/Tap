import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  from: { type: String, required: true }, // UID
  to: { type: String, required: true },   // UID
  text: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);
