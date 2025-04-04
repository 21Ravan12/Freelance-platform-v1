"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    myProjects: "My Projects",
    statusCompleted: "Completed",
    statusInProgress: "In Progress",
    back: "Back",
    deadline: "Deadline",
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
    myProjects: "Projelerim",
    statusCompleted: "Tamamlandı",
    statusInProgress: "Devam Ediyor",
    back: "Geri",
    deadline: "Son Tarih",
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
    myProjects: "Layihələrim",
    statusCompleted: "Tamamlandı",
    statusInProgress: "Davam Edir",
    back: "Geri",
    deadline: "Son Tarix",
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"freelancer" | "employer">("freelancer");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const t = translations[language];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("theme") === "dark" || localStorage.getItem("theme") === "light") 
      ? localStorage.getItem("theme") as "light" | "dark" 
      : "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

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
      setUserRole(data.userType);
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
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
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
          setLanguage={(newLanguage: Language) => {
            setLanguage(newLanguage);
            localStorage.setItem("language", newLanguage);
          }}
        />
  
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`w-full max-w-7xl mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg p-6 md:p-8 space-y-8`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className={`text-3xl md:text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.myProjects}
              </h1>
              <button
                onClick={() => router.push("/pages/dashboard/main")}
                className={`px-5 py-2 rounded-lg transition-all shadow-md ${
                  theme === "dark" 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {t.back}
              </button>
            </div>
  
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p className="font-medium">{error}</p>
              </div>
            )}
  
            {projects.length === 0 && !loading ? (
              <div className={`text-center py-12 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                <p className="text-lg">No projects found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <motion.div
                    key={project._id}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-50"} 
                      p-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border ${
                        theme === "dark" ? "border-gray-600" : "border-gray-200"
                      }`}
                    onClick={() => handleViewDetails(project._id)}
                  >
                    <div className="flex flex-col h-full">
                      <h3 className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                        {project.title}
                      </h3>
                      <p className={`mb-4 flex-grow ${theme === "dark" ? "text-gray-300" : "text-gray-600"} line-clamp-2`}>
                        {project.description}
                      </p>
                      <div className="mt-auto pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              project.status === "Completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            }`}
                          >
                            {project.status === "Completed" ? t.statusCompleted : t.statusInProgress}
                          </span>
                          <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            <span className="font-medium">{t.deadline}:</span> {formatDate(project.deadline)}
                          </p>
                        </div>
                      </div>
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

export default ProjectsPage;
