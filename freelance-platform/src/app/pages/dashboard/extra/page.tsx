"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    title: "Extra Features",
    fileUpload: "File Upload",
    customSettings: "Custom Settings",
    enableCustomSetting: "Enable Custom Setting",
    notificationPreferences: "Notification Preferences",
    notificationMethod: "Notification Method",
    email: "Email",
    sms: "SMS",
    push: "Push Notification",
    saveSettings: "Save Settings",
    successMessage: "Settings saved successfully!",
  },
  tr: {
    title: "Ekstra Özellikler",
    fileUpload: "Dosya Yükleme",
    customSettings: "Özel Ayarlar",
    enableCustomSetting: "Özel Ayarı Etkinleştir",
    notificationPreferences: "Bildirim Tercihleri",
    notificationMethod: "Bildirim Yöntemi",
    email: "E-posta",
    sms: "SMS",
    push: "Push Bildirimi",
    saveSettings: "Ayarları Kaydet",
    successMessage: "Ayarlar başarıyla kaydedildi!",
  },
  az: {
    title: "Əlavə Xüsusiyyətlər",
    fileUpload: "Fayl Yükləmə",
    customSettings: "Xüsusi Parametrlər",
    enableCustomSetting: "Xüsusi Parametri Aktivləşdir",
    notificationPreferences: "Bildiriş Nizamlamaları",
    notificationMethod: "Bildiriş Metodu",
    email: "E-poçt",
    sms: "SMS",
    push: "Push Bildiriş",
    saveSettings: "Parametrləri Saxla",
    successMessage: "Parametrlər uğurla saxlanıldı!",
  },
};

const ExtraPage = () => {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState("light");
  const [notificationPreference, setNotificationPreference] = useState("email");
  const [customSetting, setCustomSetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }
      setUploadedFile(file);
      setError(null);
    } else {
      setError("Please select a file to upload.");
    }
  };

  const handleSaveSettings = async () => {
    if (!uploadedFile) {
      setError("Please upload a file before saving settings.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const formData = new FormData();
      formData.append("file", uploadedFile);
      formData.append("customSetting", customSetting.toString());
      formData.append("notificationPreference", notificationPreference);

      const response = await fetch("https://localhost:3002/api/extra/save-settings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setError(null);
      setSuccess(t.successMessage);
    } catch (err) {
      console.error("Error saving settings", err);
      setError("An error occurred while saving settings.");
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

        {/* Dosya Yükleme */}
        <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.fileUpload}
          </h2>
          <div className="space-y-4">
            <input
              type="file"
              onChange={handleFileUpload}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
            />
            {uploadedFile && (
              <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                Uploaded File: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </div>

        {/* Özel Ayarlar */}
        <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.customSettings}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.enableCustomSetting}
              </label>
              <input
                type="checkbox"
                checked={customSetting}
                onChange={(e) => setCustomSetting(e.target.checked)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bildirim Tercihleri */}
        <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.notificationPreferences}
          </h2>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.notificationMethod}
              </label>
              <select
                value={notificationPreference}
                onChange={(e) => setNotificationPreference(e.target.value)}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                <option value="email">{t.email}</option>
                <option value="sms">{t.sms}</option>
                <option value="push">{t.push}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kaydet Butonu */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.saveSettings}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ExtraPage;