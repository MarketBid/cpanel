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

export const useTransactionEvents = (options: UseTransactionEventsOptions = {}) => {
  const { transactionId, enabled = true, onStatusChange, onError } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const onStatusChangeRef = useRef(onStatusChange);
  const onErrorRef = useRef(onError);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second
  const queryClient = useQueryClient();

  // Update refs when callbacks change
  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
    onErrorRef.current = onError;
  }, [onStatusChange, onError]);

  const getAuthToken = useCallback(() => {
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
  }, []);

  const connect = useCallback(() => {
    if (!enabled) return;

    const token = getAuthToken();
    if (!token) {
      setConnectionError('No authentication token found');
      return;
    }

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new EventSource connection
    // In a real app, this would point to your SSE endpoint
    // For now, we'll simulate events or use a polling fallback if SSE isn't ready
    const url = transactionId
      ? `${API_BASE_URL}/events/transactions/${transactionId}`
      : `${API_BASE_URL}/events/transactions`;

    try {
      // Note: Standard EventSource doesn't support custom headers (like Authorization)
      // You might need a library like 'event-source-polyfill' or use a token in the URL query param
      const urlWithToken = token ? `${url}?token=${encodeURIComponent(token)}` : url;

      const eventSource = new EventSource(urlWithToken);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE Connection opened');
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0; // Reset on successful connection
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TransactionEvent;

          // Update React Query cache automatically
          if (data.transactionId) {
            // Invalidate the specific transaction
            queryClient.invalidateQueries({ queryKey: transactionKeys.detail(data.transactionId) });

            // Invalidate the list
            queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });

            // If we have a payload with the full transaction, we can update the cache directly
            if (data.payload && data.type === 'transaction_updated') {
              queryClient.setQueryData(transactionKeys.detail(data.transactionId), data.payload);
            }
          }

          // Handle subscribed event
          if (data.type === 'subscribed') {
            console.log('Successfully subscribed to transaction events:', data.message);
            return;
          }

          // Handle status changes
          if (data.type === 'status_changed' || data.type === 'transaction_updated') {
            console.log('Transaction status changed:', data);
            if (onStatusChangeRef.current) {
              onStatusChangeRef.current(data);
            }
          }

          // Handle other event types
          if (data.type === 'receiver_assigned' || data.type === 'sender_assigned') {
            console.log('Transaction participant assigned:', data);
            if (onStatusChangeRef.current) {
              onStatusChangeRef.current(data);
            }
          }
        } catch (error) {
          console.error('Error parsing SSE event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        setIsConnected(false);

        // Check if connection is closed
        if (eventSource.readyState === EventSource.CLOSED) {
          setConnectionError('Connection closed');

          // Attempt to reconnect if we haven't exceeded max attempts
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1); // Exponential backoff

            console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            setConnectionError('Max reconnection attempts reached. Please refresh the page.');
            if (onErrorRef.current) {
              onErrorRef.current(error);
            }
          }
        } else if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      };
    } catch (error) {
      console.error('Error creating SSE connection:', error);
      setConnectionError('Failed to create SSE connection');
      if (onErrorRef.current) {
        onErrorRef.current(error as Event);
      }
    }
  }, [enabled, getAuthToken, transactionId, queryClient]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, pause connection (optional)
        // For now, we'll keep it connected
      } else {
        // Page is visible, ensure connection is active
        if (enabled && !isConnected && !eventSourceRef.current) {
          connect();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, isConnected, connect]);

  return {
    isConnected,
    connectionError,
    reconnect: connect,
    disconnect,
  };
};


