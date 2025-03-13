"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    applicationsForJob: "Applications for Job",
    viewResume: "View Resume",
    backToJobs: "Back",
  },
  tr: {
    applicationsForJob: "İş Başvuruları",
    viewResume: "Özgeçmişi Görüntüle",
    backToJobs: "Geri",
  },
  az: {
    applicationsForJob: "İş üçün Müraciətlər",
    viewResume: "CV-ni Bax",
    backToJobs: "Geri",
  },
};

const JobApplicationsPage = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id;

  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  interface Application {
    _id: string;
    description: string;
    resume: string;
  }

  const [applications, setApplications] = useState<Application[]>([]);

  const t = translations[language];

  const fetchApplicationData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/applications/job/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data); 
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching applications.");
      } else {
        setError("An error occurred while fetching applications.");
      }
    }
  }, [jobId]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    fetchApplicationData(); 
  }, [fetchApplicationData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <div className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}>
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.applicationsForJob} #{jobId}
        </h1>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* Başvuru Listesi */}
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application._id} 
              className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-4 rounded-lg shadow-inner`}
            >
              <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {application.description}
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"} hover:underline`}>
                <a href={application.resume} target="_blank" rel="noopener noreferrer">
                  {t.viewResume}
                </a>
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/pages/dashboard/manage-jobs")}
          className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
        >
          {t.backToJobs}
        </button>
      </div>
    </div>
  );
};

export default JobApplicationsPage;