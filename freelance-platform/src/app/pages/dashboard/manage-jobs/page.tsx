"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    manageJobs: "Manage Jobs",
    filters: "🔍 Filters",
    searchJobs: "Search jobs...",
    allStatuses: "🌐 All Statuses",
    open: "✅ Open",
    closed: "❌ Closed",
    applications: "Applications",
    postedOn: "📅 Posted on",
    edit: "✏️ Edit",
    delete: "🗑️ Delete",
    viewApplications: "👀 View Applications",
    addNewJob: "➕ Add New Job",
    company: "Company",
    location: "Location",
    type: "📌 Type",
    back: "⬅️ Back",
    salary: "Salary",
    requiredTechnologies: "Required Technologies",
    payment: "💰 Payment",
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
    confirmDelete: "⚠️ Are you sure you want to delete this job?",
    deleteSuccess: "✅ Job deleted successfully!",
    unauthorized: "🔒 You are not authorized. Please log in.",
    fetchError: "❌ Error loading jobs",
    noJobsFound: "🔍 No jobs found matching your criteria"
  },
  tr: {
    manageJobs: "İşleri Yönet",
    filters: "🔍 Filtreler",
    searchJobs: "İş ara...",
    allStatuses: "🌐 Tüm Durumlar",
    open: "✅ Açık",
    closed: "❌ Kapalı",
    applications: "Başvurular",
    postedOn: "📅 Yayınlanma Tarihi",
    edit: "✏️ Düzenle",
    delete: "🗑️ Sil",
    viewApplications: "👀 Başvuruları Görüntüle",
    addNewJob: "➕ Yeni İş Ekle",
    company: "Şirket",
    location: "Konum",
    type: "📌 Tür",
    back: "⬅️ Geri",
    salary: "Maaş",
    requiredTechnologies: "Gerekli Teknolojiler",
    payment: "💰 Maaş",
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
    confirmDelete: "⚠️ Bu işi silmek istediğinizden emin misiniz?",
    deleteSuccess: "✅ İş başarıyla silindi!",
    unauthorized: "🔒 Yetkiniz yok. Lütfen giriş yapın.",
    fetchError: "❌ İşler yüklenirken hata oluştu",
    noJobsFound: "🔍 Filtrelerinizle eşleşen iş bulunamadı"
  },
  az: {
    manageJobs: "İşləri İdarə Et",
    filters: "🔍 Filtrlər",
    searchJobs: "İş axtar...",
    allStatuses: "🌐 Bütün Statuslar",
    open: "✅ Açıq",
    closed: "❌ Bağlı",
    applications: "Müraciətlər",
    postedOn: "📅 Yayımlandı",
    edit: "✏️ Redaktə Et",
    delete: "🗑️ Sil",
    viewApplications: "👀 Müraciətlərə Bax",
    addNewJob: "➕ Yeni İş Əlavə Et",
    company: "Şirkət",
    location: "Yerləşmə",
    type: "📌 Növ",
    back: "⬅️ Geri",
    salary: "Maaş",
    requiredTechnologies: "Tələb olunan Texnologiyalar",
    payment: "💰 Maaş",
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
    confirmDelete: "⚠️ Bu işi silmək istədiyinizə əminsiniz?",
    deleteSuccess: "✅ İş uğurla silindi!",
    unauthorized: "🔒 Sizin icazəniz yoxdur. Zəhmət olmasa daxil olun.",
    fetchError: "❌ İşlər yüklənərkən xəta baş verdi",
    noJobsFound: "🔍 Seçdiyiniz filtrlərə uyğun iş tapılmadı"
  }
};

interface Job {
  _id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  requiredTechnologies: string[];
  salary: {
    amount: number;
    currency: string;
  };
  status: "open" | "closed";
  applications: number;
  postedDate: string;
}

const ManageJobsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userType, setUserType] = useState<"freelancer" | "employer">("employer");

  const t = translations[language];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.className = newTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  };

  const fetchJobsData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.unauthorized);
        return;
      }

      const response = await fetch("https://localhost:3002/api/jobs/yours", {
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

      const data: Job[] = await response.json();
      setJobs(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err instanceof Error ? err.message : t.fetchError);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchJobsData();
  }, [fetchJobsData]);

  const handleEditJob = (jobId: string) => {
    router.push(`/pages/dashboard/manage-jobs/${jobId}/edit`);
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm(t.confirmDelete)) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError(t.unauthorized);
        return;
      }

      const response = await fetch(`https://localhost:3002/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t.fetchError);
      }

      alert(t.deleteSuccess);
      fetchJobsData();
    } catch (err) {
      console.error("Error deleting job:", err);
      setError(err instanceof Error ? err.message : t.fetchError);
    }
  };

  const handleViewApplications = (jobId: string) => {
    router.push(`/pages/dashboard/manage-jobs/${jobId}/applications`);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredTechnologies.some(tech => 
        tech.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {t.manageJobs}...
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
        userType={userType}
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
          userRole={userType}
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
                {t.manageJobs}
              </h1>
              <button
                onClick={() => router.push("/pages/dashboard/manage-jobs/new")}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  theme === "dark" 
                    ? "bg-blue-600 hover:bg-blue-500 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {t.addNewJob}
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
                    {t.searchJobs}
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchJobs}
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

            {/* Jobs List */}
            {filteredJobs.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                  {t.noJobsFound}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job._id}
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
                            job.status === "open"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {job.status === "open" ? t.open : t.closed}
                        </span>

                        {/* Job Title */}
                        <h3 className={`text-xl font-bold mb-3 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                          {job.title}
                        </h3>

                        {/* Job Details */}
                        <div className="space-y-3 mb-4">
                          <DetailRow emoji="🏢" text={`${t.company}: ${job.company}`} theme={theme} />
                          <DetailRow emoji="📍" text={`${t.location}: ${job.location}`} theme={theme} />
                          <DetailRow
                            emoji="💰"
                            text={`${t.salary}: ${job.salary.amount.toLocaleString()} ${job.salary.currency}`}
                            theme={theme}
                          />
                          <DetailRow
                            emoji="👥"
                            text={`${t.applications}: ${job.applications}`}
                            theme={theme}
                          />
                          <DetailRow
                            emoji="🛠️"
                            text={`${t.requiredTechnologies}:`}
                            theme={theme}
                          />
                          <div className="flex flex-wrap gap-2">
                            {job.requiredTechnologies.slice(0, 5).map((tech) => (
                              <span
                                key={tech}
                                className={`px-2 py-1 rounded-full text-xs ${
                                  theme === "dark" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {tech}
                              </span>
                            ))}
                            {job.requiredTechnologies.length > 5 && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                theme === "dark" 
                                  ? "bg-gray-600 text-gray-300" 
                                  : "bg-gray-200 text-gray-600"
                              }`}>
                                +{job.requiredTechnologies.length - 5}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`mt-2 line-clamp-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                          {job.description}
                        </p>
                      </div>

                      {/* Posted Date */}
                      <p className={`mt-4 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                        {t.postedOn}: {new Date(job.postedDate).toLocaleDateString(language)}
                      </p>

                      {/* Action Buttons */}
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditJob(job._id);
                          }}
                          disabled={job.status !== "open"}
                          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 text-sm ${
                            job.status !== "open"
                              ? "bg-gray-300 text-gray-500 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
                              : theme === "dark"
                                ? "bg-blue-600 hover:bg-blue-500 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job._id);
                          }}
                          className={`px-3 py-2 rounded-lg transition-all flex items-center justify-center gap-1 text-sm ${
                            theme === "dark"
                              ? "bg-red-600 hover:bg-red-500 text-white"
                              : "bg-red-500 hover:bg-red-600 text-white"
                          }`}
                        >
                          {t.delete}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewApplications(job._id);
                          }}
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

export default ManageJobsPage;
