"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    title: "Job Listings",
    filters: "Filters",
    location: "Location",
    jobType: "Job Type",
    salaryRange: "Salary Range",
    allTypes: "All Types",
    allSalaries: "All Salaries",
    fullTime: "Full-time",
    partTime: "Part-time",
    contract: "Contract",
    internship: "Internship",
    applyNow: "Apply Now",
    applied: "Applied",
    addJob: "Add Job",
    newJobTitle: "Job Title",
    newJobCompany: "Company",
    newJobLocation: "Location",
    newJobType: "Job Type",
    newJobSalary: "Salary",
    newJobDescription: "Description",
    postedOn: "Posted on",
    back: "Back",
    errorFillAllFields: "Please fill in all fields.",
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
    title: "İş İlanları",
    filters: "Filtreler",
    location: "Konum",
    jobType: "İş Türü",
    salaryRange: "Maaş Aralığı",
    allTypes: "Tüm Türler",
    allSalaries: "Tüm Maaşlar",
    fullTime: "Tam Zamanlı",
    partTime: "Yarı Zamanlı",
    contract: "Sözleşmeli",
    internship: "Staj",
    applyNow: "Başvur",
    applied: "Başvuruldu",
    addJob: "İş Ekle",
    newJobTitle: "İş Başlığı",
    newJobCompany: "Şirket",
    newJobLocation: "Konum",
    newJobType: "İş Türü",
    newJobSalary: "Maaş",
    newJobDescription: "Açıklama",
    postedOn: "Yayınlanma Tarihi",
    back: "Geri",
    errorFillAllFields: "Lütfen tüm alanları doldurun.",
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
    title: "Vakansiyalar",
    filters: "Filtrlər",
    location: "Məkan",
    jobType: "İş Növü",
    salaryRange: "Maaş Aralığı",
    allTypes: "Bütün Növlər",
    allSalaries: "Bütün Maaşlar",
    fullTime: "Tam Ştat",
    partTime: "Qismi Ştat",
    contract: "Müqavilə",
    internship: "Staj",
    applyNow: "Müraciət Et",
    applied: "Müraciət Edildi",
    addJob: "Vakansiya Əlavə Et",
    newJobTitle: "Vakansiya Başlığı",
    newJobCompany: "Şirkət",
    newJobLocation: "Məkan",
    newJobType: "İş Növü",
    newJobSalary: "Maaş",
    newJobDescription: "Təsvir",
    postedOn: "Yayımlandı",
    back: "Geri",
    errorFillAllFields: "Zəhmət olmasa bütün sahələri doldurun.",
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

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  requiredTechnologies: string[];
  salary: {
    amount: number;
    currency: string;
  };
  description: string;
  postedDate: string;
  hasApplied: boolean;
}

const JobListingsPage = () => {
  const router = useRouter();
  const [jobListings, setJobListings] = useState<Job[]>([]);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    salaryRange: "",
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

  const fetchApplicationData = async (jobId: string) => {
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
          type: "job",
          projectId: jobId,
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

  const fetchJobsData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch("https://localhost:3002/api/jobs", {
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

      const data = await response.json();
      const jobsWithStringIds = data.map((job: any) => ({
        ...job,
        _id: job._id.toString(),
      }));

      const jobsWithApplicationStatus = await Promise.all(
        jobsWithStringIds.map(async (job: any) => {
          const hasApplied = await fetchApplicationData(job._id);
          return { ...job, hasApplied };
        })
      );

      setJobListings(jobsWithApplicationStatus);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching jobs.");
      } else {
        setError("An error occurred while fetching jobs.");
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

  const handleApply = (jobId: string) => {
    router.push(`/pages/dashboard/job-listings/${jobId}/apply`);
  };

  const filteredJobs = jobListings.filter((job) => {
    const matchesLocation = filters.location === "" ||
      job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesType = filters.type === "" || job.type === filters.type;
    
    const matchesSalary = filters.salaryRange === "" || (
      job.salary.amount >= parseInt(filters.salaryRange.split("-")[0]) &&
      job.salary.amount <= parseInt(filters.salaryRange.split("-")[1])
    );

    return matchesLocation && matchesType && matchesSalary;
  });

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
            transition={{ duration: 0.5 }}
            className={`w-full max-w-7xl mx-auto ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-xl shadow-lg p-6 space-y-6`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className={`text-3xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.title}
              </h1>
              <button
                onClick={() => router.push("/pages/dashboard/main")}
                className={`px-4 py-2 rounded-lg transition-all ${
                  theme === "dark" 
                    ? "bg-gray-700 hover:bg-gray-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                {t.back}
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
              <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.filters}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t.location}
                  </label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder={t.location}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t.jobType}
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">{t.allTypes}</option>
                    <option value="Full-time">{t.fullTime}</option>
                    <option value="Part-time">{t.partTime}</option>
                    <option value="Contract">{t.contract}</option>
                    <option value="Internship">{t.internship}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                    {t.salaryRange}
                  </label>
                  <select
                    value={filters.salaryRange}
                    onChange={(e) => setFilters({ ...filters, salaryRange: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">{t.allSalaries}</option>
                    <option value="50000-70000">$50,000 - $70,000</option>
                    <option value="70000-90000">$70,000 - $90,000</option>
                    <option value="90000-110000">$90,000 - $110,000</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Listings */}
            {filteredJobs.length === 0 ? (
              <div className={`text-center py-12 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
                <p className={`text-lg ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  No jobs found matching your criteria
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
                        <div className="flex justify-between items-start mb-4">
                          <h3 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                            {job.title}
                          </h3>
                          {job.hasApplied && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              theme === "dark" 
                                ? "bg-green-900/30 text-green-300" 
                                : "bg-green-100 text-green-800"
                            }`}>
                              {t.applied}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              theme === "dark" ? "bg-gray-600" : "bg-gray-100"
                            }`}>
                              <span className="text-lg">🏢</span>
                            </div>
                            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{job.company}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              theme === "dark" ? "bg-gray-600" : "bg-gray-100"
                            }`}>
                              <span className="text-lg">📍</span>
                            </div>
                            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>{job.location}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              theme === "dark" ? "bg-gray-600" : "bg-gray-100"
                            }`}>
                              <span className="text-lg">💰</span>
                            </div>
                            <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                              {job.salary.amount.toLocaleString()} {job.salary.currency}
                            </p>
                          </div>

                          <div className="mt-4">
                            <p className={`line-clamp-3 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                              {job.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                            {t.postedOn}: {new Date(job.postedDate).toLocaleDateString(language)}
                          </p>
                          {!job.hasApplied && (
                            <button
                              onClick={() => handleApply(job._id)}
                              className={`px-4 py-2 rounded-lg transition-all ${
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

export default JobListingsPage;
