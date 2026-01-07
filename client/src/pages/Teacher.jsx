import { useEffect, useState } from "react";
import useSocket from "../hooks/useSocket";
import usePollTimer from "../hooks/usePollTimer";

export default function Teacher() {
  const socket = useSocket();

  const [currentPoll, setCurrentPoll] = useState(null);
  const [voteMap, setVoteMap] = useState({});
  const [pastPolls, setPastPolls] = useState([]);

  const [questionText, setQuestionText] = useState("");
  const [choices, setChoices] = useState(["", ""]);
  const [timeLimit, setTimeLimit] = useState(60);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("poll_state", poll => {
      setCurrentPoll(poll);
    });

    socket.on("poll_results", results => {
      setVoteMap(results || {});
    });

    socket.on("poll_ended", () => {
      setCurrentPoll(null);
      setVoteMap({});
      loadHistory();
    });

    return () => {
      socket.off("poll_state");
      socket.off("poll_results");
      socket.off("poll_ended");
    };
  }, [socket]);

  async function loadHistory() {
    try {
      const response = await fetchio("https://intervue-poll-hs57.onrender.com/api/poll/history");
      const historyFromServer = await response.json();
      setPastPolls(Array.isArray(historyFromServer) ? historyFromServer : []);
    } catch {
      setPastPolls([]);
    }
  }

  function updateChoice(index, value) {
    const copy = [...choices];
    copy[index] = value;
    setChoices(copy);
  }

  function addChoice() {
    setChoices([...choices, ""]);
  }

  function startPoll() {
    if (!questionText.trim()) return;

    socket.emit("create_poll", {
      question: questionText,
      duration: timeLimit,
      options: choices
        .filter(c => c.trim())
        .map((text, i) => ({ id: `opt_${i}`, text }))
    });

    setQuestionText("");
    setChoices(["", ""]);
  }

  const secondsLeft = usePollTimer(
    currentPoll?.startedAt,
    currentPoll?.duration
  );

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 32px" }}>
      <h2>Teacher Dashboard</h2>

      {currentPoll ? (
        <div>
          <h3>{currentPoll.question}</h3>
          <p>Time left: {secondsLeft}s</p>

          <h4>Live results</h4>
          {currentPoll.options.map(opt => {
            const totalVotes =
              Object.values(voteMap).reduce((a, b) => a + b, 0) || 1;
            const count = voteMap[opt.id] || 0;
            const percent = Math.round((count / totalVotes) * 100);

            return (
              <div key={opt.id}>
                {opt.text} — {percent}%
              </div>
            );
          })}
        </div>
      ) : (
        <div>
          <h3>Create new poll</h3>

          <input
            placeholder="Enter question"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
          />

          <div>
            <label>Time (seconds)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={e => setTimeLimit(Number(e.target.value))}
            />
          </div>

          <h4>Options</h4>
          {choices.map((c, i) => (
            <input
              key={i}
              placeholder={`Option ${i + 1}`}
              value={c}
              onChange={e => updateChoice(i, e.target.value)}
            />
          ))}

          <button onClick={addChoice}>+ Add option</button>
          <br /><br />
          <button onClick={startPoll}>Create Poll</button>
        </div>
      )}

      <hr style={{ margin: "40px 0" }} />
      <h3>Poll History</h3>

      {pastPolls.length === 0 && <p>No previous polls</p>}

      {pastPolls.map(entry => (
        <div key={entry.poll._id} style={{ marginBottom: 20 }}>
          <strong>{entry.poll.question || "(No question)"}</strong>

          {entry.poll.options.map(opt => {
            const totalVotes =
              Object.values(entry.results || {}).reduce((a, b) => a + b, 0) || 1;
            const count = entry.results?.[opt.id] || 0;
            const percent = Math.round((count / totalVotes) * 100);

            return (
              <div key={opt.id}>
                {opt.text} — {percent}%
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
