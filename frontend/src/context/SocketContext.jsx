import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('token');
  const userId = JSON.parse(localStorage.getItem('user'))?._id;

  useEffect(() => {
    if (token) {
      const newSocket = io(import.meta.env.VITE_API_URL);
      setSocket(newSocket);

      if (userId) {
        newSocket.emit('join_room', userId);
      }

      return () => newSocket.close();
    }
  }, [token, userId]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
