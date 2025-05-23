"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiHome, FiUser, FiBriefcase, FiSettings, FiBarChart2, FiLogOut, FiMessageSquare, FiFileText, FiUsers, FiList, FiMenu, FiSun, FiMoon, FiGlobe } from "react-icons/fi";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    title: "Profile Settings",
    name: "Name",
    email: "Email",
    skills: "Skills",
    portfolio: "Portfolio URL",
    cancel: "Cancel",
    save: "Save",
    editProfile: "Edit Profile",
    successMessage: "Profile updated successfully!",
    companyName: "Company Name",
    companyWebsite: "Company Website",
    companyBio: "Company Bio",
    jobCategories: "Job Categories",
    hourlyRate: "Hourly Rate",
    back: "Back",
    location: "Location",
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
    title: "Profil Ayarları",
    name: "İsim",
    email: "E-posta",
    skills: "Yetenekler",
    portfolio: "Portföy URL",
    cancel: "İptal",
    save: "Kaydet",
    editProfile: "Profili Düzenle",
    successMessage: "Profil başarıyla güncellendi!",
    companyName: "Şirket Adı",
    companyWebsite: "Şirket Websitesi",
    companyBio: "Şirket Açıklaması",
    jobCategories: "İş Kategorileri",
    hourlyRate: "Saatlik Ücret",
    back: "Geri",
    location: "Konum",
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
    title: "Profil Tənzimləmələri",
    name: "Ad",
    email: "E-poçt",
    skills: "Bacarıqlar",
    portfolio: "Portfolio URL",
    cancel: "Ləğv et",
    save: "Yadda saxla",
    editProfile: "Profili Redaktə Et",
    successMessage: "Profil uğurla yeniləndi!",
    companyName: "Şirkət Adı",
    companyWebsite: "Şirkət Vebsaytı",
    companyBio: "Şirkət Haqqında",
    jobCategories: "İş Kateqoriyaları",
    hourlyRate: "Saatlıq Qiymət",
    back: "Geri",
    location: "Yerləşmə",
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

