"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    title: "Messages",
    inbox: "Inbox",
    sent: "Sent",
    drafts: "Drafts",
    searchPlaceholder: "Search messages...",
    newMessage: "New Message",
    sendMessage: "Send Message",
    noMessageSelected: "Select a message to view details.",
    from: "You",
    themeLight: "Light",
    themeDark: "Dark",
    languageEnglish: "English",
    languageTurkish: "Turkish",
    languageSpanish: "Spanish",
    dashboard: "Dashboard",
    profile: "Profile",
    projects: "Projects",
    messages: "Messages",
    analytics: "Analytics",
    settings: "Settings",
    logout: "Logout",
    applyProjects: "Apply Projects",
    jobListings: "Job Listings",
    createProject: "Create Project",
    hireFreelancers: "Hire Freelancers",
    manageJobs: "Manage Jobs",
  },
  tr: {
    title: "Mesajlar",
    inbox: "Gelen Kutusu",
    sent: "Gönderilenler",
    drafts: "Taslaklar",
    searchPlaceholder: "Mesaj ara...",
    newMessage: "Yeni Mesaj",
    sendMessage: "Mesaj Gönder",
    noMessageSelected: "Detayları görüntülemek için bir mesaj seçin.",
    from: "Sen",
    themeLight: "Açık",
    themeDark: "Koyu",
    languageEnglish: "İngilizce",
    languageTurkish: "Türkçe",
    languageSpanish: "İspanyolca",
    dashboard: "Panel",
    profile: "Profil",
    projects: "Projeler",
    messages: "Mesajlar",
    analytics: "Analizler",
    settings: "Ayarlar",
    logout: "Çıkış Yap",
    applyProjects: "Projelere Başvur",
    jobListings: "İş İlanları",
    createProject: "Proje Oluştur",
    hireFreelancers: "Freelancer Bul",
    manageJobs: "İşleri Yönet",
  },
  az: {
    title: "Mesajlar",
    inbox: "Gələnlər",
    sent: "Göndərilənlər",
    drafts: "Qaralamalar",
    searchPlaceholder: "Mesaj axtar...",
    newMessage: "Yeni Mesaj",
    sendMessage: "Mesaj Göndər",
    noMessageSelected: "Detalları görmək üçün bir mesaj seçin.",
    from: "Siz",
    themeLight: "Açıq",
    themeDark: "Qaranlıq",
    languageEnglish: "İngilis dili",
    languageTurkish: "Türk dili",
    languageSpanish: "İspan dili",
    dashboard: "İdarə Paneli",
    profile: "Profil",
    projects: "Layihələr",
    messages: "Mesajlar",
    analytics: "Analitika",
    settings: "Parametrlər",
    logout: "Çıxış",
    applyProjects: "Layihələrə müraciət",
    jobListings: "Vakansiyalar",
    createProject: "Layihə yarat",
    hireFreelancers: "Freelancer tap",
    manageJobs: "İşləri idarə et",
  },
};

