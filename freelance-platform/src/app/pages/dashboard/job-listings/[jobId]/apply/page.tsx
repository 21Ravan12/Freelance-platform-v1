"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    applyForJob: "Apply for Job",
    fullName: "Full Name",
    email: "Email",
    resume: "Resume",
    submitApplication: "Submit Application",
    back: "Back",
    errorFillAllFields: "Please fill in all fields.",
    jobDetails: "Job Details",
    jobTitle: "Job Title",
    company: "Company",
    location: "Location",
    jobType: "Job Type",
    salary: "Salary",
    description: "Description",
    requiredTechnologies: "Required Technologies",
    postedOn: "Posted on",
  },
  tr: {
    applyForJob: "İş Başvurusu",
    fullName: "Tam Adı",
    email: "E-posta",
    resume: "Özgeçmiş",
    submitApplication: "Başvuruyu Gönder",
    back: "Geri",
    errorFillAllFields: "Lütfen tüm alanları doldurun.",
    jobDetails: "İş Detayları",
    jobTitle: "İş Başlığı",
    company: "Şirket",
    location: "Konum",
    jobType: "İş Türü",
    salary: "Maaş",
    description: "Açıklama",
    requiredTechnologies: "Gerekli Teknolojiler",
    postedOn: "Yayınlanma Tarihi",
  },
  az: {
    applyForJob: "İşə Müraciət",
    fullName: "Tam Ad",
    email: "E-poçt",
    resume: "CV",
    submitApplication: "Müraciəti Göndər",
    back: "Geri",
    errorFillAllFields: "Zəhmət olmasa bütün sahələri doldurun.",
    jobDetails: "İş Detalları",
    jobTitle: "İş Başlığı",
    company: "Şirkət",
    location: "Məkan",
    jobType: "İş Növü",
    salary: "Maaş",
    description: "Təsvir",
    requiredTechnologies: "Tələb olunan Texnologiyalar",
    postedOn: "Yayımlandı",
  },
};

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

const ApplyPage = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [description, setDescription] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<Job | null>(null);

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    // İş detaylarını çek
    fetchJobDetails();
  }, []);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/jobs/${jobId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }

      const data = await response.json();
      setJobDetails(data);
    } catch (err) {
      console.error("Error fetching job details:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleApply = async () => {
    if (!description || !resume) {
      setError(t.errorFillAllFields);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const resumeBase64 = await fileToBase64(resume);

      const response = await fetch('https://localhost:3002/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "job",
          description,
          jobId,
          resume: resumeBase64,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit application');
      }

      const result = await response.json();
      alert(result.message);
      router.push("/pages/dashboard/job-listings");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <div className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}>
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.applyForJob}
        </h1>
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* İş Detayları */}
        {jobDetails && (
          <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
            <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
              {t.jobDetails}
            </h2>
            <div className="space-y-4">
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">{t.jobTitle}:</span> {jobDetails.title}
              </p>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">{t.company}:</span> {jobDetails.company}
              </p>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">{t.location}:</span> {jobDetails.location}
              </p>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">{t.requiredTechnologies}:</span> {jobDetails.requiredTechnologies}
              </p>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">{t.salary}:</span> {jobDetails.salary.amount} {jobDetails.salary.currency}
              </p>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">{t.description}:</span> {jobDetails.description}
              </p>
              <p className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                <span className="font-semibold">{t.postedOn}:</span> {jobDetails.postedDate}
              </p>
            </div>
          </div>
        )}

        {/* Form Alanı */}
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              rows={4}
              placeholder={language === 'en' ? "Enter your description..." : "Açıklamanızı girin..."}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.resume}
            </label>
            <input
              type="file"
              onChange={(e) => setResume(e.target.files?.[0] || null)}
              className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/pages/dashboard/job-listings")}
            className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
          >
            {t.back}
          </button>

          <button
            onClick={handleApply}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.submitApplication}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;