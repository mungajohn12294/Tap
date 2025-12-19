// server/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

import chatRoutes from "./routes/chat.js"; // your chat API routes
import userRoutes from "./routes/users.js"; // your user API routes
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb+srv://mungajohn12294:munga12294<>@cluster0.efm1nxm.mongodb.net/?appName=Cluster0", {
  // options removed, latest mongoose doesn't need useNewUrlParser/useUnifiedTopology
}).then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/chat", chatRoutes);
app.use("/users", userRoutes);

// Socket.IO logic
let onlineUsers = {}; // { userId: socket.id }

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  // Add user to online list
  socket.on("addUser", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("getUsers", Object.keys(onlineUsers));
  });

  // Typing indicator
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { senderId });
    }
  });

  // Send message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("getMessage", { senderId, text, createdAt: Date.now() });
    }
  });

  // Remove user on disconnect
  socket.on("disconnect", () => {
    onlineUsers = Object.fromEntries(
      Object.entries(onlineUsers).filter(([_, id]) => id !== socket.id)
    );
    io.emit("getUsers", Object.keys(onlineUsers));
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
