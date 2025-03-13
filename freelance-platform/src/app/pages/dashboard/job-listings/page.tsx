"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
  },
};

const JobListingsPage = () => {
  const router = useRouter();
  interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    requiredTechnologies: string[];
    salary: {
      amount: number;
      currency: string;
    };    
    description: string;
    postedDate: string;
    hasApplied: boolean; 
  }

  const [jobListings, setJobListings] = useState<Job[]>([]);
  const [filters, setFilters] = useState({
    location: "",
    type: "",
    salaryRange: "",
  });
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

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
      console.log(data);
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
      const jobsWithStringIds = data.map((job: { _id: any; [key: string]: any }) => ({
        ...job,
        _id: job._id.toString(),
      }));

      const jobsWithApplicationStatus = await Promise.all(
        jobsWithStringIds.map(async (job: { _id: any; [key: string]: any }) => {
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

  const handleApply = (jobId: string) => {
    router.push(`/pages/dashboard/job-listings/${jobId}/apply`);
  };

  const filteredJobs = jobListings.filter((job) => {
    return (
      (filters.location === "" ||
        job.location.toLowerCase().includes(filters.location.toLowerCase())) &&
      (filters.salaryRange === "" ||
        (job.salary.amount >=
          parseInt(filters.salaryRange.split("-")[0]) &&
        job.salary.amount <=
          parseInt(filters.salaryRange.split("-")[1]))
    )
  )});

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
                {t.location}
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder={t.location}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.jobType}
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters({ ...filters, type: e.target.value })
                }
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
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
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.salaryRange}
              </label>
              <select
                value={filters.salaryRange}
                onChange={(e) =>
                  setFilters({ ...filters, salaryRange: e.target.value })
                }
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
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

{/* İş İlanları Listesi */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredJobs.map((job) => (
    <motion.div
      key={job._id}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${theme === "dark" ? "bg-gray-700" : "bg-white"} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex flex-col`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          👜 {job.title}
        </h3>
      </div>

      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{job.company}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-lg">🌍</span>
          <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{job.location}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            {job.salary.amount} {job.salary.currency} 
          </p>
        </div>

        <div className="mt-3">
          <p className={`flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            <span className="text-lg">📝</span>
            <span className="line-clamp-3">{job.description}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center">
        <p className={`text-sm flex items-center gap-2 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          📅 {new Date(job.postedDate).toLocaleDateString(language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          </p>
          {job.hasApplied ? (
            <div className="px-4 py-2 bg-green-500/20 text-green-600 rounded-full flex items-center gap-2">
               <span className="text-sm">{t.applied}</span>
            </div>
          ) : (
            <button
              onClick={() => handleApply(job._id)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
            >
               {t.applyNow}
            </button>
          )}
        </div>
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

export default JobListingsPage;