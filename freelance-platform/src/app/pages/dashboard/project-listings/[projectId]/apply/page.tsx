"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    applyForProject: "🚀 Apply for Project",
    description: "📝 Description",
    resume: "📄 Resume",
    submitApplication: "✅ Submit Application",
    errorFillAllFields: "❌ Please fill in all fields.",
    projectDetails: "📋 Project Details",
    title: "📌 Title",
    company: "🏢 Company",
    requiredTechnologies: "🛠️ Required Technologies",
    payment: "💰 Payment",
    deadline: "⏳ For (days)",
    postedDate: "📅 Posted Date",
    back: "Back",
    projectDescription: "📄 Project Description",
  },
  tr: {
    applyForProject: "🚀 Proje Başvurusu",
    description: "📝 Açıklama",
    resume: "📄 Özgeçmiş",
    submitApplication: "✅ Başvuruyu Gönder",
    errorFillAllFields: "❌ Lütfen tüm alanları doldurun.",
    projectDetails: "📋 Proje Detayları",
    title: "📌 Başlık",
    company: "🏢 Şirket",
    requiredTechnologies: "🛠️ Gerekli Teknolojiler",
    payment: "💰 Ödeme",
    deadline: "⏳ Süre (gün)",
    postedDate: "📅 Yayınlanma Tarihi",
    back: "Geri",
    projectDescription: "📄 Proje Açıklaması",
  },
  az: {
    applyForProject: "🚀 Layihəyə Müraciət",
    description: "📝 Təsvir",
    resume: "📄 CV",
    submitApplication: "✅ Müraciəti Göndər",
    errorFillAllFields: "❌ Zəhmət olmasa bütün sahələri doldurun.",
    projectDetails: "📋 Layihə Detalları",
    title: "📌 Başlıq",
    company: "🏢 Şirkət",
    requiredTechnologies: "🛠️ Tələb Olunan Texnologiyalar",
    payment: "💰 Ödəniş",
    deadline: "⏳ Müddət (gün)",
    postedDate: "📅 Yayımlandı",
    back: "Geri",
    projectDescription: "📄 Layihə Təsviri",
  },
};

interface Project {
  _id: string;
  title: string;
  company: string;
  requiredTechnologies: string[];
  payment: {
    amount: number;
    currency: string;
  };  
  description: string;
  postedDate: string;
  deadline: number;
}

const ApplyProjectPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [description, setDescription] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchProjectDetails();
  }, []);

  const fetchProjectDetails = async () => {
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
        throw new Error(errorData.message || "Failed to fetch project details.");
      }

      const data = await response.json();
      setProject(data);
    } catch (err) {
      console.error("Error fetching project details:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching project details.");
      } else {
        setError("An error occurred while fetching project details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleApply = async () => {
    if (!description || !resume) {
      setError(t.errorFillAllFields);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const resumeBase64 = await fileToBase64(resume);

      const response = await fetch('https://localhost:3002/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "project",
          description,
          projectId,
          resume: resumeBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      alert(result.message);
      router.push("/pages/dashboard/project-listings");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Project not found.</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <div className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}>
        {/* Başvuru Başlığı (Küçük ve Şık) */}
        <h2 className={`text-2xl font-semibold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.applyForProject}
        </h2>

        {/* Proje Detayları */}
        <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-6 rounded-xl shadow-inner`}>
          <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-4`}>
            {t.projectDetails}
          </h3>
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.title}
              </label>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>{project.title}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.company}
              </label>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>{project.company}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.requiredTechnologies}
              </label>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>
                {project.requiredTechnologies.join(", ")}
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.projectDescription}
              </label>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>{project.description}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.payment}
              </label>
              <p className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"} line-clamp-1`}> {project.payment.amount} {project.payment.currency}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.deadline}
              </label>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>{project.deadline}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.postedDate}
              </label>
              <p className={`mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-900"}`}>{project.postedDate}</p>
            </div>
          </div>
        </div>

        {/* Başvuru Formu */}
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              rows={4}
              placeholder={language === 'en' ? "Enter your description..." : "Açıklamanızı girin..."}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.resume}
            </label>
            <input
              type="file"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

        {/* Başvuru Butonu */}

        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/pages/dashboard/project-listings")}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            {t.back}
          </button>
          <button
            onClick={handleApply}
            className=" px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.submitApplication}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyProjectPage;