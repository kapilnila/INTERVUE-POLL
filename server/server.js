import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import pollRoutes from "./routes/poll.routes.js";
import pollSocket from "./sockets/poll.socket.js";

dotenv.config();

const app = express();

/* 🔥 CORS — THIS FIXES YOUR ISSUE */
app.use(cors({
  origin: ["http://localhost:5173",
     "https://intervue-poll-alpha.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173",
       "https:intervue-poll-pied.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

mongoose.connect(process.env.MONGO_URI);

app.use("/api/poll", pollRoutes);

pollSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
