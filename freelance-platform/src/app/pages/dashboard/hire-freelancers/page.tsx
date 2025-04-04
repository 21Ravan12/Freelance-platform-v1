"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    hireFreelancers: "Hire Freelancers",
    filters: "🔍 Filters",
    searchFreelancers: "Search freelancers...",
    skills: "Skills",
    location: "Location",
    rate: "Rate",
    rating: "⭐ Rating",
    back: "⬅️ Back",
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
    manageJobs: "Manage Jobs",
    loading: "⏳ Loading freelancers...",
    noFreelancers: "🔍 No freelancers found",
    errorFetching: "❌ Error loading freelancers",
    unauthorized: "🔒 Please login to view freelancers"
  },
  tr: {
    hireFreelancers: "Freelancer Kirala",
    filters: "🔍 Filtreler",
    searchFreelancers: "Freelancer ara...",
    skills: "Yetenekler",
    location: "Konum",
    rate: "Ücret",
    rating: "⭐ Puan",
    back: "⬅️ Geri",
    description: "📝 Açıklama",
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
    manageJobs: "İşleri Yönet",
    loading: "⏳ Freelancerlar yükleniyor...",
    noFreelancers: "🔍 Freelancer bulunamadı",
    errorFetching: "❌ Freelancerlar yüklenirken hata oluştu",
    unauthorized: "🔒 Freelancerları görmek için giriş yapın"
  },
  az: {
    hireFreelancers: "Freelancerlər İşə Götür",
    filters: "🔍 Filtrlər",
    searchFreelancers: "Freelancer axtar...",
    skills: "Bacarıqlar",
    location: "Məkan",
    rate: "Qiymət",
    rating: "⭐ Reytinq",
    back: "⬅️ Geri",
    description: "📝 Təsvir",
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
    manageJobs: "İşləri idarə et",
    loading: "⏳ Freelancerlar yüklənir...",
    noFreelancers: "🔍 Freelancer tapılmadı",
    errorFetching: "❌ Freelancerlar yüklənərkən xəta baş verdi",
    unauthorized: "🔒 Freelancerları görmək üçün daxil olun"
  }
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
  rating?: number;
};

const HireFreelancersPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userType, setUserType] = useState<"freelancer" | "employer">("employer");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:3002";
  const t = translations[language];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  };

  const fetchFreelancers = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.unauthorized);
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
        throw new Error(errorData.message || t.errorFetching);
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
        skills: Array.isArray(freelancer.skills) 
          ? freelancer.skills 
          : (freelancer.skills || '').split(',').map((skill: string) => skill.trim()),
        portfolioURL: freelancer.portfolioURL || '',
        hourlyRate: freelancer.hourlyRate || { amount: 0, currency: "USD" },
        location: freelancer.location || '',
        availability: freelancer.availability || '',
        bio: freelancer.bio || '',
        rating: freelancer.rating || 0
      }));
      
      setFreelancers(formattedFreelancers);
      setError(null);
    } catch (err) {
      console.error("Error fetching freelancers:", err);
      setError(err instanceof Error ? err.message : t.errorFetching);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, t, router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchFreelancers();
  }, [fetchFreelancers]);

  const handleHireFreelancer = (freelancerId: string) => {
    router.push(`/pages/dashboard/hire-freelancers/${freelancerId}`);
  };

  const filteredFreelancers = freelancers.filter((freelancer) => {
    const matchesSearch = 
      freelancer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      freelancer.skills.some(skill => 
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.every((skill) => freelancer.skills.includes(skill));
    
    return matchesSearch && matchesSkills;
  });

  const allSkills = Array.from(
    new Set(freelancers.flatMap(f => f.skills))
  ).filter(Boolean);

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Sidebar 
        theme={theme}
        translations={t}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        userType={userType}
        language={language}
      />
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar
          theme={theme}
          language={language}
          userRole={userType}
          unreadCount={unreadCount}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          toggleNotifications={toggleNotifications}
          notificationsOpen={notificationsOpen}
          toggleTheme={toggleTheme}
          setLanguage={(newLanguage: Language) => {
            setLanguage(newLanguage);
            localStorage.setItem("language", newLanguage);
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-7xl mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 space-y-6`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                {t.hireFreelancers}
              </h1>
              <button
                onClick={() => router.push("/pages/dashboard/main")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {t.back}
              </button>
            </div>

            {error && (
              <div className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800"
              }`}>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Filters Section */}
            <div className={`p-6 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.filters}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t.searchFreelancers}
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchFreelancers}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t.skills}
                  </label>
                  <select
                    multiple
                    value={selectedSkills}
                    onChange={(e) => {
                      const options = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedSkills(options);
                    }}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    {allSkills.map(skill => (
                      <option key={skill} value={skill}>{skill}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Freelancers List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredFreelancers.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t.noFreelancers}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFreelancers.map((freelancer) => (
                  <motion.div
                    key={freelancer._id}
                    whileHover={{ y: -5 }}
                    className={`rounded-xl shadow-md overflow-hidden transition-all border ${
                      theme === "dark" 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                    onClick={() => handleHireFreelancer(freelancer._id)}
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                          {freelancer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                            {freelancer.name}
                          </h3>
                          {freelancer.rating && (
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className={`ml-1 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                                {freelancer.rating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <DetailRow emoji="📍" text={`${t.location}: ${freelancer.location}`} theme={theme} />
                        <DetailRow 
                          emoji="💰" 
                          text={`${t.rate}: ${freelancer.hourlyRate.amount} ${freelancer.hourlyRate.currency}/hour`} 
                          theme={theme} 
                        />
                        <DetailRow
                          emoji="🛠️"
                          text={`${t.skills}:`}
                          theme={theme}
                        />
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.slice(0, 5).map((skill) => (
                            <span
                              key={skill}
                              className={`px-2 py-1 rounded-full text-xs ${
                                theme === "dark" 
                                  ? "bg-blue-600 text-white" 
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {skill}
                            </span>
                          ))}
                          {freelancer.skills.length > 5 && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              theme === "dark" 
                                ? "bg-gray-600 text-gray-300" 
                                : "bg-gray-200 text-gray-600"
                            }`}>
                              +{freelancer.skills.length - 5}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className={`mt-4 line-clamp-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                        {freelancer.bio}
                      </p>

                      <button
                        className={`mt-4 w-full py-2 rounded-lg transition-all ${
                          theme === "dark" 
                            ? "bg-blue-600 hover:bg-blue-500 text-white" 
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                      >
                        Hire Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

interface DetailRowProps {
  emoji: string;
  text: string;
  theme: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ emoji, text, theme }) => (
  <div className="flex items-start gap-2">
    <span>{emoji}</span>
    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
      {text}
    </span>
  </div>
);

export default HireFreelancersPage;
