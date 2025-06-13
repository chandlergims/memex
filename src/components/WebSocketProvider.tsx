"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the WebSocket context type
interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  lastEvent: { type: string; data: any } | null;
  lastPriceUpdate: { updatedTokens: any[]; updatedBundles: any[] } | null;
}

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
  lastEvent: null,
  lastPriceUpdate: null
});

// Custom hook to use the WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

interface WebSocketProviderProps {
  children: ReactNode;
}

export default function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<{ type: string; data: any } | null>(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<{ updatedTokens: any[]; updatedBundles: any[] } | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    // Only try to connect if we haven't exceeded max attempts
    if (connectionAttempts > 5) {
      console.log('Max connection attempts reached, giving up');
      return;
    }

    let socketInstance: Socket | null = null;
    
    try {
      // Get the host URL dynamically
      const host = window.location.origin;
      console.log(`Attempting to connect to WebSocket at ${host}`);
      
      // Create a socket instance
      socketInstance = io(host, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true,
      });

      // Set up event listeners
      socketInstance.on('connect', () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        setIsConnected(false);
        setConnectionAttempts(prev => prev + 1);
      });

      // Listen for bundle creation events
      socketInstance.on('bundle:created', (data) => {
        console.log('Received bundle:created event:', data);
        setLastEvent({ type: 'bundle:created', data });
      });
      
      // Listen for price update events
      socketInstance.on('prices:updated', (data) => {
        console.log('Received prices:updated event:', data);
        setLastPriceUpdate(data);
        setLastEvent({ type: 'prices:updated', data });
      });

      // Save the socket instance
      setSocket(socketInstance);
    } catch (error) {
      console.error('Error initializing socket:', error);
      setIsConnected(false);
      setConnectionAttempts(prev => prev + 1);
    }

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        console.log('Cleaning up WebSocket connection');
        socketInstance.disconnect();
      }
    };
  }, [connectionAttempts]);

  return (
    <WebSocketContext.Provider value={{ 
      socket, 
      isConnected,
      lastEvent,
      lastPriceUpdate
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}
