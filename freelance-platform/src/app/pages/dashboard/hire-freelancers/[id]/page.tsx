"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    skills: "Skills",
    location: "Location",
    rate: "Rate",
    rating: "Rating",
    experience: "Experience",
    portfolio: "Portfolio",
    description: "Description",
    sendMessage: "Send a Message",
    typeMessage: "Type your message here...",
    send: "Send Message",
    backToFreelancers: "Back to Freelancers",
    errorMessage: "Please enter a message.",
    messageSent: "Message sent successfully!",
    back: "Back",
    continueChat: "You can continue the chat from the messages section.",
  },
  tr: {
    skills: "Yetenekler",
    location: "Konum",
    rate: "Ücret",
    rating: "Puan",
    experience: "Deneyim",
    portfolio: "Portföy",
    description: "Açıklama",
    sendMessage: "Mesaj Gönder",
    typeMessage: "Mesajınızı buraya yazın...",
    send: "Mesaj Gönder",
    backToFreelancers: "Freelancer'lara Geri Dön",
    errorMessage: "Lütfen bir mesaj girin.",
    messageSent: "Mesaj başarıyla gönderildi!",
    back: "Geri",
    continueChat: "Sohbeti mesajlar bölümünden devam ettirebilirsiniz.",
  },
  az: {
    skills: "Bacarıqlar",
    location: "Məkan",
    rate: "Qiymət",
    rating: "Reytinq",
    experience: "Təcrübə",
    portfolio: "Portfolio",
    description: "Təsvir",
    sendMessage: "Mesaj Göndər",
    typeMessage: "Mesajınızı buraya yazın...",
    send: "Mesaj Göndər",
    backToFreelancers: "Freelancerlərə Geri Dön",
    errorMessage: "Zəhmət olmasa bir mesaj daxil edin.",
    messageSent: "Mesaj uğurla göndərildi!",
    back: "Geri",
    continueChat: "Söhbəti mesajlar bölməsindən davam edə bilərsiniz.",
  },
};

type Freelancer = {
  _id: string;
  userType: string;
  name: string;
  email: string;
  skills: string[];
  portfolioURL: string;
  hourlyRate: { amount: number; currency: string };
  location: string;
  availability: string;
  bio: string;
  experienceLevel: string;
};

const FreelancerDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const freelancerId = params.id;

  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [freelancer, setFreelancer] = useState<Freelancer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:3002";

  const t = translations[language];

  useEffect(() => {
    const newSocket = io("https://localhost:3003");
    setSocket(newSocket);

    const token = localStorage.getItem("token");
    if (token) {
      newSocket.emit("join", token);
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

  useEffect(() => {
    fetchFreelancerDetails();
  }, [freelancerId]);

  const fetchFreelancerDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        router.push("/pages/auth/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/freelancers/${freelancerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch freelancer details.");
      }

      const data = await response.json();
      console.log("API Response:", data);

      const freelancerData = data[0];

      const skills = freelancerData.skills
        ? Array.isArray(freelancerData.skills)
          ? freelancerData.skills
          : freelancerData.skills.split(',').map((skill: string) => skill.trim())
        : [];

      const formattedFreelancer = {
        _id: freelancerData._id,
        userType: freelancerData.userType,
        name: freelancerData.name,
        email: freelancerData.email,
        skills: skills,
        portfolioURL: freelancerData.portfolioURL || '',
        hourlyRate: freelancerData.hourlyRate || { amount: 0, currency: "USD" },
        location: freelancerData.location || '',
        availability: freelancerData.availability || '',
        bio: freelancerData.bio || '',
        experienceLevel: freelancerData.experienceLevel || '',
      };
      setFreelancer(formattedFreelancer);
    } catch (err) {
      console.error("Error fetching freelancer details:", err);
      setError("An error occurred while fetching freelancer details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message) {
      setError(t.errorMessage);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      if (!socket.connected) {
        setError("Socket connection not established. Please try again.");
        return;
      }

      socket.emit("private message", {
        toUsername: freelancerId,
        message: message,
      });

      console.log("Message sent successfully");
      setMessage("");
      setError(null);

      alert(`${t.messageSent}\n${t.continueChat}`);
      router.push("/pages/dashboard/messages")
    } catch (err) {
      console.error("Error sending message:", err);
      setError("An error occurred while sending the message.");
    }
  };

  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!freelancer) {
    return <p className="text-center">Freelancer not found.</p>;
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-8`}
      >
        {/* Freelancer Başlık ve Profil Resmi */}
        <div className="flex flex-col items-center space-y-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md"
          >
            {freelancer.name ? freelancer.name.charAt(0) : "?"}
          </motion.div>
          <h1 className={`text-3xl font-bold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {freelancer.name}
          </h1>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {freelancer.location}
          </p>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-center font-medium mt-4"
          >
            {error}
          </motion.p>
        )}

        {/* Freelancer Detayları */}
        <div className="mt-8 space-y-6">
          {/* Yetenekler */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t.skills}
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {freelancer.skills.map((skill: string) => (
                <motion.span
                  key={skill}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Ücret ve Portföy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t.rate}
              </label>
              <p className={`mt-1 text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                {freelancer.hourlyRate.amount} {freelancer.hourlyRate.currency}/hour
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                {t.portfolio}
              </label>
              <p className={`mt-1 text-lg font-semibold ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"} hover:underline`}>
                <a href={freelancer.portfolioURL} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  {freelancer.portfolioURL} <span className="ml-2">↗️</span>
                </a>
              </p>
            </div>
          </div>

          {/* Deneyim */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t.experience}
            </label>
            <p className={`mt-1 text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              {freelancer.experienceLevel}
            </p>
          </div>

          {/* Açıklama */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t.description}
            </label>
            <p className={`mt-1 text-lg ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>
              {freelancer.bio}
            </p>
          </div>
        </div>

        {/* Mesaj Gönderme */}
        <div className="mt-8 space-y-4">
          <h2 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.sendMessage}
          </h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.typeMessage}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
              theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <button
              onClick={() => router.push("/pages/dashboard/hire-freelancers")}
              className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
            >
              {t.back}
            </button>
            <span className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {message.length}/500
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md"
            >
              {t.send}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FreelancerDetailsPage;