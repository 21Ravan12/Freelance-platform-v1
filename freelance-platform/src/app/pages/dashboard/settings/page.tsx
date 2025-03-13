"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  },
};

const SettingsPage = () => {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("en");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = translations[language as keyof typeof translations];

  useEffect(() => {
    document.body.className = theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    localStorage.setItem("language", language);
  }, [theme, language]);

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
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}
      >
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.title}
        </h1>
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}
        {success && (
          <p className="text-green-500 text-center font-medium">{success}</p>
        )}

        <div className="space-y-6">
          {/* Bildirim Ayarları */}
          <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              {t.notifications}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t.enableNotifications}
                </label>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Güvenlik Ayarları */}
          <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              {t.security}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t.enable2FA}
                </label>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t.changePassword}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder={t.currentPassword}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.newPassword}
                  className={`mt-2 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPassword}
                  className={`mt-2 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                />
                <button
                  onClick={handleChangePassword}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  {t.changePassword}
                </button>
              </div>
            </div>
          </div>

          {/* Tema ve Dil Ayarları */}
          <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              {t.appearance}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t.theme}
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  {t.language}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                  <option value="az">Azərbaycan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Hesap Silme */}
          <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              {t.deleteAccount}
            </h2>
            <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              {t.deleteWarning}
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg"
            >
              {t.deleteAccount}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
        <button
            onClick={() => router.push("/pages/dashboard/main")}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            {t.back}
        </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.saveChanges}
          </button>
        </div>

      </motion.div>
    </div>
  );
};

export default SettingsPage;