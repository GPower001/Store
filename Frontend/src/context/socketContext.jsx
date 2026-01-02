// src/context/socketContext.jsx
import { createContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL_PROD || 'http://localhost:5000';
    
    console.log("Connecting to Socket.IO at:", socketUrl);

    socketRef.current = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket.IO connected');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up Socket.IO connection");
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}; 
export default SocketProvider;
export { SocketContext };
