import express from "express";
import { getPollHistory } from "../services/poll.service.js";

const router = express.Router();

router.get("/history", async (req, res) => {
  try {
    const history = await getPollHistory();
    res.json(history);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
