import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema({
  pollId: mongoose.Schema.Types.ObjectId,
  studentId: String,
  optionId: String
});

VoteSchema.index({ pollId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Vote", VoteSchema);
