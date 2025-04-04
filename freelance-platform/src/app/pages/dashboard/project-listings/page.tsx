"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    title: "📋 Project Listings",
    filters: "🔍 Filters",
    requiredTechnologies: "🛠️ Required Technologies",
    payment: "💰 Payment",
    deadline: "⏳ Duration (days)",
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
    postedOn: "📅 Posted on",
    back: "⬅️ Back",
    errorFillAllFields: "❌ Please fill in all fields.",
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
    title: "📋 Proje İlanları",
    filters: "🔍 Filtreler",
    requiredTechnologies: "🛠️ Gerekli Teknolojiler",
    payment: "💰 Ödeme",
    deadline: "⏳ Süre (gün)",
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
    postedOn: "📅 Yayınlanma Tarihi",
    back: "⬅️ Geri",
    errorFillAllFields: "❌ Lütfen tüm alanları doldurun.",
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
    title: "📋 Layihə Elanları",
    filters: "🔍 Filtrlər",
    requiredTechnologies: "🛠️ Tələb Olunan Texnologiyalar",
    payment: "💰 Ödəniş",
    deadline: "⏳ Müddət (gün)",
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
    postedOn: "📅 Yayımlandı",
    back: "⬅️ Geri",
    errorFillAllFields: "❌ Zəhmət olmasa bütün sahələri doldurun.",
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
  }
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
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<"freelancer" | "employer">("freelancer");

  const t = translations[language];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  const fetchApplicationData = async (projectId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("❌ You are not authorized. Please log in.");
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
      console.error("❌ Error fetching applications:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching applications.");
      } else {
        setError("An error occurred while fetching applications.");
      }
      return false;
    }
  };

  const fetchProjectsData = useCallback(async () => {
    try {
      setLoading(true);
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
      const projectsWithStringIds = data.map((project: any) => ({
        ...project,
        _id: project._id.toString(),
      }));

      const projectsWithApplicationStatus = await Promise.all(
        projectsWithStringIds.map(async (project: any) => {
          const hasApplied = await fetchApplicationData(project._id);
          return { ...project, hasApplied };
        })
      );

      setProjectListings(projectsWithApplicationStatus);
    } catch (err) {
      console.error("❌ Error fetching projects:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching projects.");
      } else {
        setError("An error occurred while fetching projects.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme === "dark" ? "dark" : "light");
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

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.loading}
          </p>
        </div>
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
            transition={{ duration: 0.5 }}
            className={`w-full max-w-7xl mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 space-y-6`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                {t.title}
              </h1>
              <button
                onClick={() => router.push("/pages/dashboard/main")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  theme === "dark" 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                <span>{t.back}</span>
              </button>
            </div>

            {error && (
              <div className={`p-4 rounded-lg ${
                theme === "dark" ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-800"
              }`}>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Filters Section */}
            <div className={`p-6 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.filters}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t.requiredTechnologies}
                  </label>
                  <input
                    type="text"
                    value={filters.requiredTechnologies}
                    onChange={(e) => setFilters({ ...filters, requiredTechnologies: e.target.value })}
                    placeholder="JavaScript, React, Node.js..."
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Project Listings */}
            {filteredProjects.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`text-lg flex items-center justify-center gap-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t.noProjectsFound}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    whileHover={{ y: -5 }}
                    className={`rounded-xl shadow-md overflow-hidden transition-all border ${
                      theme === "dark" 
                        ? "bg-gray-700 border-gray-600 hover:bg-gray-600" 
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="p-6 flex flex-col h-full">
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                            {project.title}
                          </h3>
                          {project.hasApplied && (
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                              theme === "dark" 
                                ? "bg-green-900/30 text-green-300" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {t.applied}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          <DetailRow emoji="🏢" text={project.company} theme={theme} />
                          <DetailRow 
                            emoji="🛠️" 
                            text={project.requiredTechnologies.join(", ")} 
                            theme={theme} 
                          />
                          <DetailRow
                            emoji="💰"
                            text={`${project.payment.amount.toLocaleString()} ${project.payment.currency}`}
                            theme={theme}
                            highlight={true}
                          />
                          <DetailRow
                            emoji="⏳"
                            text={`${t.deadline}: ${project.deadline}`}
                            theme={theme}
                          />
                        </div>

                        <p className={`mt-4 line-clamp-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {project.description}
                        </p>
                      </div>

                      <div className={`mt-6 pt-4 border-t ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}>
                        <div className="flex justify-between items-center">
                          <p className={`text-xs flex items-center gap-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {t.postedOn}: {new Date(project.postedDate).toLocaleDateString(language)}
                          </p>
                          {!project.hasApplied && (
                            <button
                              onClick={() => handleApply(project._id)}
                              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1 ${
                                theme === "dark" 
                                  ? "bg-blue-600 hover:bg-blue-500 text-white" 
                                  : "bg-blue-500 hover:bg-blue-600 text-white"
                              }`}
                            >
                              {t.applyNow}
                            </button>
                          )}
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
  <div className="flex items-start gap-3">
    <div className={`p-2 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-100"}`}>
      <span>{emoji}</span>
    </div>
    <span className={`text-sm ${highlight 
      ? (theme === "dark" ? "text-green-400" : "text-green-600") 
      : (theme === "dark" ? "text-gray-300" : "text-gray-600")}`}>
      {text}
    </span>
  </div>
);

export default ProjectListingsPage;