const ProfilePage = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    skills: [] as string[],
    portfolioURL: "",
    bio: "",
    companyName: "",
    companyWebsite: "",
    companyBio: "",
    jobCategories: [] as string[],
    hourlyRate: { amount: 0, currency: "USD" },
    location: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState<"freelancer" | "employer">("freelancer");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:3002";
  const router = useRouter();

  useEffect(() => {
    const lang = localStorage.getItem("language") as Language || 'en';
    const theme = (localStorage.getItem("theme") as "light" | "dark") || "light";
    setLanguage(lang);
    setTheme(theme);
    document.body.className = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        router.push("/pages/auth/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/profile/get`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch profile data");
      }

      const data = await response.json();
      setUserType(data.userType);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        skills: data.skills || [],
        portfolioURL: data.portfolioURL || "",
        bio: data.bio || "",
        companyName: data.companyName || "",
        companyWebsite: data.companyWebsite || "",
        companyBio: data.companyBio || "",
        jobCategories: data.jobCategories || [],
        hourlyRate: data.hourlyRate || { amount: 0, currency: "USD" },
        location: data.location || "",
      });
    } catch (err) {
      console.error("Error fetching profile data", err);
      setError("An error occurred while fetching profile data.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.split(",") }));
  };

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      hourlyRate: { ...prev.hourlyRate, [name]: value },
    }));
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      hourlyRate: { ...prev.hourlyRate, [name]: value },
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        router.push("/pages/auth/login");
        return;
      }

      const payload = userType === "freelancer" ? {
        name: formData.name,
        skills: formData.skills,
        portfolioURL: formData.portfolioURL,
        hourlyRate: formData.hourlyRate,
        location: formData.location,
        bio: formData.bio,
      } : {
        name: formData.name,
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyBio: formData.companyBio,
        jobCategories: formData.jobCategories,
      };

      const response = await fetch(`${API_URL}/api/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setIsEditing(false);
      setError(null);
      setSuccessMessage(translations[language].successMessage);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating profile", err);
      setError("An error occurred while updating profile.");
    }
  };

  const t = translations[language];

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
      
      <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        language={language} 
        setLanguage={(lang) => {
          setLanguage(lang);
          localStorage.setItem("language", lang);
        }}
        toggleSidebar={toggleSidebar}
        userRole={userType}
        unreadCount={0} // Replace with actual unread count if available
        sidebarOpen={sidebarOpen}
        toggleNotifications={() => console.log("Toggle notifications")} // Replace with actual function
        notificationsOpen={false} // Replace with actual state if available
      />

      <main className={"flex-1 overflow-y-auto p-6"}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`w-full max-w-4xl mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-xl p-6 space-y-6`}
        >
          <h1 className={`text-2xl font-bold text-center tracking-tight ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.title}
          </h1>

          {/* Error and Success Messages */}
          {error && (
            <p className="text-red-500 text-center text-sm font-medium">{error}</p>
          )}
          {successMessage && (
            <p className="text-green-500 text-center text-sm font-medium">{successMessage}</p>
          )}

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Common Fields */}
            <div className="space-y-1">
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {t.name}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                    theme === "dark" 
                      ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                      : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                  }`}
                />
              ) : (
                <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg`}>
                  {formData.name}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {t.email}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm ${
                  theme === "dark" 
                    ? "bg-gray-700 border-gray-600 text-gray-400" 
                    : "bg-gray-100 border-gray-300 text-gray-500"
                }`}
              />
            </div>

            {/* Freelancer Fields */}
            {userType === "freelancer" && (
              <>
                <div className="md:col-span-2 space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.skills}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills.join(",")}
                      onChange={handleArrayChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg`}>
                      {formData.skills.join(", ")}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.portfolio}
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="portfolioURL"
                      value={formData.portfolioURL}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-blue-400" : "text-blue-600"} hover:underline p-2.5 rounded-lg`}>
                      <a href={formData.portfolioURL} target="_blank" rel="noopener noreferrer">
                        {formData.portfolioURL}
                      </a>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.hourlyRate}
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        name="amount"
                        value={formData.hourlyRate.amount}
                        onChange={handleHourlyRateChange}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                          theme === "dark" 
                            ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                            : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                        }`}
                      />
                      <select
                        name="currency"
                        value={formData.hourlyRate.currency}
                        onChange={handleCurrencyChange}
                        className={`px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                          theme === "dark" 
                            ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                            : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                        }`}
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="TRY">TRY</option>
                      </select>
                    </div>
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg`}>
                      {formData.hourlyRate.amount} {formData.hourlyRate.currency}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.location}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg`}>
                      {formData.location}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                      rows={3}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg leading-relaxed`}>
                      {formData.bio}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Employer Fields */}
            {userType === "employer" && (
              <>
                <div className="space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.companyName}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg`}>
                      {formData.companyName}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.companyWebsite}
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      name="companyWebsite"
                      value={formData.companyWebsite}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-blue-400" : "text-blue-600"} hover:underline p-2.5 rounded-lg`}>
                      <a href={formData.companyWebsite} target="_blank" rel="noopener noreferrer">
                        {formData.companyWebsite}
                      </a>
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.companyBio}
                  </label>
                  {isEditing ? (
                    <textarea
                      name="companyBio"
                      value={formData.companyBio}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                      rows={3}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg leading-relaxed`}>
                      {formData.companyBio}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.jobCategories}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="jobCategories"
                      value={formData.jobCategories}
                      onChange={handleChange}
                      className={`mt-1 block w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 ${
                        theme === "dark" 
                          ? "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500" 
                          : "bg-white border-gray-300 text-gray-700 focus:ring-blue-500"
                      }`}
                    />
                  ) : (
                    <p className={`mt-1 text-base ${theme === "dark" ? "text-gray-200 bg-gray-700" : "text-gray-700 bg-gray-100"} p-2.5 rounded-lg`}>
                      {formData.jobCategories}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center gap-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    theme === "dark" 
                      ? "text-gray-200 bg-gray-700 hover:bg-gray-600 shadow-md" 
                      : "text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm"
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSave}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md ${
                    theme === "dark" ? "shadow-blue-500/20" : "shadow-blue-400/20"
                  }`}
                >
                  {t.save}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push("/pages/dashboard/main")}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    theme === "dark" 
                      ? "text-gray-200 bg-gray-700 hover:bg-gray-600 shadow-md" 
                      : "text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  {t.back}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md ${
                    theme === "dark" ? "shadow-blue-500/20" : "shadow-blue-400/20"
                  }`}
                >
                  {t.editProfile}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </main>
      </div>
    </div>
  );
};

export default ProfilePage;
