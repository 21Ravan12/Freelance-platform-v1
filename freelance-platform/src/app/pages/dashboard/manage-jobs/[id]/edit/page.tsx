"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    editJob: "Edit Job",
    jobTitle: "Job Title",
    jobDescription: "Job Description",
    location: "Location",
    type: "Type",
    salary: "Salary",
    updateJob: "Update Job",
    back: "Back",
    requiredTechnologies: "Required Technologies",
    salaryAmount: "Salary Amount",
    salaryCurrency: "Salary Currency",
    errorFillAllFields: "Please fill in all fields.",
  },
  tr: {
    editJob: "İşi Düzenle",
    jobTitle: "İş Başlığı",
    jobDescription: "İş Açıklaması",
    location: "Konum",
    type: "Tür",
    salary: "Maaş",
    updateJob: "İşi Güncelle",
    back: "Geri",
    requiredTechnologies: "Gerekli Teknolojiler",
    salaryAmount: "Maaş Miktarı",
    salaryCurrency: "Maaş Para Birimi",
    errorFillAllFields: "Lütfen tüm alanları doldurun.",
  },
  az: {
    editJob: "İşi Redaktə Et",
    jobTitle: "İş Başlığı",
    jobDescription: "İş Təsviri",
    location: "Məkan",
    type: "Növ",
    salary: "Maaş",
    updateJob: "İşi Yenilə",
    back: "Geri",
    requiredTechnologies: "Tələb olunan Texnologiyalar",
    salaryAmount: "Maaş Məbləği",
    salaryCurrency: "Maaş Valyutası",
    errorFillAllFields: "Zəhmət olmasa bütün sahələri doldurun.",
  },
};

const locationOptions = ["Baku","Ganja","Sumqayit","Mingachevir","Lankaran","Shirvan","Nakhchivan","Shaki","Yevlakh","Gabala","Zaqatala","Shusha","Khachmaz","Ismayilli","Balakan","Barda","Quba","Qusar","Shamakhi","Tartar",];
const typeOptions = ["Full-time", "Part-time", "Remote", "Contract"];

const EditJobPage = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [requiredTechnologies, setRequiredTechnologies] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");  
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  const fetchJobData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/jobs/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch job");
      }

      const data = await response.json();
      setTitle(data.title);
      setDescription(data.description);
      setLocation(data.location);
      setType(data.type);
      setRequiredTechnologies(data.requiredTechnologies);
      setSalaryAmount(data.salary.amount);
      setSalaryCurrency(data.salary.currency);
    } catch (err) {
      console.error("Error fetching job:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching the job.");
      } else {
        setError("An error occurred while fetching the job.");
      }
    }
  }, [jobId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchJobData();
  }, [fetchJobData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleUpdateJob = async () => {
    if (!title || !description || !location || !salaryAmount || !salaryCurrency) {
      setError(t.errorFillAllFields);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          salary: {
            amount: parseFloat(salaryAmount),
            currency: salaryCurrency, 
          },
          requiredTechnologies,
        }),      
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update job");
      }

      alert("Job updated successfully!");
      router.push("/pages/dashboard/manage-jobs");
    } catch (err) {
      console.error("Error updating job:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while updating the job.");
      } else {
        setError("An error occurred while updating the job.");
      }
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <div className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}>
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.editJob}
        </h1>
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.jobTitle}
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
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.jobDescription}
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
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.location}
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">Select a location</option>
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
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
              {t.salaryAmount}
            </label>
            <input
              type="number"
              value={salaryAmount}
              onChange={(e) => setSalaryAmount(e.target.value)}
              placeholder="e.g., 1000"
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>

          {/* Para Birimi */}
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.salaryCurrency}
            </label>
            <select
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
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

        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/pages/dashboard/manage-jobs")}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            {t.back}
          </button>
          <button
            onClick={handleUpdateJob}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.updateJob}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;