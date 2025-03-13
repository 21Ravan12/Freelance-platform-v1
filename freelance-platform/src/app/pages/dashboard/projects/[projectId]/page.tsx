"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    status: "Status",
    completed: "Completed",
    inProgress: "In Progress",
    pending: "Pending",
    deadline: "Deadline",
    backToProjects: "Back to Projects",
    complete: "Complete",
  },
  tr: {
    status: "Durum",
    completed: "Tamamlandı",
    inProgress: "Devam Ediyor",
    pending: "Beklemede",
    deadline: "Son Tarih",
    backToProjects: "Projelerime Geri Dön",
    complete: "Tamamla",
  },
  az: {
    status: "Status",
    completed: "Tamamlandı",
    inProgress: "Davam Edir",
    pending: "Gözləmədə",
    deadline: "Son Tarix",
    backToProjects: "Layihələrimə Geri Dön",
    complete: "Tamamla",
  },
};

interface Project {
  _id: string;
  title: string;
  description: string;
  status: "Completed" | "In Progress";
  deadline: string;
  isCompleteFromFreelancer: boolean;
  isCompleteFromEmployer: boolean;
}

const ProjectDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [project, setProject] = useState<Project | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    const savedUserRole = localStorage.getItem("userRole");
    setUserRole(savedUserRole);
    setTheme(savedTheme);
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    const fetchProjectDetails = async () => {
      try {
        if (!projectId) {
          throw new Error("Project ID is missing.");
        }

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("You are not authorized. Please log in.");
        }

        const response = await fetch(`https://localhost:3002/api/ongoingProjectsById/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch project details.");
        }

        const data = await response.json();
        console.log(data);
        setProject(data);
      } catch (err) {
        console.error("Error fetching project details:", err);
        if (err instanceof Error) {
          setError(err.message || "An error occurred while fetching project details.");
        } else {
          setError("An error occurred while fetching project details.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const handleCompleteProject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You are not authorized. Please log in.");
      }

      const response = await fetch(`https://localhost:3002/api/completeOngoingProjectById`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: projectId,
          isCompleteFromFreelancer: true,
          isCompleteFromEmployer: userRole === "employer",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update project status.");
      }

      const updatedProject = await response.json();
      setProject(updatedProject.project);
    } catch (err) {
      console.error("Error completing project:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while completing the project.");
      } else {
        setError("An error occurred while completing the project.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Project not found.</p>
      </div>
    );
  }

  const formatDeadline = (deadline: string) => {
    try {
      return new Date(deadline).toLocaleDateString();
    } catch (err) {
      console.error("Invalid date format:", err);
      return "Invalid date";
    }
  };

  const isProjectCompleted =
    project.isCompleteFromFreelancer && project.isCompleteFromEmployer;

  const getButtonText = () => {
    if (isProjectCompleted) {
      return t.completed; 
    }
    if (userRole === "freelancer" && !project.isCompleteFromFreelancer) {
      return t.complete;
    }
    if (userRole === "employer" && !project.isCompleteFromEmployer) {
      return t.complete; 
    }
    return t.completed; 
  };

  const isButtonDisabled = isProjectCompleted; 

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <div className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}>
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {project.title}
        </h1>
        <p className={`text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{project.description}</p>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.status}
            </label>
            <p
              className={`mt-1 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                project.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : project.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {project.status === "Completed" ? t.completed : t.inProgress}
            </p>
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              {t.deadline}
            </label>
            <p className={`mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-900"}`}>
              {formatDeadline(project.deadline)}
            </p>
          </div>
        </div>

        {/* Butonları flex container içine al ve sağa hizala */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/pages/dashboard/projects")}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
          >
            {t.backToProjects}
          </button>

          <button
            onClick={handleCompleteProject}
            disabled={isButtonDisabled}
            className={`px-6 py-2 bg-gradient-to-r ${
              isButtonDisabled
                ? "from-gray-500 to-gray-600 cursor-not-allowed"
                : "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            } text-white rounded-lg transition-all shadow-lg`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;