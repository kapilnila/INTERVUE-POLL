import { useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";
import usePollTimer from "../hooks/usePollTimer";

export default function Student() {
  const socket = useSocket();

  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState({});
  const [voted, setVoted] = useState(false);

  // ⏳ Timer (reuses your hook)
  const timeLeft = usePollTimer(poll?.startedAt, poll?.duration);

  useEffect(() => {
    if (!socket) return;

    console.log("Student connected:", socket.id);

    // 🔔 Receive poll
    socket.on("poll_state", (p) => {
      setPoll(p);
      setVoted(false);
    });

    // 📊 Live results
    socket.on("poll_results", (r) => {
      setResults(r);
    });

    // ❌ Poll ended
    socket.on("poll_ended", () => {
      setPoll(null);
      setResults({});
      setVoted(false);
    });

    return () => {
      socket.off("poll_state");
      socket.off("poll_results");
      socket.off("poll_ended");
    };
  }, [socket]);

  // 🗳 Vote handler
  const vote = (optionId) => {
    if (voted || !poll) return;

    socket.emit("vote", optionId);
    setVoted(true);
  };

  // 💤 No poll yet
  if (!poll) {
    return <h3>Waiting for teacher to start a poll…</h3>;
  }

  // 📈 Percentage calculation
  const totalVotes =
    Object.values(results).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <h2>{poll.question}</h2>

      <p>⏳ Time Left: {timeLeft}s</p>

      <ul>
        {poll.options.map((opt) => {
          const votes = results[opt.id] || 0;
          const percent = Math.round((votes / totalVotes) * 100);

          return (
            <li key={opt.id} style={{ marginBottom: "8px" }}>
              <button
                onClick={() => vote(opt.id)}
                disabled={voted || timeLeft === 0}
              >
                {opt.text}
              </button>{" "}
              — {percent}% ({votes} votes)
            </li>
          );
        })}
      </ul>

      {voted && (
        <p style={{ color: "green" }}>
          ✅ Your vote has been recorded
        </p>
      )}

      {timeLeft === 0 && (
        <p style={{ color: "red" }}>
          ⛔ Poll has ended
        </p>
      )}
    </div>
  );
}
