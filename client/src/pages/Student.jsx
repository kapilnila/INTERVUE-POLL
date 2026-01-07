import { useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";

export default function Student() {
  const socket = useSocket();

  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState({});
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!socket) return;

    console.log("Student socket connected:", socket.id);

    socket.on("poll_state", (p) => {
      console.log("Student received poll");
      setPoll(p);
      setVoted(false);
    });

    socket.on("poll_results", (r) => {
      setResults(r);
    });

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

  const vote = (optionId) => {
    if (voted) return;

    socket.emit("vote", optionId);
    setVoted(true);
  };

  if (!poll) {
    return <h3>Waiting for teacher to start poll…</h3>;
  }

  const totalVotes =
    Object.values(results).reduce((a, b) => a + b, 0) || 1;

  return (
    <div>
      <h2>{poll.question}</h2>

      <ul>
        {poll.options.map((opt) => {
          const percent = Math.round(
            ((results[opt.id] || 0) / totalVotes) * 100
          );

          return (
            <li key={opt.id}>
              <button
                onClick={() => vote(opt.id)}
                disabled={voted}
              >
                {opt.text}
              </button>{" "}
              — {percent}%
            </li>
          );
        })}
      </ul>

      {voted && <p style={{ color: "green" }}>Vote submitted</p>}
    </div>
  );
}
