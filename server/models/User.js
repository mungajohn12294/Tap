// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String, // hashed in production
});

const User = mongoose.model("User", userSchema);

export default User;
