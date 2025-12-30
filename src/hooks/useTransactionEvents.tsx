import { useEffect, useRef, useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/api';
import { TransactionStatus } from '../types';
import { transactionKeys } from './queries/useTransactions';
import { useQueryClient } from '@tanstack/react-query';

export interface TransactionEvent {
  type: 'subscribed' | 'status_changed' | 'transaction_updated' | 'receiver_assigned' | 'sender_assigned';
  transactionId?: string;
  status?: TransactionStatus | string;
  previousStatus?: TransactionStatus | string;
  timestamp?: string;
  userId?: string;
  message?: string;
  receiverId?: number;
  senderId?: number;
  payload?: any;
}

interface UseTransactionEventsOptions {
  transactionId?: string;
  enabled?: boolean;
  onStatusChange?: (event: TransactionEvent) => void;
  onError?: (error: Event) => void;
}

// Global WebSocket instance and callbacks
let globalWs: WebSocket | null = null;
let globalOnStatusChangeCallbacks: Set<(event: TransactionEvent) => void> = new Set();
let globalOnErrorCallbacks: Set<(error: Event) => void> = new Set();
let reconnectTimeoutRef: NodeJS.Timeout | null = null;
let reconnectAttemptsRef = 0;
const maxReconnectAttempts = 5;
const baseReconnectDelay = 1000;
let isManualCloseRef = false;

const getAuthToken = () => {
  const tokens = localStorage.getItem('auth_tokens');
  if (tokens) {
    try {
      const parsedTokens = JSON.parse(tokens);
      return parsedTokens.access_token;
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
      return null;
    }
  }
  return null;
};

const getWebSocketUrl = () => {
  const httpUrl = API_BASE_URL;
  if (httpUrl.startsWith('https://')) {
    return httpUrl.replace('https://', 'wss://');
  } else if (httpUrl.startsWith('http://')) {
    return httpUrl.replace('http://', 'ws://');
  }
  return `ws://${httpUrl}`;
};

const connectGlobalWebSocket = () => {
  const token = getAuthToken();
  if (!token) {
    console.log('No authentication token found, skipping WebSocket connection');
    return;
  }

  // Close existing connection
  if (globalWs) {
    isManualCloseRef = false;
    globalWs.close();
  }

  try {
    const wsBaseUrl = getWebSocketUrl();
    const wsUrl = `${wsBaseUrl}/events/transactions?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(wsUrl);
    globalWs = ws;

    ws.onopen = () => {
      console.log('WebSocket connection opened');
      reconnectAttemptsRef = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle ping/pong messages
        if (data.type === 'ping') {
          // Server sent a ping, respond with pong
          const pongMessage = {
            type: 'pong',
            timestamp: new Date().toISOString()
          };
          ws.send(JSON.stringify(pongMessage));
          console.log('Received ping from server, sent pong');
          return;
        }



        // Handle transaction events
        const transactionEvent = data as TransactionEvent;

        // Broadcast to all registered callbacks
        globalOnStatusChangeCallbacks.forEach(callback => {
          try {
            callback(transactionEvent);
          } catch (error) {
            console.error('Error in status change callback:', error);
          }
        });
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      globalOnErrorCallbacks.forEach(callback => {
        try {
          callback(error as Event);
        } catch (err) {
          console.error('Error in error callback:', err);
        }
      });
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);

      // If this socket is not the current global socket, it means it was replaced.
      // We should not attempt to reconnect.
      if (globalWs !== ws) {
        return;
      }

      // Attempt to reconnect if not manual close
      if (!isManualCloseRef && reconnectAttemptsRef < maxReconnectAttempts) {
        reconnectAttemptsRef++;
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef - 1);

        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef}/${maxReconnectAttempts})`);

        reconnectTimeoutRef = setTimeout(() => {
          connectGlobalWebSocket();
        }, delay);
      } else if (!isManualCloseRef) {
        console.error('Max reconnection attempts reached');
      }
    };
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
  }
};

const disconnectGlobalWebSocket = () => {
  if (reconnectTimeoutRef) {
    clearTimeout(reconnectTimeoutRef);
    reconnectTimeoutRef = null;
  }

  isManualCloseRef = true;

  if (globalWs) {
    globalWs.close();
    globalWs = null;
  }
};

// Public API for connection management
export const WebSocketManager = {
  connect: connectGlobalWebSocket,
  disconnect: disconnectGlobalWebSocket,
  isConnected: () => globalWs?.readyState === WebSocket.OPEN,
  isConnecting: () => globalWs?.readyState === WebSocket.CONNECTING,
};

export const useTransactionEvents = (options: UseTransactionEventsOptions = {}) => {
  const { onStatusChange, onError } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const onStatusChangeRef = useRef(onStatusChange);
  const onErrorRef = useRef(onError);
  const queryClient = useQueryClient();

  // Update refs when callbacks change
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    onErrorRef.current = onError;
  }, [onStatusChange, onError]);

  // Register callbacks with global WebSocket
  useEffect(() => {
    const statusChangeCallback = (event: TransactionEvent) => {
      // Update React Query cache automatically
      if (event.transactionId) {
        queryClient.invalidateQueries({ queryKey: transactionKeys.detail(event.transactionId) });
        queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });

        if (event.payload && event.type === 'transaction_updated') {
          queryClient.setQueryData(transactionKeys.detail(event.transactionId), event.payload);
        }
      }

      // Call registered callback
      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(event);
      }
    };

    const errorCallback = (error: Event) => {
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
    };

    // Register callbacks
    globalOnStatusChangeCallbacks.add(statusChangeCallback);
    globalOnErrorCallbacks.add(errorCallback);

    // Update connection status
    const checkConnection = () => {
      const connected = globalWs?.readyState === WebSocket.OPEN;
      setIsConnected(connected);
      setConnectionError(connected ? null : 'WebSocket disconnected');
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => {
      // Unregister callbacks
      globalOnStatusChangeCallbacks.delete(statusChangeCallback);
      globalOnErrorCallbacks.delete(errorCallback);
      clearInterval(interval);
    };
  }, [queryClient]);

  return {
    isConnected,
    connectionError,
  };
};


