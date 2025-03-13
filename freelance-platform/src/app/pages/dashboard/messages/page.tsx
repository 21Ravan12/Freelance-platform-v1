"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import io from "socket.io-client";

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
}

const MessagesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<"inbox" | "sent" | "drafts">("inbox");
  const [language, setLanguage] = useState<Language>("en");
  const [newMessage, setNewMessage] = useState("");
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    const newSocket = io("https://localhost:3003");
    setSocket(newSocket);

    const token = localStorage.getItem("token");
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
        } else {
          newSocket.emit("read message", {
            toUsername: message.from,
          });
        }
      }

    });

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
        console.log("User data fetched successfully:", user);
        return {
          id: user[0]._id,
          username: user[0].name,
          unreadCount: user[0].unreadCount,
          profilePhotoUrl: user[0].profilePhotoUrl || "", 
        };
      })
    );
  
    setUsers(users);
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.noMessageSelected);
        return;
      }
      console.log("Fetching messages...");
      const response = await fetch(`https://localhost:3002/api/messages`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response:", response);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.noMessageSelected);
      }

      const data = await response.json();
      console.log("Fetched messages:", data);
      setMessages(data.messages || []);
      setCurrentUserId(data.receiver);
      await fetchUsersFromMessages(data.messages, data.receiver);
    } catch (err) {
      console.error("Error fetching messages:", err);
      if (err instanceof Error) {
        setError(err.message || t.noMessageSelected);
      } else {
        setError(t.noMessageSelected);
      }
      setMessages([]);
      setFilteredMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage) {
      setError(t.noMessageSelected);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.noMessageSelected);
        return;
      }

      const recipient = selectedUserId;

      if (!recipient) {
        setError(t.noMessageSelected);
        return;
      }

      if (socket) {
        socket.emit("private message", {
          toUsername: recipient,
          message: newMessage,
        });
      }

      console.log("Message sent successfully:", newMessage);
      setNewMessage("");
      setError(null);
    } catch (err) {
      console.error("Error sending message:", err);
      setError(t.noMessageSelected);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedCategory]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full max-w-6xl h-screen flex flex-col ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden`}
      >
        {/* Başlık ve Tema Değiştirme Butonu */}
        <div className="flex justify-between items-center px-8 py-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={`text-4xl font-extrabold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
          >
            {t.title}
          </motion.h1>
        </div>

        {/* Hata ve Başarı Mesajları */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-center font-medium mb-6"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-green-500 text-center font-medium mb-6"
          >
            {success}
          </motion.p>
        )}
    
    {/* Mesaj Listesi ve Detayları */}
    <div className="flex-1 flex overflow-hidden">
      {/* Sol Tarafta Kullanıcı Listesi */}
      <div className={`w-1/3 p-6 overflow-y-auto border-r ${theme === "dark" ? "bg-gray-750 border-gray-700" : "bg-gray-100 border-gray-200"}`}>
        <h2 className={`text-2xl font-semibold mb-6 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.inbox}
        </h2>
        <div className="space-y-3">
          {users.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-200"
              }`}
              onClick={() => {
                const userMessages = messages.filter(
                  (msg) => msg.from === user.id || msg.to === user.id
                );
    
                if (socket) {
                  socket.emit("read message", {
                    toUsername: user.id,
                  });
                }
    
                user.unreadCount = 0;
    
                setFilteredMessages(userMessages);
                setSelectedUserId(user.id);
              }}
            >
 <div className="flex items-center relative">
  {/* Profile Picture */}
  <div className="relative">
    {user.profilePhotoUrl ? (
      <img
        src={user.profilePhotoUrl}
        alt={user.username}
        className="w-10 h-10 rounded-full mr-4"
      />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
        {user.username.charAt(0)}
      </div>
    )}
  </div>
  {/* Username */}
  <div className="flex-1">
    <p className={`text-lg ml-4 font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
      {user.username}
    </p>
  </div>
  {/* Unread Count */}
  {(user.unreadCount ?? 0) > 0 && (
    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {user.unreadCount}
    </div>
  )}
</div>
              </motion.div>
            ))}
          </div>
          </div>

         {/* Sağ Tarafta Mesaj Detayları */}
         <div className={`flex-1 p-6 overflow-y-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
           {filteredMessages.length > 0 ? (
             filteredMessages.map((message) => {
               const isCurrentUser = message.from === currentUserId;
               const sender = users.find((user) => user.id === message.from)?.username || "Unknown";
       
               return (
                 <div
                   key={message._id}
                   className={`flex flex-col mb-4 ${
                     isCurrentUser ? "items-end" : "items-start"
                   }`}
                 >
                   <div
                     className={`p-3 rounded-lg max-w-[70%] ${
                       isCurrentUser
                         ? "bg-blue-500 text-white"
                         : theme === "dark"
                         ? "bg-gray-700 text-white"
                         : "bg-gray-200 text-gray-900"
                     }`}
                   >
                     <p className="text-sm font-semibold mb-1">
                       {isCurrentUser ? t.from : sender}
                     </p>
                     <p className="text-base">{message.message}</p>
                   </div>
                 </div>
               );
             })
           ) : (
             <p className={`text-center py-8 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
               {t.noMessageSelected}
             </p>
           )}
           <div ref={messagesEndRef} /> {/* Mesajların en altına referans */}
         </div>
       </div>
       
        {/* Yeni Mesaj Gönderme */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className={`px-8 py-6 ${theme === "dark" ? "bg-gray-750" : "bg-gray-100"}`}
        >
          <div className="flex items-center gap-4">
            <textarea
              value={newMessage}
              onChange={handleTextareaChange}
              placeholder={t.searchPlaceholder}
              className={`flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              rows={1}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center"
            >
              <FontAwesomeIcon icon={faPaperPlane} className="text-xl" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MessagesPage;