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
  startAfter,
  getDoc,
  where
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, MessageCircle, X, Users, ArrowLeft, Heart, ThumbsUp, Star, Smile } from "lucide-react";

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: any;
  isRead?: boolean;
  isReaction?: boolean;
}

// Add new interface for floating reactions
interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
  createdAt: number;
}

interface LiveChatProps {
  classId: string;
  currentUser: any;
  resultsVisible: boolean;
}

const REACTIONS = ['❤️', '👍','👎', '🎉', '🚀', '👏', '🔥','🗿','👀','🤬'];

const LiveChat: React.FC<LiveChatProps> = ({ classId, currentUser, resultsVisible }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showReactions, setShowReactions] = useState(false);
  const [onlineUsers] = useState(Math.floor(Math.random() * 50) + 20);
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // For pagination
  const PAGE_SIZE = 25;
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [firstVisibleMessage, setFirstVisibleMessage] = useState<any>(null);
  
  // Format username to remove email domain and capitalize first letter
  const formatUsername = (name: string) => {
    if (!name) return "Anonymous";
    const username = name.includes("@stu.adamasuniversity.ac.in")
      ? name.replace("@stu.adamasuniversity.ac.in", "")
      : name;
    return username.charAt(0).toUpperCase() + username.slice(1);
  };
  
  // Generate random color for user avatar
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-rose-500', // Vibrant pink
      'bg-amber-500', // Warm orange
      'bg-emerald-500', // Rich green
      'bg-violet-500', // Deep purple
      'bg-cyan-500', // Bright blue
      'bg-fuchsia-500', // Electric pink
      'bg-lime-500', // Fresh lime
      'bg-teal-500', // Ocean teal
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Get username color based on userId
  const getUsernameColor = (userId: string) => {
    const colors = [
      'text-rose-600 dark:text-rose-400', // Vibrant pink
      'text-amber-600 dark:text-amber-400', // Warm orange
      'text-emerald-600 dark:text-emerald-400', // Rich green
      'text-violet-600 dark:text-violet-400', // Deep purple
      'text-cyan-600 dark:text-cyan-400', // Bright blue
      'text-fuchsia-600 dark:text-fuchsia-400', // Electric pink
      'text-lime-600 dark:text-lime-400', // Fresh lime
      'text-teal-600 dark:text-teal-400', // Ocean teal
    ];
    const index = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
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
      // Only show scroll button if we're not at bottom AND there are messages
      const isNearBottom = 
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      setShowScrollButton(!isNearBottom && messages.length > 0);
      
      if (container.scrollTop < 100 && hasMoreMessages && !loadingMore) {
        loadMoreMessages();
      }
    };
  
    container.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial scroll position
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMoreMessages, loadingMore, messages.length]);
  
  // Auto-scroll to bottom for new messages
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      if (distanceFromBottom < 100) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);
  
  // Delete all messages when results are announced
  useEffect(() => {
    if (resultsVisible) {
      const deleteAllMessages = async () => {
        const chatRef = collection(db, "classes", classId, "chat");
        const snaps = await getDocs(chatRef);
        const deletions = snaps.docs.map((docSnap) =>
          deleteDoc(doc(db, "classes", classId, "chat", docSnap.id))
        );
        await Promise.all(deletions);
        setMessages([]);
      };
      deleteAllMessages().catch((error) =>
        console.error("Error clearing chat:", error)
      );
    }
  }, [classId, resultsVisible]);
  
  // Mark messages as read
  const markMessagesAsRead = async () => {
    const unreadMessages = messages.filter(msg => 
      msg.senderId !== currentUser.uid && 
      !msg.isRead
    );
    
    if (unreadMessages.length === 0) return;
    
    try {
      const updates = unreadMessages.map(msg => {
        const docRef = doc(db, "classes", classId, "chat", msg.id);
        return updateDoc(docRef, { isRead: true });
      });
      
      await Promise.all(updates);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };
  
  // Handle scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const chatRef = collection(db, "classes", classId, "chat");
      await addDoc(chatRef, {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.replace("@stu.adamasuniversity.ac.in", "") || "Anonymous",
        createdAt: serverTimestamp(),
        isRead: false
      });
      
      setNewMessage("");
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };
  
  // Add effect to listen for reactions
  useEffect(() => {
    if (resultsVisible) return;
    
    const reactionsRef = collection(db, "classes", classId, "reactions");
    const q = query(reactionsRef, orderBy("createdAt", "desc"), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const reaction = change.doc.data() as FloatingReaction;
          setFloatingReactions(prev => [...prev, reaction]);
          
          // Remove reaction after animation
          setTimeout(() => {
            setFloatingReactions(prev => prev.filter(r => r.id !== reaction.id));
            // Delete from Firebase after animation
            deleteDoc(doc(db, "classes", classId, "reactions", change.doc.id));
          }, 2000);
        }
      });
    });
    
    return () => unsubscribe();
  }, [classId, resultsVisible]);

  // Updated reaction handler to save to Firebase
  const handleReaction = async (reaction: string) => {
    try {
      const reactionsRef = collection(db, "classes", classId, "reactions");
      const newReaction = {
        id: Math.random().toString(),
        emoji: reaction,
        x: Math.random() * 80 + 10,
        createdAt: Date.now()
      };
      
      await addDoc(reactionsRef, newReaction);
    } catch (error) {
      console.error("Error sending reaction:", error);
    }
  };

  // Delete reactions when results are announced
  useEffect(() => {
    if (resultsVisible) {
      const deleteAllReactions = async () => {
        const reactionsRef = collection(db, "classes", classId, "reactions");
        const snaps = await getDocs(reactionsRef);
        const deletions = snaps.docs.map((docSnap) =>
          deleteDoc(doc(db, "classes", classId, "reactions", docSnap.id))
        );
        await Promise.all(deletions);
        setFloatingReactions([]);
      };
      deleteAllReactions().catch((error) =>
        console.error("Error clearing reactions:", error)
      );
    }
  }, [classId, resultsVisible]);
  
  // Add message cleanup effect
  useEffect(() => {
    if (resultsVisible) return;

    // Function to delete old messages
    const cleanupOldMessages = async () => {
      try {
        const chatRef = collection(db, "classes", classId, "chat");
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000); // 2 minutes ago
        
        const q = query(
          chatRef,
          orderBy("createdAt", "asc"),
          // Use where clause to only get messages older than 2 minutes
          where("createdAt", "<", twoMinutesAgo)
        );
        
        const snapshot = await getDocs(q);
        const deletions = snapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletions);
      } catch (error) {
        console.error("Error cleaning up old messages:", error);
      }
    };

    // Run cleanup every 20 seconds
    const cleanupInterval = setInterval(cleanupOldMessages, 20 * 1000);

    // Cleanup on unmount
    return () => clearInterval(cleanupInterval);
  }, [classId, resultsVisible]);

  if (resultsVisible) return null;
  
  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        className="fixed bottom-20 right-4 z-50 bg-white/10 text-primary p-3 rounded-full shadow-lg border border-primary/20"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{ 
          transform: 'translateZ(0)',
          backdropFilter: 'blur(8px)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))'
        }}
      >
        {isChatOpen ? <X className="text-primary" /> : <MessageCircle className="text-primary" />}
      </motion.button>

      {/* Chat Container */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed top-0 md:top-[70px] right-0 bottom-0 w-full md:w-[350px] z-40 border-l border-primary/10"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            style={{ 
              backdropFilter: 'blur(12px)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
              overflow: 'hidden' // Add this to contain the floating reactions
            }}
          >
            {/* Updated Floating Reactions Container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <AnimatePresence>
                {floatingReactions.map((reaction) => (
                  <motion.div
                    key={reaction.id}
                    className="absolute bottom-16 text-4xl"
                    initial={{ 
                      opacity: 1, 
                      y: 0,
                      x: `${reaction.x}%`,
                      scale: 1
                    }}
                    animate={{ 
                      opacity: 0,
                      y: -200,
                      scale: 1.5,
                      transition: { 
                        duration: 2,
                        ease: "easeOut"
                      }
                    }}
                    exit={{ opacity: 0 }}
                  >
                    {reaction.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Chat Header */}
            <div className="border-b border-primary/10 p-3 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden text-primary/60 hover:text-primary"
                  onClick={() => setIsChatOpen(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h3 className="text-base font-medium text-primary">Live Chat</h3>
                <div className="flex items-center gap-2 text-sm text-primary/60">
                  <Users className="h-4 w-4" />
                  <span>{onlineUsers}</span>
                </div>
              </div>
            </div>

            {/* Messages Container with Fade Effect */}
            <div
              ref={messagesContainerRef}
              className="h-[calc(100%-8rem)] overflow-y-auto py-2 space-y-2"
              onClick={markMessagesAsRead}
              style={{
                background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.05) 10%, rgba(255,255,255,0.05) 90%, transparent)',
                maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
              }}
            >
              {/* Load More Button */}
              {hasMoreMessages && (
                <div className="text-center mb-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                    className="text-xs text-primary/60 hover:text-primary hover:bg-primary/10"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-3 w-3 border-2 border-primary/40 border-t-primary rounded-full" />
                        Loading...
                      </span>
                    ) : (
                      "Show more"
                    )}
                  </Button>
                </div>
              )}

              {/* Messages */}
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-primary/40">
                  <MessageCircle className="h-12 w-12 mb-2 opacity-50" />
                  <p>No messages yet</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 py-1.5 hover:bg-primary/5 group"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white shadow-lg ${getAvatarColor(msg.senderId)}`}>
                          {getInitials(msg.senderName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className={`text-base font-medium ${getUsernameColor(msg.senderId)}`}>
                              {formatUsername(msg.senderName)}
                            </span>
                            <span className="text-xs text-primary/40 group-hover:opacity-100 opacity-0">
                              {msg.createdAt?.toDate().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-base text-primary/90 break-words">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/5 border-t border-primary/10">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary/60 hover:text-primary hover:bg-primary/10"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <Smile className="h-6 w-6" />
                </Button>

                <Input
                  ref={inputRef}
                  className="flex-1 bg-white/10 border-primary/20 text-primary placeholder-primary/40 text-base"
                  placeholder="Send a message"
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
                  className="bg-primary hover:bg-primary/90 px-3"
                  size="icon"
                >
                  {isSending ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Reactions Panel */}
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-16 left-0 right-0 p-3 bg-white/10 border-t border-primary/10 flex flex-wrap gap-3 justify-center"
                    style={{ backdropFilter: 'blur(8px)' }}
                  >
                    {REACTIONS.map((reaction) => (
                      <motion.button
                        key={reaction}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-3xl cursor-pointer hover:transform hover:scale-110 transition-transform"
                        onClick={() => handleReaction(reaction)}
                      >
                        {reaction}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Scroll to Bottom Button */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute bottom-16 right-4 bg-white/10 text-primary rounded-full p-1.5 shadow-lg opacity-75 hover:opacity-100 border border-primary/20"
                  onClick={scrollToBottom}
                  style={{ backdropFilter: 'blur(4px)' }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChat;