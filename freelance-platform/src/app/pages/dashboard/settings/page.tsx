"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type TranslationKeys = {
  title: string;
  notifications: string;
  enableNotifications: string;
  security: string;
  enable2FA: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  appearance: string;
  theme: string;
  language: string;
  deleteAccount: string;
  deleteWarning: string;
  back: string;
  saveChanges: string;
  dashboard: string;
  profile: string;
  projects: string;
  messages: string;
  analytics: string;
  settings: string; 
  logout: string;
  applyProjects: string;
  jobListings: string;
  createProject: string;
  hireFreelancers: string;
  manageJobs: string;
};

const translations: Record<string, TranslationKeys> = {
  en: {
    title: "Account Settings",
    notifications: "Notification Preferences",
    enableNotifications: "Enable Notifications",
    security: "Security Settings",
    enable2FA: "Enable Two-Factor Authentication",
    changePassword: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    appearance: "Appearance & Language",
    theme: "Theme",
    language: "Language",
    deleteAccount: "Delete Account",
    deleteWarning: "Deleting your account will remove all your data permanently. This action cannot be undone.",
    back: "Back",
    saveChanges: "Save Changes",
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
    title: "Hesap Ayarları",
    notifications: "Bildirim Tercihleri",
    enableNotifications: "Bildirimleri Etkinleştir",
    security: "Güvenlik Ayarları",
    enable2FA: "İki Faktörlü Kimlik Doğrulamayı Etkinleştir",
    changePassword: "Şifre Değiştir",
    currentPassword: "Mevcut Şifre",
    newPassword: "Yeni Şifre",
    confirmPassword: "Yeni Şifreyi Onayla",
    appearance: "Görünüm & Dil",
    theme: "Tema",
    language: "Dil",
    deleteAccount: "Hesabı Sil",
    deleteWarning: "Hesabınızı silmek, tüm verilerinizi kalıcı olarak kaldıracaktır. Bu işlem geri alınamaz.",
    back: "Geri",
    saveChanges: "Değişiklikleri Kaydet",
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
    title: "Hesab Tənzimləmələri",
    notifications: "Bildiriş Nizamlamaları",
    enableNotifications: "Bildirişləri Aktivləşdir",
    security: "Təhlükəsizlik Tənzimləmələri",
    enable2FA: "İki Mərhələli Doğrulamayı Aktivləşdir",
    changePassword: "Şifrəni Dəyiş",
    currentPassword: "Mövcud Şifrə",
    newPassword: "Yeni Şifrə",
    confirmPassword: "Yeni Şifrəni Təsdiqlə",
    appearance: "Görünüş & Dil",
    theme: "Mövzu",
    language: "Dil",
    deleteAccount: "Hesabı Sil",
    deleteWarning: "Hesabınızı silmək, bütün məlumatlarınızı qalıcı olaraq siləcək. Bu əməliyyat geri qaytarıla bilməz.",
    back: "Geri",
    saveChanges: "Dəyişiklikləri Yadda Saxla",
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

const SettingsPage = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<"en" | "tr" | "az">("en");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState("user");

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    const savedUserRole = localStorage.getItem("userRole");
    setUserRole(savedUserRole || "user");
    document.body.className = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
    localStorage.setItem("language", language);
  }, [theme, language]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const response = await fetch("https://localhost:3002/api/settings/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notificationsEnabled,
          twoFactorEnabled,
          theme,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      setError(null);
      setSuccess(t.saveChanges);
    } catch (err) {
      console.error("Error updating settings", err);
      setError("An error occurred while updating settings.");
    }
  };

  const fetchSettingsData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const response = await fetch("https://localhost:3002/api/settings/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      setNotificationsEnabled(data.notificationsEnabled);
      setTwoFactorEnabled(data.twoFactorEnabled);
      setTheme(data.theme);
      setLanguage(data.language);
      localStorage.setItem("theme", data.theme);
      localStorage.setItem("language", data.language);
    } catch (err) {
      console.error("Error fetching profile data", err);
      setError("An error occurred while fetching profile data.");
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const response = await fetch("https://localhost:3002/api/settings/changePassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to change password");
        return;
      }

      setError(null);
      setSuccess("Password changed successfully!");
    } catch (err) {
      console.error("Error changing password", err);
      setError("An error occurred while changing password.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm(t.deleteWarning)) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token is missing");
          return;
        }

        const response = await fetch("https://localhost:3002/api/settings/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete account");
        }

        localStorage.removeItem("token");
        router.push("/pages/auth/login");
      } catch (err) {
        console.error("Error deleting account", err);
        setError("An error occurred while deleting account.");
      }
    }
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
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" // Hide on large screens when sidebar is permanent
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
          setLanguage={(newLanguage: string) => {
            setLanguage(newLanguage as "en" | "tr" | "az");
            localStorage.setItem("language", newLanguage);
          }}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`w-full max-w-4xl mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 space-y-6`}
          >
            <h1 className={`text-3xl md:text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"} mb-6`}>
              {t.title}
            </h1>
            
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-center font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-center font-medium">
                {success}
              </div>
            )}
  
            <div className="space-y-5">
              {/* Notification Settings */}
              <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} shadow-sm`}>
                <h2 className={`text-xl font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  {t.notifications}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <label className={`flex-1 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {t.enableNotifications}
                    </label>
                   
                  </div>
                </div>
              </div>
  
              {/* Security Settings */}
              <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} shadow-sm`}>
                <h2 className={`text-xl font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  {t.security}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <label className={`flex-1 text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {t.enable2FA}
                    </label>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                    <h3 className={`text-sm font-medium mb-3 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {t.changePassword}
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={t.currentPassword}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={t.newPassword}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={t.confirmPassword}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"}`}
                      />
                      <button
                        onClick={handleChangePassword}
                        className="w-full md:w-auto mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
                      >
                        {t.changePassword}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Appearance and Language Settings */}
              <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} shadow-sm`}>
                <h2 className={`text-xl font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  {t.appearance}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {t.theme}
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as "light" | "dark")}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                      {t.language}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "en" | "tr" | "az")}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                    >
                      <option value="en">English</option>
                      <option value="tr">Türkçe</option>
                      <option value="az">Azərbaycan</option>
                    </select>
                  </div>
                </div>
              </div>
  
              {/* Account Deletion */}
              <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} shadow-sm`}>
                <h2 className={`text-xl font-semibold mb-3 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                  {t.deleteAccount}
                </h2>
                <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {t.deleteWarning}
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md"
                >
                  {t.deleteAccount}
                </button>
              </div>
            </div>
  
            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-6">
              <button
                onClick={() => router.push("/pages/dashboard/main")}
                className="w-full md:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md"
              >
                {t.back}
              </button>
              <button
                onClick={handleSave}
                className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md"
              >
                {t.saveChanges}
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