interface Message {
  _id: string;
  from: string;
  to: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

interface User {
  id: string;
  username: string;
  unreadCount?: number;
  profilePhotoUrl?: string;
  lastMessage?: string; // Added lastMessage property
}

const MessagesPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<"inbox" | "sent" | "drafts">("inbox");
  const [language, setLanguage] = useState<Language>("en");
  const [newMessage, setNewMessage] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("");
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    const savedUserRole = localStorage.getItem("userRole");
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
    }

    const newSocket = io("https://localhost:3003");
    setSocket(newSocket);

    if (token) {
      newSocket.emit("join", token);
    }

    newSocket.on("chat message", (message: Message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
      if (selectedUserId && (message.from === selectedUserId || message.to === selectedUserId)) {
        setFilteredMessages((prevMessages) => [...prevMessages, message]);
      }

      if (message.to === currentUserId && !message.isRead) {
        if (message.from !== selectedUserId) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === message.from ? { ...user, unreadCount: (user.unreadCount || 0) + 1 } : user
            )
          );
          setUnreadCount(prev => prev + 1);
        } else {
          newSocket.emit("read message", {
            toUsername: message.from,
          });
        }
      }
    });

    setUserRole(savedUserRole || "");

    return () => {
      newSocket.disconnect();
    };
    
  }, [selectedUserId, currentUserId]);

  const fetchUsersFromMessages = async (messages: Message[], currentUserId: string) => {
    const uniqueUserIds = new Set<string>();
  
    messages.forEach((message) => {
      if (message.from !== currentUserId) uniqueUserIds.add(message.from);
      if (message.to !== currentUserId) uniqueUserIds.add(message.to);
    });
  
    const users = await Promise.all(
      Array.from(uniqueUserIds).map(async (userId) => {
        const response = await fetch(`https://localhost:3002/api/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch user data.");
        const user = await response.json();
        return {
          id: user[0]._id,
          username: user[0].name,
          unreadCount: messages.filter(m => m.from === userId && !m.isRead).length,
          profilePhotoUrl: user[0].profilePhotoUrl || "", 
        };
      })
    );
  
    setUsers(users);
    setUnreadCount(users.reduce((total, user) => total + (user.unreadCount || 0), 0));
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.noMessageSelected);
        return;
      }
      
      const response = await fetch(`https://localhost:3002/api/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.noMessageSelected);
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setCurrentUserId(data.receiver);
      await fetchUsersFromMessages(data.messages, data.receiver);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError(err instanceof Error ? err.message : t.noMessageSelected);
      setMessages([]);
      setFilteredMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      setError("Message cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token || !selectedUserId) {
        setError(t.noMessageSelected);
        return;
      }

      if (socket) {
        socket.emit("private message", {
          toUsername: selectedUserId,
          message: newMessage,
        });
        
        // Optimistically add the message
        const newMsg: Message = {
          _id: Date.now().toString(),
          from: currentUserId || "",
          to: selectedUserId,
          message: newMessage,
          isRead: false,
          timestamp: new Date().toISOString()
        };
        
        setNewMessage("");
        setError(null);
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedCategory, language]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Sidebar 
        theme={theme}
        translations={t}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        userType={userRole}
        language={language}
      />
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}
  
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          theme={theme}
          language={language}
          userRole={userRole}
          unreadCount={unreadCount}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          toggleNotifications={toggleNotifications}
          notificationsOpen={notificationsOpen}
          toggleTheme={() => {
            const newTheme = theme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
            localStorage.setItem("theme", newTheme);
            document.body.className = newTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
          }}
          setLanguage={(newLanguage: Language) => {
            setLanguage(newLanguage);
            localStorage.setItem("language", newLanguage);
          }}
        />
  
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`w-full max-w-6xl mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl overflow-hidden`}
          >
            {/* Status Messages */}
            <div className="px-6 pt-4">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-500 text-center font-medium py-2 px-4 rounded-lg bg-red-500/10"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-green-500 text-center font-medium py-2 px-4 rounded-lg bg-green-500/10"
                >
                  {success}
                </motion.p>
              )}
            </div>
  
            {/* Main Chat Layout */}
            <div className="flex flex-col md:flex-row h-[calc(100vh-180px)] min-h-[500px]">
              {/* Users List */}
              <div className={`w-full md:w-1/4 border-b md:border-b-0 md:border-r ${theme === "dark" ? "bg-gray-750 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                <div className="p-4 h-full overflow-y-auto">
                  <h2 className={`text-lg font-bold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    Contacts
                  </h2>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <motion.div
                        key={user.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          theme === "dark" 
                            ? "bg-gray-700 hover:bg-gray-600" 
                            : "bg-white hover:bg-gray-100"
                        } ${
                          selectedUserId === user.id 
                            ? (theme === "dark" 
                              ? "ring-2 ring-blue-500 bg-gray-600" 
                              : "ring-2 ring-blue-400 bg-blue-50")
                            : ""
                        } shadow-sm`}
                        onClick={() => {
                          const userMessages = messages.filter(
                            (msg) => msg.from === user.id || msg.to === user.id
                          );
              
                          if (socket) {
                            socket.emit("read message", {
                              toUsername: user.id,
                            });
                          }
              
                          setUsers(prevUsers => 
                            prevUsers.map(u => 
                              u.id === user.id ? {...u, unreadCount: 0} : u
                            )
                          );
                          setUnreadCount(prev => prev - (user.unreadCount || 0));
              
                          setFilteredMessages(userMessages);
                          setSelectedUserId(user.id);
                        }}
                      >
                        <div className="flex items-center gap-3 relative">
                          {user.profilePhotoUrl ? (
                            <img
                              src={user.profilePhotoUrl}
                              alt={user.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`truncate font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                              {user.username}
                            </p>
                            <p className={`text-xs truncate ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                              {user.lastMessage?.substring(0, 20) || "No messages yet"}
                            </p>
                          </div>
                          {(user.unreadCount ?? 0) > 0 && (
                            <div className="absolute top-0 right-0 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                              {user.unreadCount}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
  
              {/* Messages Area */}
              <div className={`flex-1 flex flex-col ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
                <div className="flex-1 overflow-y-auto p-4">
                  {filteredMessages.length > 0 ? (
                    <div className="space-y-3">
                      {filteredMessages.map((message) => {
                        const isCurrentUser = message.from === currentUserId;
                        const sender = users.find((user) => user.id === message.from)?.username || "Unknown";
                
                        return (
                          <motion.div
                            key={message._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-3 ${
                                isCurrentUser
                                  ? "bg-blue-500 text-white rounded-br-none"
                                  : theme === "dark"
                                  ? "bg-gray-700 text-white rounded-bl-none"
                                  : "bg-gray-100 text-gray-800 rounded-bl-none"
                              }`}
                            >
                              <p className="text-xs font-medium opacity-80 mb-1">
                                {isCurrentUser ? "You" : sender}
                              </p>
                              <p className="text-sm">{message.message}</p>
                              <p className="text-xs opacity-60 text-right mt-1">
                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-6 max-w-md">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                          <svg className="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                          {selectedUserId ? "Start a conversation" : "Select a contact"}
                        </h3>
                        <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                          {selectedUserId 
                            ? "Send your first message to begin chatting" 
                            : "Choose a contact from the list to view messages"}
                        </p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
  
                {/* Message Input */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className={`p-4 border-t ${theme === "dark" ? "bg-gray-750 border-gray-700" : "bg-gray-50 border-gray-200"}`}
                >
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={handleTextareaChange}
                        placeholder={selectedUserId ? "Type your message..." : "Select a user to message"}
                        disabled={!selectedUserId}
                        className={`w-full px-4 py-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                          theme === "dark" 
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        } ${!selectedUserId ? "opacity-50 cursor-not-allowed" : ""}`}
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && newMessage.trim()) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <div className={`absolute right-3 bottom-3 text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        {newMessage.length}/1000
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      disabled={!selectedUserId || !newMessage.trim()}
                      className={`p-3 rounded-xl transition-all flex items-center justify-center ${
                        !selectedUserId || !newMessage.trim()
                          ? theme === "dark"
                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default MessagesPage;
