import { io } from "socket.io-client";
import { useEffect, useState } from "react";

export default function useSocket() {
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const socketInstance = io("http://localhost:5000");

    setConnection(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return connection;
}
