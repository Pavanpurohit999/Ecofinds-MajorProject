import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import apiClient from '../api/axios';

const ChatContext = createContext(null);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const { socket, isConnected } = useSocket();

    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [typingUsers, setTypingUsers] = useState({}); // { chatId: [userId1, userId2] }

    // 1. Fetch User's Chats
    // According to backend index.js, groupchatroute is mounted at /api/messages which might be the chat routes
    // Let's assume there's an endpoint to get all chats for a user like GET /api/messages/chats or similar.
    // We'll define a standard fetch method that can be adjusted.
    const fetchChats = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setLoadingChats(true);
            // Assuming a standard endpoint for fetching a user's chats
            // Many boilerplates use /api/chat or /api/messages for this.
            const response = await apiClient.get('/chat');
            setChats(response.data || []);
        } catch (error) {
            console.error('Error fetching chats:', error);
        } finally {
            setLoadingChats(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchChats();
    }, [fetchChats]);

    // 2. Fetch Messages for an Active Chat
    const fetchMessages = useCallback(async (chatId) => {
        if (!chatId) return;
        try {
            setLoadingMessages(true);
            const response = await apiClient.get(`/chat/messages/${chatId}`);
            setMessages(Array.isArray(response.data) ? response.data : []);

            // Join socket room for this chat
            if (socket && isConnected) {
                socket.emit('join_chat', chatId);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoadingMessages(false);
        }
    }, [socket, isConnected]);

    // Handle changing active chat
    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat._id);
        } else {
            setMessages([]);
        }
    }, [activeChat, fetchMessages]);

    // 3. Socket real-time events
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleMessageReceived = (newMessageReceived) => {
            if (
                !activeChat || // if chat is not selected or doesn't match current chat
                activeChat._id !== newMessageReceived.chat._id
            ) {
                // If we received a message for another chat, perhaps update the chat list to show unread
                // We could bubble this up as a notification too
            } else {
                // If it's for the currently open chat, append it
                setMessages((prev) => [...prev, newMessageReceived]);
            }
        };

        const handleTyping = (room) => {
            // room is usually the chatId
            setTypingUsers(prev => ({
                ...prev,
                [room]: true
            }));
        };

        const handleStopTyping = (room) => {
            setTypingUsers(prev => ({
                ...prev,
                [room]: false
            }));
        };

        socket.on('message_received', handleMessageReceived);
        socket.on('typing', handleTyping);
        socket.on('stop_typing', handleStopTyping);

        return () => {
            socket.off('message_received', handleMessageReceived);
            socket.off('typing', handleTyping);
            socket.off('stop_typing', handleStopTyping);
        };
    }, [socket, isConnected, activeChat]);

    // 4. Send a message
    const sendMessage = async (content, chatId = activeChat?._id) => {
        if (!content.trim() || !chatId) return;

        try {
            const response = await apiClient.post('/chat/messages', {
                content,
                chatId,
            });

            const data = response.data;

            // Immediately add to local state
            setMessages((prev) => [...prev, data]);

            // Emit to socket
            if (socket && isConnected) {
                socket.emit('new_message', data);
            }
            return data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    // 5. Access or Create a Chat (useful when navigating from product pages)
    const accessChat = useCallback(async (userId) => {
        if (!userId || !isAuthenticated) return null;
        try {
            setLoadingChats(true);
            const response = await apiClient.post('/chat', { userId });
            const newChat = response.data;

            // If it's a new chat, add it to the state
            setChats((prev) => {
                const chatExists = prev.find(c => c._id === newChat._id);
                if (chatExists) return prev;
                return [newChat, ...prev];
            });

            return newChat;
        } catch (error) {
            console.error('Error accessing chat:', error);
            return null;
        } finally {
            setLoadingChats(false);
        }
    }, [isAuthenticated, apiClient]);

    // 6. Create Group Chat
    const createGroupChat = async (name, users) => {
        if (!name || !users || users.length < 2) return null;
        try {
            const response = await apiClient.post('/chat/group', {
                name,
                users: JSON.stringify(users)
            });
            const newGroup = response.data;
            setChats(prev => [newGroup, ...prev]);
            return newGroup;
        } catch (error) {
            console.error('Error creating group chat:', error);
            return null;
        }
    };

    // 7. Rename Group
    const renameGroup = async (chatId, chatName) => {
        try {
            const response = await apiClient.put('/chat/rename', { chatId, chatName });
            const updatedChat = response.data;
            setChats(prev => prev.map(c => c._id === chatId ? updatedChat : c));
            if (activeChat?._id === chatId) setActiveChat(updatedChat);
            return updatedChat;
        } catch (error) {
            console.error('Error renaming group:', error);
            return null;
        }
    };

    // 8. Add to Group
    const addToGroup = async (chatId, userId) => {
        try {
            const response = await apiClient.put('/chat/add', { chatId, userId });
            const updatedChat = response.data;
            setChats(prev => prev.map(c => c._id === chatId ? updatedChat : c));
            if (activeChat?._id === chatId) setActiveChat(updatedChat);
            return updatedChat;
        } catch (error) {
            console.error('Error adding user to group:', error);
            return null;
        }
    };

    // 9. Remove from Group (or leave)
    const removeFromGroup = async (chatId, userId) => {
        try {
            const response = await apiClient.put('/chat/remove', { chatId, userId });
            const updatedChat = response.data;

            // If the user removed is the current user, or if they left, 
            // the backend might still return the chat but they might not be in users anymore.
            // Simplified logic: update state
            setChats(prev => prev.map(c => c._id === chatId ? updatedChat : c));
            if (activeChat?._id === chatId) setActiveChat(updatedChat);
            return updatedChat;
        } catch (error) {
            console.error('Error removing user from group:', error);
            return null;
        }
    };

    // 10. Access unread messages logic (simplified)
    const getUnreadCount = (chatId) => {
        // Custom logic if backend provides unread arrays in chats
        return 0; // Placeholder
    };

    const value = {
        chats,
        activeChat,
        setActiveChat,
        messages,
        loadingChats,
        loadingMessages,
        typingUsers,
        fetchChats,
        sendMessage,
        accessChat,
        createGroupChat,
        renameGroup,
        addToGroup,
        removeFromGroup,
        getUnreadCount
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
