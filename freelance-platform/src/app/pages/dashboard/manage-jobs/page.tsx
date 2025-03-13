"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    manageJobs: "Manage Jobs",
    filters: "Filters",
    searchJobs: "Search jobs...",
    allStatuses: "All Statuses",
    open: "Open",
    closed: "Closed",
    applications: "Applications",
    postedOn: "Posted on",
    edit: "Edit",
    delete: "Delete",
    viewApplications: "View Applications",
    addNewJob: "Add New Job",
    company: "Company",
    location: "Location",
    type: "Type",
    back: "Back",
    salary: "Salary",
    requiredTechnologies: "Required Technologies",
    payment: "Salary",
  },
  tr: {
    manageJobs: "İşleri Yönet",
    filters: "Filtreler",
    searchJobs: "İş ara...",
    allStatuses: "Tüm Durumlar",
    open: "Açık",
    closed: "Kapalı",
    applications: "Başvurular",
    postedOn: "Yayınlanma Tarihi",
    edit: "Düzenle",
    delete: "Sil",
    viewApplications: "Başvuruları Görüntüle",
    addNewJob: "Yeni İş Ekle",
    company: "Şirket",
    location: "Konum",
    type: "Tür",
    back: "Geri",
    salary: "Maaş",
    requiredTechnologies: "Gerekli Teknolojiler",
    payment: "Maaş",
  },
  az: {
    manageJobs: "İşləri İdarə Et",
    filters: "Filtrlər",
    searchJobs: "İş axtar...",
    allStatuses: "Bütün Statuslar",
    open: "Açıq",
    closed: "Bağlı",
    applications: "Müraciətlər",
    postedOn: "Yayımlandı",
    edit: "Redaktə Et",
    delete: "Sil",
    viewApplications: "Müraciətlərə Bax",
    addNewJob: "Yeni İş Əlavə Et",
    company: "Şirkət",
    location: "Yerləşmə",
    type: "Növ",
    back: "Geri",
    salary: "Maaş",
    requiredTechnologies: "Tələb olunan Texnologiyalar",
    payment: "Maaş",
  },
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
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const t = translations[language];

  const fetchJobsData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
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
        throw new Error(errorData.message || "Failed to fetch jobs");
      }

      const data: Job[] = await response.json();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching jobs.");
      } else {
        setError("An error occurred while fetching jobs.");
      }
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchJobsData();
  }, [fetchJobsData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleEditJob = (jobId: string) => {
    router.push(`/pages/dashboard/manage-jobs/${jobId}/edit`);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
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
        throw new Error(errorData.message || "Failed to delete job");
      }

      alert(`Job ${jobId} deleted successfully!`);
      fetchJobsData();
    } catch (err) {
      console.error("Error deleting job:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while deleting the job.");
      } else {
        setError("An error occurred while deleting the job.");
      }
    }
  };

  const handleViewApplications = (jobId: string) => {
    router.push(`/pages/dashboard/manage-jobs/${jobId}/applications`);
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`w-full max-w-6xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}
      >
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.manageJobs}
        </h1>
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* Filtreleme ve Arama */}
        <div className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-6 rounded-xl shadow-inner`}>
          <h2 className={`text-2xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-4`}>
            {t.filters}
          </h2>
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchJobs}
              className={`px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">{t.allStatuses}</option>
              <option value="open">{t.open}</option>
              <option value="closed">{t.closed}</option>
            </select>
          </div>
        </div>

        {/* İş İlanları Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job) => (
            <motion.div
              key={job._id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`${theme === "dark" ? "bg-gray-800" : "bg-white"} p-6 rounded-3xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 relative border ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              {/* Durum Etiketi */}
              <span
                className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${
                  job.status === "open"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {job.status === "open" ? t.open : t.closed}
              </span>

              {/* Başlık */}
              <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"} mb-4`}>
                {job.title}
              </h3>

              {/* Şirket */}
              <div className="flex items-center space-x-2 mb-4">
                <span className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>🏢</span>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {t.company}: {job.company}
                </p>
              </div>

              {/* Gerekli Teknolojiler */}
              <div className="flex items-center space-x-2 mb-4">
                <span className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>🛠️</span>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {t.requiredTechnologies}: {job.requiredTechnologies.join(", ")}
                </p>
              </div>

              {/* Ödeme */}
              <div className="flex items-center space-x-2 mb-4">
                <span className={`text-lg ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>💰</span>
                <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                  {t.payment}: {job.salary.amount} {job.salary.currency}
                </p>
              </div>

              {/* Açıklama */}
              <p className={`mt-4 mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-700"} line-clamp-3`}>
               📄 {job.description}
              </p>

              {/* İlan Tarihi ve Başvuru Sayısı */}
              <div className="flex items-center justify-between mb-6">
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {t.postedOn}: {new Date(job.postedDate).toLocaleDateString()}
                </p>
                <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {t.applications}: {job.applications}
                </p>
              </div>

              {/* Butonlar */}
              <div className="flex flex-wrap gap-2">
                {job.status === "open" && (
                  <button
                    onClick={() => handleEditJob(job._id)}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center justify-center text-xs sm:text-sm font-medium min-w-[100px]"
                  >
                    <span className="mr-1">✏️</span>
                    {t.edit}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteJob(job._id)}
                  className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center text-xs sm:text-sm font-medium min-w-[100px]"
                >
                  <span className="mr-1">🗑️</span>
                  {t.delete}
                </button>
                <button
                  onClick={() => handleViewApplications(job._id)}
                  className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center justify-center text-xs sm:text-sm font-medium min-w-[100px]"
                >
                  <span className="mr-1">👥</span>
                  {t.viewApplications}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Butonlar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/pages/dashboard/main")}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            {t.back}
          </button>
          <button
            onClick={() => router.push("/pages/dashboard/manage-jobs/new")}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.addNewJob}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageJobsPage;