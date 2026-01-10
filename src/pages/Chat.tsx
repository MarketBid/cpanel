import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useTransactionEvents, TransactionEvent } from '../hooks/useTransactionEvents';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    useTransaction,
    useUpdateTransactionStatus,
    useCancelTransaction,
    useRestoreTransaction,
    useMarkTransactionInTransit,
    useMarkTransactionDelivered,
    useMarkTransactionReceived
} from '../hooks/queries/useTransactions';
import { Transaction, TransactionStatus } from '../types';
import { Send, Plus, Smile, MessageSquare, DollarSign, ArrowRight, ArrowLeft, X, ChevronDown, ChevronRight, Zap, FileText, Search } from 'lucide-react';
import { motion } from 'framer-motion';

// Types
interface User {
    id: string;
    username: string;
    display_name?: string;
    email: string;
    avatar_url?: string;
}

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file' | 'system';
    created_at: string;
    read_at?: string;
}

interface Conversation {
    id: string;
    type: 'direct' | 'group';
    title?: string;
    participants: User[];
    participant_details?: { id: string; name: string; email: string }[];
    last_message?: Message;
    unread_count: number;
    updated_at: string;
    transaction_id?: string;
    context_type?: string;
}

const SystemMessage: React.FC<{ message: Message }> = ({ message }) => {
    const getIcon = () => {
        const content = message.content.toLowerCase();
        if (content.includes('payment') || content.includes('💰')) return '💰';
        if (content.includes('shipped') || content.includes('📦')) return '📦';
        if (content.includes('delivered') || content.includes('✅')) return '✅';
        if (content.includes('dispute') || content.includes('⚠️')) return '⚠️';
        if (content.includes('linked') || content.includes('🔗')) return '🔗';
        if (content.includes('completed') || content.includes('🎉')) return '🎉';
        if (content.includes('cancelled') || content.includes('❌')) return '❌';
        return '📢';
    };

    return (
        <div className="flex flex-col items-center my-5 px-4 py-3 bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] rounded-xl border border-[var(--border-default)] max-w-[80%] mx-auto">
            <div className="flex items-center gap-2.5 text-[var(--text-secondary)] text-sm text-center leading-relaxed">
                <span className="text-xl shrink-0">{getIcon()}</span>
                <span className="font-medium">{message.content}</span>
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1.5">
                {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        </div>
    );
};

const Chat: React.FC = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messageInput, setMessageInput] = useState('');
    const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
    const [showTransactionModal, setShowTransactionModal] = useState(false);
    const [transactionTargetUser, setTransactionTargetUser] = useState<User | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [showQuickActions, setShowQuickActions] = useState(false);
    const [updatingTransaction, setUpdatingTransaction] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const conversationId = searchParams.get('conversationId');
        if (conversationId) {
            setSelectedConversation(conversationId);
        }
    }, [searchParams]);

    const handleCreateTransactionClick = () => {
        const conversation = conversations.find(c => c.id === selectedConversation);
        if (!conversation) return;

        // Find the other participant
        // Try to use participant_details first as it might have more info like email
        if (conversation.participant_details) {
            const otherParticipantDetail = conversation.participant_details.find(p => String(p.id) !== String(user?.id));
            if (otherParticipantDetail) {
                // We need to map this back to a User object or just store what we need
                // For now, let's construct a partial user object or just store the ID and find the full user if needed
                // But wait, transactionTargetUser is typed as User.
                // Let's see if we can find the user in participants array first, as that is fully typed User
                const participant = conversation.participants.find(p => String(p.id) === String(otherParticipantDetail.id));
                if (participant) {
                    setTransactionTargetUser(participant);
                } else {
                    // Fallback if not in participants list (unlikely but possible)
                    setTransactionTargetUser({
                        id: otherParticipantDetail.id,
                        username: otherParticipantDetail.name, // Fallback
                        email: otherParticipantDetail.email,
                        display_name: otherParticipantDetail.name
                    });
                }
                setShowTransactionModal(true);
                return;
            }
        }

        const otherParticipant = conversation.participants.find(p => String(p.id) !== String(user?.id));
        if (otherParticipant) {
            setTransactionTargetUser(otherParticipant);
            setShowTransactionModal(true);
        }
    };

    const handleRoleSelect = (role: 'pay' | 'receive') => {
        if (!transactionTargetUser || !selectedConversation) return;

        const params = new URLSearchParams();
        if (role === 'pay') {
            params.append('receiver', transactionTargetUser.id);
            if (transactionTargetUser.email) {
                params.append('receiver_email', transactionTargetUser.email);
            }
        } else {
            params.append('sender', transactionTargetUser.id);
            if (transactionTargetUser.email) {
                params.append('sender_email', transactionTargetUser.email);
            }
        }
        params.append('conversation_id', selectedConversation);

        navigate(`/transactions/create?${params.toString()}`);
        setShowTransactionModal(false);
    };
    // Transaction Logic


    // Fetch conversations
    const { data: conversations = [], isLoading: loadingConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await apiClient.get<Conversation[]>('/chat/conversations');
            return response.data;
        },
        refetchInterval: 30000,
    });

    const selectedConversationObj = conversations.find(c => c.id === selectedConversation);
    const transactionId = selectedConversationObj?.transaction_id;

    const { data: transaction } = useTransaction(transactionId, !!transactionId);

    const updateTransactionStatusMutation = useUpdateTransactionStatus();
    const cancelTransactionMutation = useCancelTransaction();
    const restoreTransactionMutation = useRestoreTransaction();
    const inTransitTransactionMutation = useMarkTransactionInTransit();
    const receivedTransactionMutation = useMarkTransactionReceived();
    const deliveredTransactionMutation = useMarkTransactionDelivered();

    const normalizeStatus = useCallback((status: string | TransactionStatus): TransactionStatus => {
        const statusStr = status.toString().toLowerCase();
        switch (statusStr) {
            case 'pending': return TransactionStatus.PENDING;
            case 'paid': return TransactionStatus.PAID;
            case 'intransit':
            case 'in_transit':
            case 'in-transit': return TransactionStatus.IN_TRANSIT;
            case 'delivered': return TransactionStatus.DELIVERED;
            case 'completed': return TransactionStatus.COMPLETED;
            case 'cancelled':
            case 'canceled': return TransactionStatus.CANCELLED;
            case 'disputed': return TransactionStatus.DISPUTED;
            case 'ack_delivery':
            case 'ack-delivery': return TransactionStatus.ACK_DELIVERY;
            case 'dispute_resolved':
            case 'dispute-resolved': return TransactionStatus.DISPUTE_RESOLVED;
            default: return status as TransactionStatus;
        }
    }, []);

    const handleTransactionAction = async (action: () => Promise<any>) => {
        setUpdatingTransaction(true);
        try {
            await action();
            setShowQuickActions(false);
        } catch (error) {
            console.error('Transaction action failed:', error);
        } finally {
            setUpdatingTransaction(false);
        }
    };

    const handlePayment = async () => {
        if (!transaction) return;
        setUpdatingTransaction(true);
        try {
            const response = await apiClient.post(`/payment/initiate-payment/${transaction.transaction_id}`, {});
            const responseData = response.data as any;

            if (response.status === 'success' && responseData?.message === 'Payment already completed') {
                console.log('Payment already completed');
                queryClient.invalidateQueries({ queryKey: transactionKeys.detail(transaction.transaction_id) });
                return;
            }

            window.location.href = responseData as string;
        } catch (error) {
            console.error('Payment initiation error:', error);
        } finally {
            setUpdatingTransaction(false);
        }
    };

    const getAvailableActions = useCallback(() => {
        if (!transaction || !user) return [];
        const isSender = String(transaction.sender_id) === String(user.id);
        const isReceiver = String(transaction.receiver_id) === String(user.id);
        const normalizedStatus = normalizeStatus(transaction.status);
        const actions = [];

        if (normalizedStatus === TransactionStatus.PENDING && (isSender || isReceiver)) {

            actions.push({
                label: 'Decline',
                onClick: () => handleTransactionAction(() => cancelTransactionMutation.mutateAsync(transaction.transaction_id)),
                color: 'text-red-600 hover:bg-red-50',
            });
        }

        if (normalizedStatus === TransactionStatus.CANCELLED && isReceiver) {
            actions.push({
                label: 'Restore Transaction',
                onClick: () => handleTransactionAction(() => restoreTransactionMutation.mutateAsync(transaction.transaction_id)),
                color: 'text-blue-600 hover:bg-blue-50',
            });
        }

        if (normalizedStatus === TransactionStatus.PAID) {
            if (isReceiver) {
                actions.push({
                    label: 'Mark as In Transit',
                    onClick: () => handleTransactionAction(() => inTransitTransactionMutation.mutateAsync(transaction.transaction_id)),
                    color: 'text-blue-600 hover:bg-blue-50',
                });
                actions.push({
                    label: 'Disputed',
                    onClick: () => handleTransactionAction(() => updateTransactionStatusMutation.mutateAsync({ id: transaction.transaction_id, status: TransactionStatus.DISPUTED })),
                    color: 'text-red-600 hover:bg-red-50',
                });
            }
            if (isSender) {
                actions.push({
                    label: 'Disputed',
                    onClick: () => handleTransactionAction(() => updateTransactionStatusMutation.mutateAsync({ id: transaction.transaction_id, status: TransactionStatus.DISPUTED })),
                    color: 'text-red-600 hover:bg-red-50',
                });
            }
        }

        if (normalizedStatus === TransactionStatus.IN_TRANSIT) {
            if (isReceiver) {
                actions.push({
                    label: 'Mark as Delivered',
                    onClick: () => handleTransactionAction(() => deliveredTransactionMutation.mutateAsync(transaction.transaction_id)),
                    color: 'text-green-600 hover:bg-green-50',
                });
                actions.push({
                    label: 'Disputed',
                    onClick: () => handleTransactionAction(() => updateTransactionStatusMutation.mutateAsync({ id: transaction.transaction_id, status: TransactionStatus.DISPUTED })),
                    color: 'text-red-600 hover:bg-red-50',
                });
            }
            if (isSender) {
                actions.push({
                    label: 'Disputed',
                    onClick: () => handleTransactionAction(() => updateTransactionStatusMutation.mutateAsync({ id: transaction.transaction_id, status: TransactionStatus.DISPUTED })),
                    color: 'text-red-600 hover:bg-red-50',
                });
            }
        }

        if (normalizedStatus === TransactionStatus.DELIVERED) {
            if (isReceiver) {
                actions.push({
                    label: 'Disputed',
                    onClick: () => handleTransactionAction(() => updateTransactionStatusMutation.mutateAsync({ id: transaction.transaction_id, status: TransactionStatus.DISPUTED })),
                    color: 'text-red-600 hover:bg-red-50',
                });
            }
            if (isSender) {
                actions.push({
                    label: 'Mark as Acknowledged',
                    onClick: () => handleTransactionAction(() => receivedTransactionMutation.mutateAsync(transaction.transaction_id)),
                    color: 'text-green-600 hover:bg-green-50',
                });
                actions.push({
                    label: 'Disputed',
                    onClick: () => handleTransactionAction(() => updateTransactionStatusMutation.mutateAsync({ id: transaction.transaction_id, status: TransactionStatus.DISPUTED })),
                    color: 'text-red-600 hover:bg-red-50',
                });
            }
        }

        return actions;
    }, [transaction, user, normalizeStatus, cancelTransactionMutation, restoreTransactionMutation, inTransitTransactionMutation, updateTransactionStatusMutation, deliveredTransactionMutation, receivedTransactionMutation]);

    const availableActions = getAvailableActions();

    // Fetch messages for selected conversation
    const { data: messages = [], isLoading: loadingMessages } = useQuery({
        queryKey: ['messages', selectedConversation],
        queryFn: async () => {
            if (!selectedConversation) return [];
            const response = await apiClient.get<Message[]>(`/chat/conversations/${selectedConversation}/messages?limit=50`);
            return response.data;
        },
        enabled: !!selectedConversation,
    });

    // WebSocket Integration
    const handleWebSocketMessage = useCallback((event: TransactionEvent) => {
        if (event.type === 'new_message') {
            console.log('New message received:', event.message);
            let message = event.message;

            // Handle broadcast system messages
            if (!message && event.message_type === 'system' && event.content) {
                message = {
                    id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    conversation_id: selectedConversation || 'system',
                    sender_id: 'system',
                    content: event.content,
                    message_type: 'system',
                    created_at: new Date().toISOString(),
                };
            }

            if (message) {
                // Update messages if viewing this conversation or if it's a system broadcast
                const isRelevant = selectedConversation && (
                    message.conversation_id === selectedConversation ||
                    message.message_type === 'system'
                );

                if (isRelevant) {
                    queryClient.setQueryData(['messages', selectedConversation], (old: Message[] = []) => {
                        // Check if we have a temp message with the same content and sender
                        const tempMessageIndex = old.findIndex(m =>
                            m.id.startsWith('temp-') &&
                            m.content === message.content &&
                            String(m.sender_id) === String(message.sender_id)
                        );

                        if (tempMessageIndex !== -1) {
                            // Replace temp message with real message
                            const newMessages = [...old];
                            newMessages[tempMessageIndex] = message;
                            return newMessages;
                        }

                        // Check for exact duplicates
                        if (old.some(m => m.id === message.id)) return old;

                        return [...old, message];
                    });

                    // Mark as read only for regular messages in the active conversation
                    if (message.conversation_id === selectedConversation && message.message_type !== 'system') {
                        markAsRead(selectedConversation);
                    }
                }

                // Update conversation list
                queryClient.invalidateQueries({ queryKey: ['conversations'] });
            }
        } else if (event.type === 'user_typing') {
            if (event.conversation_id && event.user_id) {
                setTypingUsers(prev => ({
                    ...prev,
                    [event.conversation_id!]: event.user_id!
                }));

                // Clear after 3 seconds
                setTimeout(() => {
                    setTypingUsers(prev => {
                        const newState = { ...prev };
                        delete newState[event.conversation_id!];
                        return newState;
                    });
                }, 3000);
            }
        }
    }, [selectedConversation, queryClient]);

    const { isConnected, sendMessage: sendChatMessage } = useTransactionEvents({
        onMessage: handleWebSocketMessage
    });

    const sendMessage = useCallback((conversationId: string, content: string, messageType = 'text') => {
        if (isConnected && user) {
            // Optimistically add message to UI immediately
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                conversation_id: conversationId,
                sender_id: user.id.toString(), // Ensure string
                content,
                message_type: messageType as 'text' | 'image' | 'file' | 'system',
                created_at: new Date().toISOString(),
            };

            // Add to messages immediately
            queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => [
                ...old,
                optimisticMessage
            ]);

            // Update conversation list with last message
            queryClient.setQueryData(['conversations'], (old: Conversation[] = []) => {
                if (!old) return old;
                return old.map(conv =>
                    conv.id === conversationId
                        ? {
                            ...conv,
                            last_message: {
                                id: optimisticMessage.id,
                                conversation_id: conversationId,
                                sender_id: user.id.toString(),
                                content,
                                message_type: messageType as any,
                                created_at: new Date().toISOString()
                            },
                            updated_at: new Date().toISOString()
                        }
                        : conv
                ).sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            });

            // Send via WebSocket
            sendChatMessage({
                type: 'send_message',
                conversation_id: conversationId,
                content,
                message_type: messageType
            });
        }
    }, [user, queryClient, isConnected, sendChatMessage]);

    const sendTyping = useCallback((conversationId: string) => {
        if (isConnected) {
            sendChatMessage({
                type: 'typing',
                conversation_id: conversationId
            });
        }
    }, [isConnected, sendChatMessage]);

    const markAsRead = useCallback((conversationId: string) => {
        if (isConnected) {
            // Optimistically clear unread count
            queryClient.setQueryData(['conversations'], (old: Conversation[] = []) =>
                old.map(conv =>
                    conv.id === conversationId
                        ? { ...conv, unread_count: 0 }
                        : conv
                )
            );

            // Send to server
            sendChatMessage({
                type: 'mark_read',
                conversation_id: conversationId
            });
        }
    }, [isConnected, queryClient, sendChatMessage]);


    // Scroll to bottom when new messages arrive or typing status changes
    const lastConversationIdRef = useRef<string | null>(null);

    React.useLayoutEffect(() => {
        if (messagesEndRef.current) {
            const isNewConversation = selectedConversation !== lastConversationIdRef.current;

            messagesEndRef.current.scrollIntoView({
                behavior: isNewConversation ? 'auto' : 'smooth'
            });

            if (isNewConversation) {
                lastConversationIdRef.current = selectedConversation;
            }
        }
    }, [messages, typingUsers, selectedConversation]);

    // Mark conversation as read when opened
    useEffect(() => {
        if (selectedConversation) {
            const conversationId = selectedConversation;
            const timer = setTimeout(() => {
                markAsRead(conversationId);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [selectedConversation, markAsRead]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (messageInput.trim() && selectedConversation) {
            sendMessage(selectedConversation, messageInput);
            setMessageInput('');
        }
    };

    const handleTyping = () => {
        if (selectedConversation) {
            sendTyping(selectedConversation);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
                typingTimeoutRef.current = null;
            }, 1000);
        }
    };

    const toggleGroup = (userId: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const getConversationTitle = useCallback((conversation: Conversation) => {
        if (!conversation) return 'Unknown';
        if (conversation.type === 'group') return conversation.title || 'Group Chat';

        // Try to use participant_details first
        if (conversation.participant_details && conversation.participant_details.length > 0) {
            const otherParticipants = conversation.participant_details.filter(p => String(p.id) !== String(user?.id));
            if (otherParticipants.length > 0) {
                return otherParticipants.map(p => p.name).join(', ');
            }
        }

        // Fallback to participants array
        if (conversation.participants && conversation.participants.length > 0) {
            const otherParticipants = conversation.participants.filter(p => String(p.id) !== String(user?.id));
            if (otherParticipants.length > 0) {
                return otherParticipants.map(p => p.display_name || p.username).join(', ');
            }
        }

        return 'You';
    }, [user]);

    const filteredConversations = React.useMemo(() => {
        if (!conversations) return [];
        return conversations.filter(conv => {
            // Filter by type
            if (filter === 'unread' && conv.unread_count === 0) return false;

            // Filter by search query
            if (searchQuery) {
                const title = getConversationTitle(conv).toLowerCase();
                return title.includes(searchQuery.toLowerCase());
            }

            return true;
        });
    }, [conversations, filter, searchQuery, getConversationTitle]);

    // Group conversations by participant
    const groupedConversations = React.useMemo(() => {
        const groups: Record<string, { user: { id: string; name: string; email?: string }; conversations: Conversation[] }> = {};

        filteredConversations.forEach(conv => {
            // Find the other participant (not the current user)
            const otherParticipant = conv.participant_details?.find(p => String(p.id) !== String(user?.id));

            if (otherParticipant) {
                const userId = otherParticipant.id;
                if (!groups[userId]) {
                    groups[userId] = {
                        user: otherParticipant,
                        conversations: []
                    };
                }
                groups[userId].conversations.push(conv);
            }
        });

        return groups;
    }, [filteredConversations, user?.id]);

    const getDateLabel = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const getConversationAvatar = (conversation: Conversation) => {
        const title = getConversationTitle(conversation);
        return title.charAt(0).toUpperCase();
    };

    // Calculate unread conversation count
    const unreadConversationCount = React.useMemo(() => {
        return conversations.filter(conv => conv.unread_count > 0).length;
    }, [conversations]);

    return (
        <div className="flex h-[calc(100vh-6rem)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-80 border-r border-[var(--border-default)] flex flex-col bg-[var(--bg-secondary)]">
                <div className="p-4 border-b border-[var(--border-default)] flex flex-col gap-4 bg-[var(--bg-card)]">
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-[var(--text-primary)]">Messages</h2>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-tertiary)]" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-tertiary)] border-none rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-primary)] placeholder-[var(--text-tertiary)]"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'all'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${filter === 'unread'
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                                    }`}
                            >
                                <span className="flex items-center justify-center gap-1.5">
                                    Unread
                                    {unreadConversationCount > 0 && (
                                        <span className={`h-4 min-w-[1rem] px-1 rounded-full text-[10px] font-medium flex items-center justify-center ${filter === 'unread'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-[var(--color-primary)] text-white'
                                            }`}>
                                            {unreadConversationCount}
                                        </span>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="p-4 text-center text-[var(--text-secondary)]">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-secondary)]">
                            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        Object.entries(groupedConversations).map(([userId, group]) => {
                            const isExpanded = expandedGroups.has(userId);
                            const hasMultiple = group.conversations.length > 1;
                            const singleConv = !hasMultiple ? group.conversations[0] : null;

                            return (
                                <div key={userId} className="border-b border-[var(--border-light)]">
                                    {/* Group Header */}
                                    <div
                                        onClick={() => {
                                            if (hasMultiple) {
                                                toggleGroup(userId);
                                            } else if (singleConv) {
                                                setSelectedConversation(singleConv.id);
                                            }
                                        }}
                                        className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors ${!hasMultiple && singleConv && selectedConversation === singleConv.id ? 'bg-[var(--bg-tertiary)] border-l-2 border-[var(--color-primary)]' : ''
                                            }`}
                                    >
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium shrink-0">
                                            {group.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-medium text-[var(--text-primary)] truncate">
                                                    {group.user.name}
                                                </h3>
                                                {!hasMultiple && singleConv?.last_message && (
                                                    <span className="text-xs text-[var(--text-tertiary)] shrink-0 ml-2">
                                                        {new Date(singleConv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </div>
                                            {hasMultiple ? (
                                                <p className="text-xs text-[var(--text-secondary)]">
                                                    {group.conversations.length} conversation{group.conversations.length > 1 ? 's' : ''}
                                                </p>
                                            ) : singleConv ? (
                                                <div className="flex justify-between items-center">
                                                    <p className="text-xs text-[var(--text-secondary)] truncate">
                                                        {singleConv.last_message ? singleConv.last_message.content : 'Start chatting'}
                                                    </p>
                                                    {singleConv.unread_count > 0 && (
                                                        <span className="ml-2 h-4 min-w-[1rem] px-1 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-medium flex items-center justify-center shrink-0">
                                                            {singleConv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : null}
                                        </div>
                                        {hasMultiple && (
                                            <div className="text-[var(--text-secondary)]">
                                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Conversations List - Only for multiple conversations */}
                                    {hasMultiple && isExpanded && (
                                        <div className="bg-[var(--bg-primary)]">
                                            {group.conversations.map(conv => (
                                                <div
                                                    key={conv.id}
                                                    onClick={() => setSelectedConversation(conv.id)}
                                                    className={`flex items-center gap-3 p-3 pl-16 cursor-pointer transition-colors hover:bg-[var(--bg-tertiary)] ${selectedConversation === conv.id ? 'bg-[var(--bg-tertiary)] border-l-2 border-[var(--color-primary)]' : ''
                                                        }`}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {conv.transaction_id ? (
                                                                <>
                                                                    <DollarSign className="h-3.5 w-3.5 text-[var(--color-primary)] shrink-0" />
                                                                    <span className="text-xs font-medium text-[var(--text-primary)] truncate">
                                                                        Transaction #{conv.transaction_id}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <MessageSquare className="h-3.5 w-3.5 text-[var(--text-secondary)] shrink-0" />
                                                                    <span className="text-xs font-medium text-[var(--text-secondary)]">
                                                                        General Chat
                                                                    </span>
                                                                </>
                                                            )}
                                                            {conv.last_message && (
                                                                <span className="text-xs text-[var(--text-tertiary)] shrink-0 ml-auto">
                                                                    {new Date(conv.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-[var(--text-secondary)] truncate">
                                                                {conv.last_message ? conv.last_message.content : 'Start chatting'}
                                                            </p>
                                                            {conv.unread_count > 0 && (
                                                                <span className="ml-2 h-4 min-w-[1rem] px-1 rounded-full bg-[var(--color-primary)] text-white text-[10px] font-medium flex items-center justify-center shrink-0">
                                                                    {conv.unread_count}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[var(--bg-card)]">
                {selectedConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-card)]">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-medium">
                                    {(() => {
                                        const conv = conversations.find(c => c.id === selectedConversation);
                                        return conv ? getConversationAvatar(conv) : '?';
                                    })()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)]">
                                        {(() => {
                                            const conv = conversations.find(c => c.id === selectedConversation);
                                            return conv ? getConversationTitle(conv) : 'Chat';
                                        })()}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const conv = conversations.find(c => c.id === selectedConversation);
                                            if (conv?.transaction_id) {
                                                return (
                                                    <button
                                                        onClick={() => navigate(`/transactions/${conv.transaction_id}`)}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors cursor-pointer"
                                                    >
                                                        <DollarSign className="h-3 w-3" />
                                                        Transaction #{conv.transaction_id}
                                                    </button>
                                                );
                                            }
                                            return (
                                                <>
                                                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <span className="text-xs text-[var(--text-secondary)]">
                                                        {isConnected ? 'Online' : 'Offline'}
                                                    </span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                {(() => {
                                    const conv = conversations.find(c => c.id === selectedConversation);
                                    if (conv && !conv.transaction_id) {
                                        return (
                                            <div className="relative group">
                                                <button
                                                    onClick={user?.verified ? handleCreateTransactionClick : undefined}
                                                    disabled={!user?.verified}
                                                    className={`mr-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user?.verified
                                                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer'
                                                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                                        }`}
                                                >
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                    Create Transaction
                                                </button>
                                                {!user?.verified && (
                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-10 shadow-lg">
                                                        Please verify your account in Settings to create transactions
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-4 border-transparent border-b-gray-900 dark:border-b-gray-800"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* View Transaction Details Button */}
                                {transaction && (
                                    <button
                                        onClick={() => navigate(`/transactions/${transaction.transaction_id}`)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg text-xs font-medium hover:bg-[var(--bg-tertiary-hover)] transition-colors border border-[var(--border-default)]"
                                    >
                                        <FileText className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                                        View Details
                                    </button>
                                )}

                                {/* Pay Now Button in Header */}
                                {(() => {
                                    if (transaction && normalizeStatus(transaction.status) === TransactionStatus.PENDING && String(transaction.sender_id) === String(user?.id)) {
                                        return (
                                            <button
                                                onClick={handlePayment}
                                                disabled={updatingTransaction}
                                                className="mr-2 flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors shadow-sm"
                                            >
                                                {updatingTransaction ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <DollarSign className="h-3.5 w-3.5" />
                                                )}
                                                Pay Now
                                            </button>
                                        );
                                    }
                                    return null;
                                })()}

                                {/* Transaction Quick Actions */}
                                {transaction && availableActions.length > 0 && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowQuickActions(!showQuickActions)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg text-xs font-medium hover:bg-[var(--bg-tertiary-hover)] transition-colors border border-[var(--border-default)]"
                                        >
                                            <Zap className="h-3.5 w-3.5 text-amber-500" />
                                            Quick Actions
                                            <ChevronDown className="h-3 w-3 text-[var(--text-secondary)]" />
                                        </button>

                                        {showQuickActions && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setShowQuickActions(false)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--bg-card)] rounded-xl shadow-lg border border-[var(--border-default)] z-20 overflow-hidden py-1">
                                                    {availableActions.map((action, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={action.onClick}
                                                            disabled={updatingTransaction}
                                                            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${action.color || 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg-secondary)]">
                            {loadingMessages ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, index) => {
                                        const currentDateLabel = getDateLabel(msg.created_at);
                                        const previousDateLabel = index > 0
                                            ? getDateLabel(messages[index - 1].created_at)
                                            : null;

                                        const showDateSeparator = currentDateLabel !== previousDateLabel;

                                        return (
                                            <React.Fragment key={msg.id}>
                                                {showDateSeparator && (
                                                    <div className="flex justify-center my-6">
                                                        <div className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-[11px] font-medium px-3 py-1 rounded-full border border-[var(--border-light)] shadow-sm">
                                                            {currentDateLabel}
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.message_type === 'system' ? (
                                                    <SystemMessage message={msg} />
                                                ) : (
                                                    (() => {
                                                        const isMe = String(msg.sender_id) === String(user?.id);
                                                        return (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
                                                            >
                                                                <div className={`flex max-w-[70%] min-w-0 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                                                    <div
                                                                        className={`p-3 rounded-2xl min-w-0 ${isMe
                                                                            ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                                                                            : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] rounded-bl-none'
                                                                            } shadow-sm`}
                                                                        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                                                                    >
                                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-[var(--text-secondary)]'}`}>
                                                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })()
                                                )}
                                            </React.Fragment>
                                        );
                                    })}

                                    {typingUsers[selectedConversation] && (
                                        <div className="flex justify-start mb-2">
                                            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-3 rounded-2xl rounded-bl-none shadow-sm">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-[var(--text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-default)]">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                <button type="button" className="p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] rounded-full transition-colors">
                                    <Plus className="h-5 w-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => {
                                            setMessageInput(e.target.value);
                                            handleTyping();
                                        }}
                                        placeholder="Type a message..."
                                        className="w-full pl-4 pr-10 py-2.5 rounded-full border border-[var(--border-medium)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                                    />
                                    <button type="button" className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-[var(--text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                                        <Smile className="h-5 w-5" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className={`p-2.5 rounded-full transition-all ${messageInput.trim()
                                        ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] shadow-md'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-disabled)] cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] bg-[var(--bg-secondary)]">
                        <div className="w-24 h-24 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-10 w-10 text-[var(--text-tertiary)]" />
                        </div>
                        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Your Messages</h2>
                        <p className="max-w-xs text-center">Select a conversation from the sidebar to begin chatting.</p>
                    </div>
                )}

                {/* Transaction Modal */}
                {showTransactionModal && transactionTargetUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--text-inverse)]/60 backdrop-blur-sm p-4">
                        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-default)] max-w-md w-full overflow-hidden animate-fade-in p-6 shadow-2xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">Create Transaction</h3>
                                <button
                                    onClick={() => setShowTransactionModal(false)}
                                    className="p-1 hover:bg-[var(--bg-tertiary)] rounded-full transition-colors"
                                >
                                    <X className="h-5 w-5 text-[var(--text-secondary)]" />
                                </button>
                            </div>
                            <p className="text-[var(--text-secondary)] mb-6">
                                How would you like to transact with <span className="font-semibold text-[var(--text-primary)]">{transactionTargetUser.display_name || transactionTargetUser.username}</span>?
                            </p>

                            <div className="grid grid-cols-1 gap-4">
                                <button
                                    onClick={() => handleRoleSelect('pay')}
                                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-tertiary)] transition-all group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[var(--text-primary)]">Pay {transactionTargetUser.display_name || transactionTargetUser.username}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">I want to send money</div>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleRoleSelect('receive')}
                                    className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] hover:border-[var(--color-primary)] hover:bg-[var(--bg-tertiary)] transition-all group text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <ArrowLeft className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-[var(--text-primary)]">Receive from {transactionTargetUser.display_name || transactionTargetUser.username}</div>
                                            <div className="text-xs text-[var(--text-secondary)]">I want to request money</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
