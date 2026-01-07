import { io } from "socket.io-client";
import { useEffect, useState } from "react";

export default function useSocket() {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const socketInstance = io("https://intervue-poll-hs57.onrender.com");

    setConnection(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return connection;
}
