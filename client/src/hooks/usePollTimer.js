import { useEffect, useState } from "react";

export default function usePollTimer(startTime, limitInSeconds) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!startTime || !limitInSeconds) return;

    const tick = () => {
      const elapsed =
        Math.floor((Date.now() - new Date(startTime)) / 1000);

      const remaining = limitInSeconds - elapsed;
      setSecondsLeft(remaining > 0 ? remaining : 0);
    };

    tick();
    const intervalId = setInterval(tick, 1000);

    return () => clearInterval(intervalId);
  }, [startTime, limitInSeconds]);

  return secondsLeft;
}
