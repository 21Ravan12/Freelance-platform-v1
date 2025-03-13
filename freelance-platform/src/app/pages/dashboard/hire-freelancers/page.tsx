"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    hireFreelancers: "Hire Freelancers",
    filters: "Filters",
    searchFreelancers: "Search freelancers...",
    skills: "Skills",
    location: "Location",
    rate: "Rate",
    rating: "Rating",
    back: "Back",
    description: "Description",
  },
  tr: {
    hireFreelancers: "Freelancer Kirala",
    filters: "Filtreler",
    searchFreelancers: "Freelancer ara...",
    skills: "Yetenekler",
    location: "Konum",
    rate: "Ücret",
    rating: "Puan",
    back: "Geri",
    description: "Açıklama",
  },
  az: {
    hireFreelancers: "Freelancerlər İşə Götür",
    filters: "Filtrlər",
    searchFreelancers: "Freelancer axtar...",
    skills: "Bacarıqlar",
    location: "Məkan",
    rate: "Qiymət",
    rating: "Reytinq",
    back: "Geri",
    description: "Təsvir",
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
};

const HireFreelancersPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:3002";

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, []);

  const fetchFreelancers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        router.push("/pages/auth/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/freelancers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch freelancers");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid response format: Expected an array of freelancers.");
      }

      const formattedFreelancers = data.map((freelancer) => ({
        _id: freelancer._id,
        userType: freelancer.userType,
        name: freelancer.name,
        email: freelancer.email,
        skills: Array.isArray(freelancer.skills) ? freelancer.skills : freelancer.skills.split(',').map((skill: string) => skill.trim()) || [],
        portfolioURL: freelancer.portfolioURL || '',
        hourlyRate: freelancer.hourlyRate || { amount: 0, currency: "USD" },
        location: freelancer.location || '',
        availability: freelancer.availability || '',
        bio: freelancer.bio || '',
      }));
      setFreelancers(formattedFreelancers);
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      setError("An error occurred while fetching freelancers.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleHireFreelancer = (freelancerId: string) => {
    router.push(`/pages/dashboard/hire-freelancers/${freelancerId}`);
  };

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch = freelancer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => freelancer.skills.includes(skill));
    return matchesSearch && matchesSkills;
  });

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"}`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`w-full max-w-6xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}
      >
        {/* Başlık */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`text-5xl font-bold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          {t.hireFreelancers}
        </motion.h1>

        {/* Hata Mesajı */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-red-500 text-center font-medium"
          >
            {error}
          </motion.p>
        )}

        {/* Filtreleme ve Arama */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-6 rounded-xl shadow-inner`}
        >
          <h2 className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-4`}>
            {t.filters}
          </h2>
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchFreelancers}
              className={`flex-1 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <select
              multiple
              value={selectedSkills}
              onChange={(e) =>
                setSelectedSkills(
                  Array.from(e.target.selectedOptions, (option) => option.value)
                )
              }
              className={`px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="React">React</option>
              <option value="Node.js">Node.js</option>
              <option value="TypeScript">TypeScript</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Python">Python</option>
              <option value="Data Science">Data Science</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>
          </div>
        </motion.div>

        {/* Freelancer Listesi */}
        {isLoading ? (
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-center"
          >
            Loading...
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredFreelancers.map((freelancer) => (
              <motion.div
                key={freelancer._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer`}
                onClick={() => handleHireFreelancer(freelancer._id)}
              >
                {/* Freelancer Profil Resmi */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                    {freelancer.name.charAt(0)}
                  </div>
                  <h3 className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {freelancer.name}
                  </h3>
                </div>

                {/* Freelancer Bilgileri */}
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {t.location}: {freelancer.location}
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {t.rate}: {freelancer.hourlyRate.amount} {freelancer.hourlyRate.currency}/hour
                </p>

                {/* Yetenekler */}
                <div className="mt-4">
                  <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.skills}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {freelancer.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className={`px-2 py-1 rounded-full text-sm ${
                          theme === "dark" ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Açıklama */}
                <p className={`mt-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>
                  {t.description}: {freelancer.bio}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
        <button
          onClick={() => router.push("/pages/dashboard/main")}
          className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
        >
          {t.back}
        </button>
      </motion.div>
    </div>
  );
}

export default HireFreelancersPage;