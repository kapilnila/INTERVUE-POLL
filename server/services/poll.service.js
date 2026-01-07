import Poll from "../models/Poll.js";
import Vote from "../models/Vote.js";

export const createPoll = async (data) => {
  const active = await Poll.findOne({ status: "ACTIVE" });
  if (active) throw new Error("Poll already active");

  return Poll.create({
    ...data,
    startedAt: new Date(),
    status: "ACTIVE"
  });
};

export const getActivePoll = async () => {
  return Poll.findOne({ status: "ACTIVE" });
};

export const submitVote = async ({ pollId, studentId, optionId }) => {
  const poll = await Poll.findById(pollId);
  if (!poll || poll.status !== "ACTIVE") throw new Error("Poll inactive");

  return Vote.create({ pollId, studentId, optionId });
};

export const getResults = async (pollId) => {
  const votes = await Vote.find({ pollId });
  const counts = {};
  votes.forEach(v => counts[v.optionId] = (counts[v.optionId] || 0) + 1);
  return counts;
};

export const endPoll = async (pollId) => {
  return Poll.findByIdAndUpdate(
    pollId,
    { status: "COMPLETED" },
    { new: true }
  );
};

async function getPollHistory() {
  const finishedPolls = await Poll.find({ status: "COMPLETED" })
    .sort({ startedAt: -1 });

  const output = [];

  for (const poll of finishedPolls) {
    const votes = await Vote.find({ pollId: poll._id });
    const countMap = {};

    votes.forEach(v => {
      countMap[v.optionId] = (countMap[v.optionId] || 0) + 1;
    });

    output.push({
      poll,
      results: countMap
    });
  }

  return output;
}

export { getPollHistory };
