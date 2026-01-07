import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTransactionEvents, TransactionEvent } from '../hooks/useTransactionEvents';

const GlobalChatListener: React.FC = () => {
    const queryClient = useQueryClient();

    const handleWebSocketMessage = (event: TransactionEvent) => {
        if (event.type === 'new_message' && event.message) {
            // Invalidate conversations list to update unread counts/previews globally
            queryClient.invalidateQueries({ queryKey: ['conversations'] });

            // Invalidate the specific conversation's messages
            // This ensures that if the user navigates to this conversation,
            // they get the fresh messages, even if it was cached.
            if (event.message.conversation_id) {
                queryClient.invalidateQueries({
                    queryKey: ['messages', event.message.conversation_id]
                });
            }
        }
    };

    // This hook manages the WebSocket connection globally as long as this component is mounted.
    // Since this component will be in Layout, it will be mounted on all protected pages.
    useTransactionEvents({
        onMessage: handleWebSocketMessage
    });

    return null;
};

export default GlobalChatListener;
