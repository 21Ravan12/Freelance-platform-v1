"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    editProject: "Edit Project",
    projectTitle: "Project Title",
    projectDescription: "Project Description",
    requiredTechnologies: "Required Technologies", 
    paymentAmount: "Payment Amount", 
    paymentCurrency: "Currency", 
    deadline: "Deadline (days)", 
    updateProject: "Update Project",
    back: "Back",
    errorFillAllFields: "Please fill in all fields.",
  },
  tr: {
    editProject: "Projeyi Düzenle",
    projectTitle: "Proje Başlığı",
    projectDescription: "Proje Açıklaması",
    requiredTechnologies: "Gerekli Teknolojiler", 
    paymentAmount: "Ödeme Miktarı", 
    paymentCurrency: "Para Birimi", 
    deadline: "Süre (gün)", 
    updateProject: "Projeyi Güncelle",
    back: "Geri",
    errorFillAllFields: "Lütfen tüm alanları doldurun.",
  },
  az: {
    editProject: "Layihəni Redaktə Et",
    projectTitle: "Layihə Başlığı",
    projectDescription: "Layihə Təsviri",
    requiredTechnologies: "Tələb Olunan Texnologiyalar", 
    paymentAmount: "Ödəniş Məbləği", 
    paymentCurrency: "Valyuta", 
    deadline: "Müddət (gün)", 
    updateProject: "Layihəni Yenilə",
    back: "Geri",
    errorFillAllFields: "Zəhmət olmasa bütün sahələri doldurun.",
  },
};

const EditProjectPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredTechnologies, setRequiredTechnologies] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(""); // Ödeme miktarı
  const [paymentCurrency, setPaymentCurrency] = useState("USD"); // Para birimi (varsayılan: USD)
  const [deadline, setDeadline] = useState(""); // Proje süresi (gün)
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  const fetchProjectData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/projects/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch project");
      }

      const data = await response.json();
      setTitle(data.title);
      setDescription(data.description);
      setRequiredTechnologies(data.requiredTechnologies.join(", ")); // Diziyi string'e çevir
      setPaymentAmount(data.payment.amount.toString()); // Ödeme miktarı
      setPaymentCurrency(data.payment.currency); // Para birimi
      setDeadline(data.deadline.toString()); // Proje süresi
    } catch (err) {
      console.error("Error fetching project:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching the project.");
      } else {
        setError("An error occurred while fetching the project.");
      }
    }
  }, [projectId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchProjectData();
  }, [fetchProjectData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUpdateProject = async () => {
    if (!title || !description || !requiredTechnologies || !paymentAmount || !paymentCurrency || !deadline) {
      setError(t.errorFillAllFields);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          requiredTechnologies: requiredTechnologies.split(",").map(tech => tech.trim()), // String'i diziye çevir
          payment: {
            amount: parseFloat(paymentAmount), // Ödeme miktarı sayıya dönüştür
            currency: paymentCurrency, // Para birimi
          },
          deadline: parseInt(deadline), // Proje süresi sayıya dönüştür
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update project");
      }

      alert("Project updated successfully!");
      router.push("/pages/dashboard/manage-project");
    } catch (err) {
      console.error("Error updating project:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while updating the project.");
      } else {
        setError("An error occurred while updating the project.");
      }
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <div className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}>
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.editProject}
        </h1>
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        <div className="space-y-4">
          {/* Proje Başlığı */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.projectTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Proje Açıklaması */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.projectDescription}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              rows={4}
            />
          </div>

          {/* Gerekli Teknolojiler */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.requiredTechnologies}
            </label>
            <input
              type="text"
              value={requiredTechnologies}
              onChange={(e) => setRequiredTechnologies(e.target.value)}
              placeholder="e.g., React, Node.js, MongoDB"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Ödeme Miktarı */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.paymentAmount}
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="e.g., 1000"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Para Birimi */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.paymentCurrency}
            </label>
            <select
              value={paymentCurrency}
              onChange={(e) => setPaymentCurrency(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="TRY">TRY</option>
              <option value="AZN">AZN</option>
            </select>
          </div>

          {/* Proje Süresi */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.deadline}
            </label>
            <input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="e.g., 7 (for 7 days)"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/pages/dashboard/manage-project")}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            {t.back}
          </button>
          <button
            onClick={handleUpdateProject}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.updateProject}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProjectPage;