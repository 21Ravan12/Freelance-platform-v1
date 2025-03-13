"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    myProjects: "My Projects",
    statusCompleted: "Completed",
    statusInProgress: "In Progress",
    back: "Back",
    deadline: "Deadline",
  },
  tr: {
    myProjects: "Projelerim",
    statusCompleted: "Tamamlandı",
    statusInProgress: "Devam Ediyor",
    back: "Geri",
    deadline: "Son Tarih",
  },
  az: {
    myProjects: "Layihələrim",
    statusCompleted: "Tamamlandı",
    statusInProgress: "Davam Edir",
    back: "Geri",
    deadline: "Son Tarix",
  },
};

interface Project {
  _id: string;
  title: string;
  description: string;
  status: "Completed" | "In Progress";
  deadline: string;
}

const ProjectsPage = () => {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"freelancer" | "employer">("freelancer");
  const [loading, setLoading] = useState(true);

  const t = translations[language];

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

  // userRole değiştiğinde fetchProjects'i çağır
  useEffect(() => {
    if (userRole) {
      fetchProjects();
    }
  }, [userRole]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const endpoint = userRole === "freelancer" 
        ? "https://localhost:3002/api/ongoingProjects/freelancer"
        : "https://localhost:3002/api/ongoingProjects/employer";

      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch projects");
      }

      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching projects.");
      } else {
        setError("An error occurred while fetching projects.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const response = await fetch("https://localhost:3002/api/profile/get", {
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
      setUserRole(data.userType); // userRole güncelleniyor
    } catch (err) {
      console.error("Error fetching profile data", err);
      setError("An error occurred while fetching profile data.");
    }
  };

  const handleViewDetails = (projectId: string) => {
    router.push(`/pages/dashboard/projects/${projectId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // Tarixi daha oxunaqlı formata çevir
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`w-full max-w-6xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}
      >
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.myProjects}
        </h1>
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* Project List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <motion.div
              key={project._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer`}
              onClick={() => handleViewDetails(project._id)}
            >
              <h3 className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {project.title}
              </h3>
              <p className={`mt-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"} line-clamp-1`}>
                {project.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    project.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : project.status === "In Progress"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {project.status === "Completed" ? t.statusCompleted : t.statusInProgress}
                </span>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {t.deadline}: {formatDate(project.deadline)}    
                </p>
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

export default ProjectsPage;