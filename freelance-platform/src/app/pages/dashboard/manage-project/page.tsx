"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    manageProjects: "📋 Manage Projects",
    filters: "🔍 Filters",
    searchProjects: "Search projects...",
    allStatuses: "🌐 All Statuses",
    open: "✅ Open",
    closed: "❌ Closed",
    applications: "Applications",
    postedOn: "📅 Posted on",
    edit: "✏️ Edit",
    delete: "🗑️ Delete",
    viewApplications: "👀 View Applications",
    addNewProject: "➕ Add New Project",
    company: "Company",
    requiredTechnologies: "Required Technologies",
    payment: "Payment",
    back: "⬅️ Back",
    deadline: "Deadline (days)",
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
    confirmDelete: "⚠️ Are you sure you want to delete this project?",
    deleteSuccess: "✅ Project deleted successfully!",
    unauthorized: "🔒 You are not authorized. Please log in.",
    fetchError: "❌ Error fetching projects",
    deleteError: "❌ Error deleting project"
  },
  tr: {
    manageProjects: "📋 Projeleri Yönet",
    filters: "🔍 Filtreler",
    searchProjects: "Proje ara...",
    allStatuses: "🌐 Tüm Durumlar",
    open: "✅ Açık",
    closed: "❌ Kapalı",
    applications: "Başvurular",
    postedOn: "📅 Yayınlanma Tarihi",
    edit: "✏️ Düzenle",
    delete: "🗑️ Sil",
    viewApplications: "👀 Başvuruları Görüntüle",
    addNewProject: "➕ Yeni Proje Ekle",
    company: "Şirket",
    requiredTechnologies: "Gerekli Teknolojiler",
    payment: "Ödeme",
    back: "⬅️ Geri",
    deadline: "Süre (gün)",
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
    confirmDelete: "⚠️ Bu projeyi silmek istediğinizden emin misiniz?",
    deleteSuccess: "✅ Proje başarıyla silindi!",
    unauthorized: "🔒 Yetkiniz yok. Lütfen giriş yapın.",
    fetchError: "❌ Projeler alınırken hata oluştu",
    deleteError: "❌ Proje silinirken hata oluştu"
  },
  az: {
    manageProjects: "📋 Layihələri İdarə Et",
    filters: "🔍 Filtrlər",
    searchProjects: "Layihə axtar...",
    allStatuses: "🌐 Bütün Statuslar",
    open: "✅ Açıq",
    closed: "❌ Bağlı",
    applications: "Müraciətlər",
    postedOn: "📅 Yayımlandı",
    edit: "✏️ Redaktə Et",
    delete: "🗑️ Sil",
    viewApplications: "👀 Müraciətlərə Bax",
    addNewProject: "➕ Yeni Layihə Əlavə Et",
    company: "Şirkət",
    requiredTechnologies: "Tələb Olunan Texnologiyalar",
    payment: "Ödəniş",
    back: "⬅️ Geri",
    deadline: "Müddət (gün)",
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
    confirmDelete: "⚠️ Bu layihəni silmək istədiyinizə əminsiniz?",
    deleteSuccess: "✅ Layihə uğurla silindi!",
    unauthorized: "🔒 Sizin icazəniz yoxdur. Zəhmət olmasa daxil olun.",
    fetchError: "❌ Layihələr alınarkən xəta baş verdi",
    deleteError: "❌ Layihə silinərkən xəta baş verdi"
  }
};

interface Project {
  _id: string;
  title: string;
  description: string;
  company: string;
  requiredTechnologies: string[];
  payment: {
    amount: number;
    currency: string;
  };
  status: "open" | "closed";
  applications: number;
  postedDate: string;
  deadline: number;
}

const ManageProjectsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState<"freelancer" | "employer">("employer");

  const t = translations[language];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  };

  const fetchProjectsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.unauthorized);
        return;
      }

      const response = await fetch("https://localhost:3002/api/projects/yours", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.fetchError);
      }

      const data: Project[] = await response.json();
      setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      if (err instanceof Error) {
        setError(err.message || t.fetchError);
      } else {
        setError(t.fetchError);
      }
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme as "light" | "dark");
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

  const handleEditProject = (projectId: string) => {
    router.push(`/pages/dashboard/manage-project/${projectId}/edit`);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.unauthorized);
        return;
      }

      const response = await fetch(`https://localhost:3002/api/projects/${projectId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.deleteError);
      }

      alert(t.deleteSuccess);
      fetchProjectsData();
    } catch (err) {
      console.error("Error deleting project:", err);
      if (err instanceof Error) {
        setError(err.message || t.deleteError);
      } else {
        setError(t.deleteError);
      }
    }
  };

  const handleViewApplications = (projectId: string) => {
    router.push(`/pages/dashboard/manage-project/${projectId}/applications`);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.requiredTechnologies.some(tech => 
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus = selectedStatus === "all" || project.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.manageProjects}...
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
          toggleTheme={toggleTheme}
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
                {t.manageProjects}
              </h1>
              <button
                onClick={() => router.push("/pages/dashboard/manage-project/new")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  theme === "dark" 
                    ? "bg-blue-600 hover:bg-blue-500 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {t.addNewProject}
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
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t.searchProjects}
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchProjects}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="all">{t.allStatuses}</option>
                    <option value="open">{t.open}</option>
                    <option value="closed">{t.closed}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Projects List */}
            {filteredProjects.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  No projects found matching your criteria
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
                        {/* Status Badge */}
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                            project.status === "open"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {project.status === "open" ? t.open : t.closed}
                        </span>

                        {/* Project Title */}
                        <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {project.title}
                        </h3>

                        {/* Project Details */}
                        <div className="space-y-3 mb-4">
                          <DetailRow emoji="🏢" text={`${t.company}: ${project.company}`} theme={theme} />
                          <DetailRow 
                            emoji="🛠️" 
                            text={`${t.requiredTechnologies}: ${project.requiredTechnologies.join(", ")}`} 
                            theme={theme} 
                          />
                          <DetailRow
                            emoji="💰"
                            text={`${t.payment}: ${project.payment.amount.toLocaleString()} ${project.payment.currency}`}
                            theme={theme}
                          />
                          <DetailRow
                            emoji="⏳"
                            text={`${t.deadline}: ${project.deadline}`}
                            theme={theme}
                          />
                          <DetailRow
                            emoji="👥"
                            text={`${t.applications}: ${project.applications}`}
                            theme={theme}
                          />
                        </div>

                        {/* Description */}
                        <p className={`mt-2 line-clamp-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {project.description}
                        </p>
                      </div>

                      {/* Posted Date */}
                      <p className={`mt-4 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        {t.postedOn}: {new Date(project.postedDate).toLocaleDateString(language)}
                      </p>

                      {/* Action Buttons */}
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleEditProject(project._id)}
                          disabled={project.status !== "open"}
                          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 text-sm ${
                            project.status !== "open"
                              ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
                              : theme === "dark"
                                ? "bg-blue-600 hover:bg-blue-500 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project._id)}
                          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 text-sm ${
                            theme === "dark"
                              ? "bg-red-600 hover:bg-red-500 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          {t.delete}
                        </button>
                        <button
                          onClick={() => handleViewApplications(project._id)}
                          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 text-sm ${
                            theme === "dark"
                              ? "bg-green-600 hover:bg-green-500 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          {t.viewApplications}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Back Button */}
            <div className="flex justify-start">
              <button
                onClick={() => router.push("/pages/dashboard/main")}
                className={`px-6 py-2 rounded-lg transition-all ${
                  theme === "dark" 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {t.back}
              </button>
            </div>
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
}

const DetailRow: React.FC<DetailRowProps> = ({ emoji, text, theme }) => (
  <div className="flex items-start gap-2">
    <span>{emoji}</span>
    <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
      {text}
    </span>
  </div>
);

export default ManageProjectsPage;
