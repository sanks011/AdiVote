import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  limit,
  startAfter
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Send, ChevronDown } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
  isRead?: boolean;
}

interface LiveChatProps {
  classId: string;
  currentUser: any;
  resultsVisible: boolean;
}

const LiveChat: React.FC<LiveChatProps> = ({ classId, currentUser, resultsVisible }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // For pagination
  const PAGE_SIZE = 25;
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [firstVisibleMessage, setFirstVisibleMessage] = useState<any>(null);
  
  // Format username to remove email domain
  const formatUsername = (name: string) => {
    if (!name) return "Anonymous";
    return name.includes("@stu.adamasuniversity.ac.in")
      ? name.replace("@stu.adamasuniversity.ac.in", "")
      : name;
  };
  
  // Load initial messages
  useEffect(() => {
    if (resultsVisible) return;
    
    setIsLoading(true);
    const chatRef = collection(db, "classes", classId, "chat");
    const q = query(chatRef, orderBy("createdAt", "desc"), limit(PAGE_SIZE));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const msgs = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ChatMessage[];
        
        setFirstVisibleMessage(snapshot.docs[snapshot.docs.length - 1]);
        setMessages(msgs.reverse());
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching chat messages:", error);
      toast.error("Failed to load messages");
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [classId, resultsVisible, currentUser.uid]);
  
  // Load more messages when scrolling up
  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loadingMore || !firstVisibleMessage) return;
    
    setLoadingMore(true);
    try {
      const chatRef = collection(db, "classes", classId, "chat");
      const q = query(
        chatRef, 
        orderBy("createdAt", "desc"), 
        startAfter(firstVisibleMessage), 
        limit(PAGE_SIZE)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        setHasMoreMessages(false);
      } else {
        const oldMessages = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as ChatMessage[];
        
        setFirstVisibleMessage(snapshot.docs[snapshot.docs.length - 1]);
        setMessages(prev => [...oldMessages.reverse(), ...prev]);
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
      toast.error("Failed to load more messages");
    }
    setLoadingMore(false);
  };
  
  // Handle scroll to detect when to load more messages and show scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
  
    const handleScroll = () => {
      // Show scroll button when not at bottom
      const isAtBottom = 
        container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      setShowScrollButton(!isAtBottom);
      
      // Load more messages when scrolling to top
      if (container.scrollTop < 100 && hasMoreMessages && !loadingMore) {
        loadMoreMessages();
      }
    };
  
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, loadingMore]);
  
  // Automatically scroll to bottom when messages update
// This effect specifically watches for new messages being added
useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  
  useEffect(() => {
    if (messages.length && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      // Auto scroll if user is within 100px of bottom
      if (distanceFromBottom < 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);
  
  // Delete all messages from the collection after results are announced
  useEffect(() => {
    if (resultsVisible) {
      const deleteAllMessages = async () => {
        const chatRef = collection(db, "classes", classId, "chat");
        const snaps = await getDocs(chatRef);
        const deletions = snaps.docs.map((docSnap) =>
          deleteDoc(doc(db, "classes", classId, "chat", docSnap.id))
        );
        await Promise.all(deletions);
        setMessages([]); // Clear local state after deletion
      };
      deleteAllMessages().catch((error) =>
        console.error("Error clearing chat:", error)
      );
    }
  }, [classId, resultsVisible]);
  
  // Mark messages as read when visible
  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(msg => 
      msg.senderId !== currentUser.uid && 
      (!msg.isRead || msg.isRead === false)
    );
    
    if (unreadMessages.length === 0) return;
    
    try {
      const updates = unreadMessages.map(msg => 
        doc(db, "classes", classId, "chat", msg.id)
      ).map(async (docRef) => {
        await getDoc(docRef).then((snapshot) => {
          if (snapshot.exists()) {
            return updateDoc(docRef, { isRead: true });
          }
        });
      });
      
      await Promise.all(updates);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  
  // Handle scroll to bottom button click
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const chatRef = collection(db, "classes", classId, "chat");
      await addDoc(chatRef, {
        text: newMessage,
        senderId: currentUser.uid,
        senderName:
          currentUser.displayName ||
          (currentUser.email && currentUser.email.replace("@stu.adamasuniversity.ac.in", "")) ||
          "Anonymous",
        createdAt: serverTimestamp(),
        isRead: false
      });
      
      setNewMessage("");
      inputRef.current?.focus();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  
  // Do not render chat once results are announced.
  if (resultsVisible) return null;
  
  return (
    <div className="mt-4 w-[70%] mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Live Chat</h3>
      </div>
      
      {/* Chat container with reduced height, a top mask, and hidden scrollbar */}
      <div
        ref={messagesContainerRef}
        className="w-full h-[300px] overflow-y-auto relative p-4 bg-slate-50/30 rounded-lg shadow-inner"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 100%)",
          msOverflowStyle: "none", // for IE and Edge
          scrollbarWidth: "none", // for Firefox
        }}
        onClick={markMessagesAsRead}
      >
        {/* Hide scrollbar for Webkit browsers */}
        <style>
          {`
            .w-full::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        
        {/* Loading indicator */}
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-slate-600 rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Load more messages button */}
            {hasMoreMessages && (
              <div className="text-center mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-3 w-3 border-2 border-slate-300 border-t-slate-600 rounded-full mr-2"></span>
                      Loading...
                    </span>
                  ) : (
                    "Load earlier messages"
                  )}
                </Button>
              </div>
            )}
            
            {messages.length === 0 ? (
              <p className="text-base text-gray-500 text-center mt-20">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`mb-3 max-w-[80%] ${
                    msg.senderId === currentUser.uid ? "ml-auto text-right" : "mr-auto text-left"
                  }`}
                >
                  <div className={`px-4 py-3 rounded-lg ${
                    msg.senderId === currentUser.uid ? "bg-green-200" : "bg-blue-200"
                  }`}>
                    <p className="text-sm font-semibold mb-1">
                      {formatUsername(msg.senderName)}
                    </p>
                    <p className="text-base">{msg.text}</p>
                    {msg.createdAt && (
                      <p className="text-[10px] text-slate-500 mt-1">
                        {msg.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        
        {/* Scroll to bottom button */}
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-24 right-6 bg-slate-700 text-white rounded-full p-2 shadow-lg"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.button>
        )}
      </div>
      
      {/* Input area */}
      <div className="flex mt-4 gap-3">
        <Input
          ref={inputRef}
          className="flex-1"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          disabled={isSending}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? (
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Send
        </Button>
      </div>
      <p className="text-xs text-slate-400 mt-2 ml-1">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
};

export default LiveChat;