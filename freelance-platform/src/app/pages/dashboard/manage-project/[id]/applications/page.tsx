"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

type Language = 'en' | 'tr' | 'az';

const translations: Record<Language, { [key: string]: string }> = {
  en: {
    applicationsForProject: "Applications for Project",
    viewResume: "View Resume",
    backToProjects: "Back",
    accept: "Accept",
    accepted: "Accepted",
    acceptedApplicationMessage: "|------Your application has been accepted!------|", 
  },
  tr: {
    applicationsForProject: "Proje Başvuruları",
    viewResume: "Özgeçmişi Görüntüle",
    backToProjects: "Geri",
    accept: "Kabul Et",
    accepted: "Kabul Edildi",
    acceptedApplicationMessage: "|------Başvurunuz kabul edildi!------|", 
  },
  az: {
    applicationsForProject: "Layihəyə Müraciətlər",
    viewResume: "CV-ni Göstər",
    backToProjects: "Geri",
    accept: "Qəbul Et",
    accepted: "Qəbul Edildi",
    acceptedApplicationMessage: "|------Müraciətiniz qəbul edildi!------|", 
  },
};

const ProjectApplicationsPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState("light");
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  interface Application {
    _id: string;
    description: string;
    resume: string;
    status: 'pending' | 'accepted';
    userId: string; 
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

      const response = await fetch(`https://localhost:3002/api/applications/project/${projectId}`, {
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
      console.log(data);
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while fetching applications.");
      } else {
        setError("An error occurred while fetching applications.");
      }
    }
  }, [projectId]);

  useEffect(() => {
    const newSocket = io("https://localhost:3003");
    setSocket(newSocket);

    const token = localStorage.getItem("token");
    if (token) {
      newSocket.emit("join", token);
    }

    return () => {
      newSocket.disconnect();
    };
  }, []);

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

  const handleAccept = async ( applicationId: string, userId: string) => {
    try {
      if (!projectId || !applicationId) {
        setError("Invalid project or application ID.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/applications/accept/${applicationId}/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept application");
      }

      const data = await response.json();
      console.log(data);

      await addOngoingProject( projectId, userId);

      const application = applications.find((app) => app._id === applicationId);
      if (application) {
        handleSendMessage(application.userId); 
      }

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status: 'accepted' } : app
        )
      );
    } catch (err) {
      console.error("Error accepting application:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while accepting the application.");
      } else {
        setError("An error occurred while accepting the application.");
      }
    }
  };

  const addOngoingProject = async ( projectId: string, userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      const response = await fetch(`https://localhost:3002/api/ongoingProjects/${projectId}/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add project to ongoing projects");
      }

      const data = await response.json();
      console.log("Project added to ongoing projects:", data);
    } catch (err) {
      console.error("Error adding project to ongoing projects:", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while adding the project to ongoing projects.");
      } else {
        setError("An error occurred while adding the project to ongoing projects.");
      }
    }
  };

  const handleSendMessage = async (freelancerId: string) => {
    try {
      const message = t.acceptedApplicationMessage || "|------Your application has been accepted!------|"; 

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authorized. Please log in.");
        return;
      }

      if (!socket.connected) {
        setError("Socket connection not established. Please try again.");
        return;
      }

      socket.emit("private message", {
        toUsername: freelancerId,
        message: message,
      }, (response: { status: string; message: string }) => {
        if (response.status === 'success') {
          console.log("Message sent successfully:", response.message);
          setError(null);
          alert("Message sent successfully!");
        } else {
          setError(response.message || "Failed to send message.");
        }
      });
    } catch (err) {
      console.error("Error sending message:", err);
      setError("An error occurred while sending the message.");
    }
  };

  const hasAcceptedApplication = applications.some((app) => app.status === 'accepted');

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gradient-to-br from-blue-100 via-indigo-200 to-purple-300"}`}>
      <div className={`w-full max-w-4xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-8`}>
        <h1 className={`text-4xl font-extrabold text-center ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
          {t.applicationsForProject} #{projectId}
        </h1>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* Application List */}
        <div className="space-y-4">
          {applications.map((application) => (
            <div
              key={application._id}
              className={`${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} p-6 rounded-lg shadow-inner relative`}
            >
              <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {application.description}
              </h3>
              <p className={`text-sm ${theme === "dark" ? "text-blue-400" : "text-blue-600"} hover:underline`}>
                <a href={application.resume} target="_blank" rel="noopener noreferrer">
                  {t.viewResume}
                </a>
              </p>
              {/* Accept Button */}
              {application.status === 'accepted' ? (
                <div className="absolute bottom-2 right-2 px-4 py-2 bg-green-500 text-white text-sm rounded-full">
                  {t.accepted}
                </div>
              ) : (
                !hasAcceptedApplication && (
                  <button
                    onClick={() => handleAccept( application._id, application.userId)}
                    className="absolute bottom-2 right-2 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white text-sm rounded-full hover:from-green-500 hover:to-green-700 transition-all shadow-lg"
                  >
                    {t.accept}
                  </button>
                )
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => router.push("/pages/dashboard/manage-project")}
          className="w-full px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg"
        >
          {t.backToProjects}
        </button>
      </div>
    </div>
  );
};

export default ProjectApplicationsPage;