import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { apiUrl, getApiBaseUrl } from "../lib/apiUrl";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  message_type: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

interface ChatProps {
  matchId: string;
  currentUserId: string;
  token: string;
}

export default function Chat({ matchId, currentUserId, token }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(getApiBaseUrl(), {
      auth: {
        token: token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
      newSocket.emit("join_match", matchId);
    });

    newSocket.on("new_message", (messageData) => {
      // Add the new message to the list
      setMessages((prev) => [...prev, messageData]);
    });

    newSocket.on("user_typing", (data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => [
          ...prev.filter((id) => id !== data.userId),
          data.userId,
        ]);
      }
    });

    newSocket.on("user_stopped_typing", (data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => prev.filter((id) => id !== data.userId));
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from chat server");
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave_match", matchId);
      newSocket.disconnect();
    };
  }, [matchId, currentUserId, token]);

  // Load message history
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(
          apiUrl(`/api/messages/match/${matchId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages || []);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (matchId && token) {
      loadMessages();
    }
  }, [matchId, token]);

  // Mark messages as read when component mounts
  useEffect(() => {
    if (messages.length > 0) {
      markMessagesAsRead();
    }
  }, [messages]);

  const markMessagesAsRead = async () => {
    try {
      await fetch(apiUrl("/api/messages/mark-read"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ matchId }),
      });
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !socket) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      // Send via API to store in database
      const response = await fetch(apiUrl("/api/messages/send"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          matchId,
          content: messageContent,
          messageType: "text",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the message to the local state
        setMessages((prev) => [...prev, data.message]);

        // Emit via socket for real-time delivery
        socket.emit("send_message", {
          matchId,
          content: messageContent,
          messageType: "text",
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit("typing_start", { matchId });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) {
        socket.emit("typing_stop", { matchId });
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === currentUserId
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender_id === currentUserId
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === currentUserId
                      ? "text-primary-100"
                      : "text-gray-500"
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <p className="text-sm text-gray-500">
                {typingUsers.length === 1
                  ? "Someone is typing..."
                  : "Multiple people are typing..."}
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}




