"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    title: "📋 Project Listings",
    filters: "🔍 Filters",
    requiredTechnologies: "🛠️ Required Technologies",
    payment: "💰 Payment",
    deadline: "For (days)",
    allTypes: "🌐 All Types",
    fullTime: "⏰ Full-time",
    partTime: "⏳ Part-time",
    contract: "📝 Contract",
    internship: "🎓 Internship",
    applyNow: "🚀 Apply Now",
    applied: "✅ Applied",
    addProject: "➕ Add Project",
    newProjectTitle: "📝 Project Title",
    newProjectCompany: "🏢 Company",
    newProjectType: "📂 Project Type",
    newProjectPayment: "💸 Payment",
    newProjectDescription: "📄 Description",
    postedOn: "Posted on",
    back: "Back",
    errorFillAllFields: "❌ Please fill in all fields.",
  },
  tr: {
    title: "📋 Proje İlanları",
    filters: "🔍 Filtreler",
    requiredTechnologies: "🛠️ Gerekli Teknolojiler",
    payment: "💰 Ödeme",
    deadline: "Süre (gün)",
    allTypes: "🌐 Tüm Türler",
    fullTime: "⏰ Tam Zamanlı",
    partTime: "⏳ Yarı Zamanlı",
    contract: "📝 Sözleşmeli",
    internship: "🎓 Staj",
    applyNow: "🚀 Başvur",
    applied: "✅ Başvuruldu",
    addProject: "➕ Proje Ekle",
    newProjectTitle: "📝 Proje Başlığı",
    newProjectCompany: "🏢 Şirket",
    newProjectType: "📂 Proje Türü",
    newProjectPayment: "💸 Ödeme",
    newProjectDescription: "📄 Açıklama",
    postedOn: "Yayınlanma Tarihi",
    back: "Geri",
    errorFillAllFields: "❌ Lütfen tüm alanları doldurun.",
  },
  az: {
    title: "📋 Layihə Elanları",
    filters: "🔍 Filtrlər",
    requiredTechnologies: "🛠️ Tələb Olunan Texnologiyalar",
    payment: "💰 Ödəniş",
    deadline: "Müddət (gün)",
    allTypes: "🌐 Bütün Növlər",
    fullTime: "⏰ Tam Ştat",
    partTime: "⏳ Qismi Ştat",
    contract: "📝 Müqaviləli",
    internship: "🎓 Təcrübə",
    applyNow: "🚀 Müraciət Et",
    applied: "✅ Müraciət Edildi",
    addProject: "➕ Layihə Əlavə Et",
    newProjectTitle: "📝 Layihə Başlığı",
    newProjectCompany: "🏢 Şirkət",
    newProjectType: "📂 Layihə Növü",
    newProjectPayment: "💸 Ödəniş",
    newProjectDescription: "📄 Təsvir",
    postedOn: "Yayımlandı",
    back: "Geri",
    errorFillAllFields: "❌ Zəhmət olmasa bütün sahələri doldurun.",
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
  hasApplied: boolean;
}

