import {
  createPoll,
  getActivePoll,
  submitVote,
  getResults,
  endPoll
} from "../services/poll.service.js";

export default function pollSocket(io) {
  io.on("connection", async (socket) => {

    const poll = await getActivePoll();
    if (poll) {
      socket.emit("poll_state", poll);
      socket.emit("poll_results", await getResults(poll._id));
    }

    socket.on("create_poll", async (data) => {
      try {
        const poll = await createPoll(data);
        io.emit("poll_state", poll);

        setTimeout(async () => {
          await endPoll(poll._id);
          io.emit("poll_ended");
        }, poll.duration * 1000);

      } catch (e) {
        socket.emit("error", e.message);
      }
    });

    socket.on("submit_vote", async (data) => {
      try {
        await submitVote(data);
        io.emit("poll_results", await getResults(data.pollId));
      } catch (e) {
        socket.emit("error", e.message);
      }
    });
  });
}
