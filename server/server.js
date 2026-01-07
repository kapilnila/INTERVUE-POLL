import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // ok for assignment; restrict in real prod
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// --- MongoDB (optional persistence) ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// --- In-memory state (simple & reliable) ---
let currentPoll = null;
let results = {};

// --- Socket logic ---
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // ✅ Send active poll to late joiners (CRITICAL)
  if (currentPoll) {
    socket.emit("poll_state", currentPoll);
    socket.emit("poll_results", results);
  }

  // --- Teacher creates poll ---
  socket.on("create_poll", (poll) => {
    currentPoll = {
      ...poll,
      startedAt: Date.now(),
    };

    results = {};
    poll.options.forEach((o) => {
      results[o.id] = 0;
    });

    console.log("Poll created → broadcasting");

    // 🚨 MUST be io.emit (not socket.emit)
    io.emit("poll_state", currentPoll);
    io.emit("poll_results", results);
  });

  // --- Student votes ---
  socket.on("vote", (optionId) => {
    if (!currentPoll) return;

    results[optionId] = (results[optionId] || 0) + 1;

    io.emit("poll_results", results);
  });

  // --- Poll end ---
  socket.on("end_poll", () => {
    currentPoll = null;
    results = {};

    io.emit("poll_ended");
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// --- Health check ---
app.get("/", (_, res) => res.send("Server running"));

const PORT = process.env.PORT || 10000;
server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