const ProjectListingsPage = () => {
  const router = useRouter();
  const [projectListings, setProjectListings] = useState<Project[]>([]);
  const [filters, setFilters] = useState({
    requiredTechnologies: "",
  });
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  const fetchProjectsData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ You are not authorized. Please log in.");
        return;
      }

      const response = await fetch("https://localhost:3002/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "❌ Failed to fetch projects");
      }

      const data = await response.json();
      const projectsWithStringIds = data.map((project: { _id: any; [key: string]: any }) => ({
        ...project,
        _id: project._id.toString(),
      }));

      const projectsWithApplicationStatus = await Promise.all(
        projectsWithStringIds.map(async (project: { _id: any; [key: string]: any }) => {
          const hasApplied = await fetchApplicationData(project._id);
          return { ...project, hasApplied };
        })
      );

      setProjectListings(projectsWithApplicationStatus);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
      if (err instanceof Error) {
        setError(err.message || "❌ An error occurred while fetching projects.");
      } else {
        setError("❌ An error occurred while fetching projects.");
      }
    }
  }, []);

  const fetchApplicationData = async (projectId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return false;
      }

      const response = await fetch(`https://localhost:3002/api/applications/checkIfApplied`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "project",
          projectId: projectId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch applications");
      }

      const data = await response.json();
      return data.hasApplied; 
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching applications.");
      } else {
        setError("An error occurred while fetching applications.");
      }
      return false;
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchProjectsData();
  }, [fetchProjectsData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleApply = (projectId: string) => {
    router.push(`/pages/dashboard/project-listings/${projectId}/apply`);
  };

  const filteredProjects = projectListings.filter((project) => {
    return (
      filters.requiredTechnologies === "" ||
      project.requiredTechnologies.some((tech) =>
        tech.toLowerCase().includes(filters.requiredTechnologies.toLowerCase())
      )
    );
  });

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full max-w-6xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}
      >
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.title}
        </h1>
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* Filtreleme Seçenekleri */}
        <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-6 rounded-xl shadow-inner`}>
          <h2 className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-4`}>
            {t.filters}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.requiredTechnologies}
              </label>
              <input
                type="text"
                value={filters.requiredTechnologies}
                onChange={(e) =>
                  setFilters({ ...filters, requiredTechnologies: e.target.value })
                }
                placeholder="Enter a technology"
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        </div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredProjects.map((project) => (
    <motion.div
      key={project._id}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-50"} p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out border ${
        theme === "dark" ? "border-gray-600" : "border-gray-100"
      }`}
    >
      <h3 className={`text-xl font-bold mb-4 ${
        theme === "dark" ? "text-blue-400" : "text-blue-600"
      }`}>
        {project.title}
      </h3>

      <div className="space-y-3">
        <DetailRow emoji="🏢" text={project.company} theme={theme} />
        <DetailRow 
          emoji="🛠️" 
          text={project.requiredTechnologies.join(", ")} 
          theme={theme} 
        />
        <DetailRow
          emoji="💰"
          text={`${project.payment.amount} ${project.payment.currency}`}
          theme={theme}
          highlight={true}
        />
        <DetailRow
          emoji="⏳"
          text={`${t.deadline}: ${project.deadline}`}
          theme={theme}
        />
      </div>

      <p className={`mt-4 text-sm ${
        theme === "dark" ? "text-gray-300" : "text-gray-600"
      } line-clamp-2 mb-4`}>
        {project.description}
      </p>

      <div className={`mt-4 pt-3 border-t ${
        theme === "dark" ? "border-gray-600" : "border-gray-200"
      }`}>
        <p className={`text-xs ${
          theme === "dark" ? "text-gray-400" : "text-gray-500"
        }`}>
          📅 {t.postedOn}: {project.postedDate}
        </p>

        {project.hasApplied ? (
          <div className="mt-3 px-4 py-2 bg-green-500/20 text-green-600 dark:text-green-400 rounded-md text-center text-sm">
            ✓ {t.applied}
          </div>
        ) : (
          <button
            onClick={() => handleApply(project._id)}
            className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md transition-all duration-200 text-sm font-medium shadow-sm"
          >
            {t.applyNow}
          </button>
        )}
      </div>
    </motion.div>
  ))}
</div>


        <button
            onClick={() => router.push("/pages/dashboard/main")}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            {t.back}
        </button>
      </motion.div>
    </div>
  );
};
interface DetailRowProps {
  emoji: string;
  text: string;
  theme: string;
  highlight?: boolean; 
}

const DetailRow: React.FC<DetailRowProps> = ({ 
  emoji, 
  text, 
  theme, 
  highlight = false 
}) => (
  <div className="flex items-start space-x-2">
    <span className="text-lg">{emoji}</span>
    <span className={`text-sm ${
      highlight 
        ? (theme === "dark" ? "text-green-400" : "text-green-600") 
        : (theme === "dark" ? "text-gray-300" : "text-gray-600")
    }`}>
      {text}
    </span>
  </div>
);

export default ProjectListingsPage;