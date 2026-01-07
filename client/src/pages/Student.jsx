import { useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";
import usePollTimer from "../hooks/usePollTimer";

export default function Student() {
  const socket = useSocket();

  const [currentPoll, setCurrentPoll] = useState(null);
  const [liveStats, setLiveStats] = useState({});
  const [submitted, setSubmitted] = useState(false);

  let studentId = sessionStorage.getItem("studentId");
  let storedName = sessionStorage.getItem("studentName");

  if (!studentId) {
    studentId = crypto.randomUUID();
    sessionStorage.setItem("studentId", studentId);
  }

  const [nameInput, setNameInput] = useState(storedName || "");

  useEffect(() => {
    if (!socket) return;

    socket.on("poll_state", poll => {
      setCurrentPoll(poll);
      setSubmitted(false);
    });

    socket.on("poll_results", results => {
      setLiveStats(results || {});
    });

    socket.on("poll_ended", () => {
      setSubmitted(true);
    });

    return () => {
      socket.off("poll_state");
      socket.off("poll_results");
      socket.off("poll_ended");
    };
  }, [socket]);

  if (!storedName) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 32px" }}>
        <h3>Enter your name</h3>
        <input
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
        />
        <button
          onClick={() => {
            sessionStorage.setItem("studentName", nameInput);
            window.location.reload();
          }}
        >
          Join
        </button>
      </div>
    );
  }

  const timeRemaining = usePollTimer(
    currentPoll?.startedAt,
    currentPoll?.duration
  );

  if (!currentPoll) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 32px" }}>
        <p>Wait for the teacher to ask questions...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 32px" }}>
      <h3>{currentPoll.question}</h3>
      <p>Time left: {timeRemaining}s</p>

      {!submitted &&
        timeRemaining > 0 &&
        currentPoll.options.map(opt => (
          <button
            key={opt.id}
            onClick={() => {
              socket.emit("submit_vote", {
                pollId: currentPoll._id,
                optionId: opt.id,
                studentId
              });
              setSubmitted(true);
            }}
          >
            {opt.text}
          </button>
        ))}

      <h4>Results</h4>
      {currentPoll.options.map(opt => {
        const total =
          Object.values(liveStats).reduce((a, b) => a + b, 0) || 1;
        const count = liveStats[opt.id] || 0;
        const percent = Math.round((count / total) * 100);

        return (
          <div key={opt.id}>
            {opt.text} — {percent}%
          </div>
        );
      })}
    </div>
  );
}
