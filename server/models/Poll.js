import mongoose from "mongoose";

const PollSchema = new mongoose.Schema({
  question: String,
  options: [{ id: String, text: String }],
  startedAt: Date,
  duration: Number,
  status: { type: String, enum: ["ACTIVE", "COMPLETED"] }
});

export default mongoose.model("Poll", PollSchema);
