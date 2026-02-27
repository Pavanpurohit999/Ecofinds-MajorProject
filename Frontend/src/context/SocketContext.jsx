import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

// Use the base URL without /api since socket connects to the root server
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api$/, '')
    : "http://localhost:5001";

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        // Only connect if user is authenticated
        if (isAuthenticated && user && !socketRef.current) {
            console.log('SocketContext: Connecting to socket provider...');

            const newSocket = io(SOCKET_URL, {
                withCredentials: true,
                // Optional: you can pass userId if your backend expects it in query
                // query: { userId: user._id }
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setIsConnected(true);

                // Example: backend might expect user to join a room for notifications
                newSocket.emit('setup', user);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connect error:', err);
            });

            socketRef.current = newSocket;
            setSocket(newSocket);
        }

        // Cleanup when user logs out or component unmounts
        return () => {
            if ((!isAuthenticated || !user) && socketRef.current) {
                console.log('SocketContext: Disconnecting socket...');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
        };
    }, [isAuthenticated, user]);

    const value = {
        socket,
        isConnected,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
