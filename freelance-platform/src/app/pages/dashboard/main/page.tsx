"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";

type Language = 'en' | 'tr' | 'az';
type Theme = 'light' | 'dark';

const translations = {
  en: {
    welcomeFreelancer: "Welcome to Your Freelance Dashboard",
    welcomeEmployer: "Welcome to Your Employer Dashboard",
    profile: "Profile",
    dashboard: "Dashboard",
    profileDescFreelancer: "Update your personal details, skills, and portfolio.",
    profileDescEmployer: "Update your company details and preferences.",
    applyProjects: "Apply to Projects",
    applyProjectsDesc: "Apply to new projects and explore job opportunities.",
    jobListings: "Job Listings",
    jobListingsDesc: "Browse and apply for freelance job opportunities.",
    projects: "Projects",
    projectsDescFreelancer: "View your ongoing projects, deadlines, and submitted work.",
    projectsDescEmployer: "View your ongoing projects, deadlines, and submissions.",
    settings: "Settings",
    settingsDesc: "Update account preferences, notification settings, and more.",
    analytics: "Analytics",
    analyticsDesc: "Track your performance and statistics.",
    messages: "Messages",
    messagesDesc: "Check messages and manage communication.",
    createProject: "Create Project Listing",
    createProjectDesc: "Create a new project listing and let freelancers apply.",
    hireFreelancers: "Hire Freelancers",
    hireFreelancersDesc: "Find and hire top freelancers for your projects.",
    manageJobs: "Manage Jobs",
    manageJobsDesc: "Post, edit, and track your job listings.",
    needHelp: "Need help?",
    contactSupport: "Contact Support",
    logout: "Logout",
    notifications: "Notifications",
    myProfile: "My Profile"
  },
  tr: {
    welcomeFreelancer: "Freelance Panosuna Hoş Geldiniz",
    welcomeEmployer: "İşveren Panosuna Hoş Geldiniz",
    profile: "Profil",
    dashboard: "Panel",
    profileDescFreelancer: "Kişisel bilgilerinizi, becerilerinizi ve portföyünüzü güncelleyin.",
    profileDescEmployer: "Şirket bilgilerinizi ve tercihlerinizi güncelleyin.",
    applyProjects: "Projelere Başvur",
    applyProjectsDesc: "Yeni projelere başvurun ve iş fırsatlarını değerlendirin.",
    jobListings: "İş İlanları",
    jobListingsDesc: "Freelance iş fırsatlarını göz atın ve başvurun.",
    projects: "Projeler",
    projectsDescFreelancer: "Devam eden projelerinizi, son teslim tarihlerini ve gönderilen işleri görüntüleyin.",
    projectsDescEmployer: "Devam eden projelerinizi, son teslim tarihlerini ve gönderimleri görüntüleyin.",
    settings: "Ayarlar",
    settingsDesc: "Hesap tercihlerinizi, bildirim ayarlarınızı ve daha fazlasını güncelleyin.",
    analytics: "Analitik",
    analyticsDesc: "Performansınızı ve istatistiklerinizi takip edin.",
    messages: "Mesajlar",
    messagesDesc: "Mesajlarınızı kontrol edin ve iletişimi yönetin.",
    createProject: "Proje İlanı Oluştur",
    createProjectDesc: "Yeni bir proje ilanı oluşturarak freelancer'ların başvurmasını sağlayın.",
    hireFreelancers: "Freelancer İşe Al",
    hireFreelancersDesc: "Projeleriniz için en iyi freelancer'ları bulun ve işe alın.",
    manageJobs: "İşleri Yönet",
    manageJobsDesc: "İş ilanlarınızı gönderin, düzenleyin ve takip edin.",
    needHelp: "Yardıma mı ihtiyacınız var?",
    contactSupport: "Destekle İletişime Geçin",
    logout: "Çıkış Yap",
    notifications: "Bildirimler",
    myProfile: "Profilim"
  },
  az: {
    welcomeFreelancer: "Freelance Panelinə Xoş Gəlmisiniz",
    welcomeEmployer: "İşəgötürən Paneline Xoş Gəlmisiniz",
    profile: "Profil",
    dashboard: "İdarə Paneli",
    profileDescFreelancer: "Şəxsi məlumatlarınızı, bacarıqlarınızı və portfolionuzu yeniləyin.",
    profileDescEmployer: "Şirkət məlumatlarınızı və seçimlərinizi yeniləyin.",
    applyProjects: "Layihələrə Müraciət Et",
    applyProjectsDesc: "Yeni layihələrə müraciət edin və iş imkanlarından yararlanın.",
    jobListings: "İş Elanları",
    jobListingsDesc: "Freelance iş imkanlarına baxın və müraciət edin.",
    projects: "Layihələr",
    projectsDescFreelancer: "Davam edən layihələrinizi, son tarixləri və təqdim edilmiş işləri görüntüləyin.",
    projectsDescEmployer: "Davam edən layihələrinizi, son tarixləri və təqdimləri görüntüləyin.",
    settings: "Tənzimləmələr",
    settingsDesc: "Hesab seçimlərinizi, bildiriş tənzimləmələrinizi və daha çoxunu yeniləyin.",
    analytics: "Analitika",
    analyticsDesc: "Performansınızı və statistikalarınızı izləyin.",
    messages: "Mesajlar",
    messagesDesc: "Mesajlarınızı yoxlayın və əlaqəni idarə edin.",
    createProject: "Layihə Elanı Yarat",
    createProjectDesc: "Yeni bir layihə elanı yaradaraq freelancer-ların müraciət etməsini təmin edin.",
    hireFreelancers: "Freelancer İşə Götür",
    hireFreelancersDesc: "Layihələriniz üçün ən yaxşı freelancer-ları tapın və işə götürün.",
    manageJobs: "İşləri İdarə Et",
    manageJobsDesc: "İş elanlarınızı yerləşdirin, redaktə edin və izləyin.",
    needHelp: "Kömək lazımdır?",
    contactSupport: "Dəstəklə Əlaqə Saxlayın",
    logout: "Çıxış",
    notifications: "Bildirişlər",
    myProfile: "Profilim"
  }
};

interface DashboardCardProps {
  title: string;
  description: string;
  gradient: string;
  onClick: () => void;
  icon: React.ReactNode;
  unreadCount?: number;
}

const DashboardCard = ({ 
  title, 
  description, 
  gradient, 
  onClick, 
  icon, 
  unreadCount 
}: DashboardCardProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`p-6 bg-gradient-to-r ${gradient} rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all relative`}
    onClick={onClick}
  >
    {(unreadCount ?? 0) > 0 && (
      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {unreadCount}
      </div>
    )}
    <div className="flex items-center">
      <span className="text-3xl mr-4">{icon}</span>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-white text-sm mt-2">{description}</p>
  </motion.div>
);

export default function Dashboard() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme || 'light';
    const savedLanguage = localStorage.getItem("language") as Language || 'en';
    const savedUserRole = localStorage.getItem("userRole");
    
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    setUserRole(savedUserRole);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token is missing");
          return;
        }

        const response = await fetch("https://localhost:3002/api/messages/unreadCount", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch unread messages count");
        }

        const data = await response.json();
        setUnreadCount(data.unreadCount);
      } catch (err) {
        console.error("Error fetching unread messages count", err);
        setError("An error occurred while fetching unread messages count.");
      }
    };

    fetchUnreadCount();
  }, []);

  const fetchSettingsData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const response = await fetch("https://localhost:3002/api/settings/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      setTheme(data.theme);
      setLanguage(data.language);
      localStorage.setItem("theme", data.theme);
      localStorage.setItem("language", data.language);
      document.body.className = data.theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
    } catch (err) {
      console.error("Error fetching profile data", err);
      setError("An error occurred while fetching profile data.");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const response = await fetch("https://localhost:3002/api/profile/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      localStorage.setItem("userRole", data.userType);
      setUserRole(data.userType);
    } catch (err) {
      console.error("Error fetching profile data", err);
      setError("An error occurred while fetching profile data.");
    }
  };

  useEffect(() => {
    fetchSettingsData();
    fetchProfile();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleNotifications = () => setNotificationsOpen(!notificationsOpen);

  const handleProfileRedirect = () => router.push("/pages/dashboard/profile");
  const handleProjectsRedirect = () => router.push("/pages/dashboard/projects");
  const handleSettingsRedirect = () => router.push("/pages/dashboard/settings");
  const handleJobListingsRedirect = () => router.push("/pages/dashboard/job-listings");
  const handleHireFreelancersRedirect = () => router.push("/pages/dashboard/hire-freelancers");
  const handleManageJobsRedirect = () => router.push("/pages/dashboard/manage-jobs");
  const handleMessagesRedirect = () => router.push("/pages/dashboard/messages");
  const handleAnalyticsRedirect = () => router.push("/pages/dashboard/analytics");

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Sidebar 
      theme={theme}
      translations={t}
      sidebarOpen={sidebarOpen}
      toggleSidebar={toggleSidebar}
      userType={userRole ?? ""}
      language={language}
      />

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
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        setLanguage={(newLanguage: Language) => setLanguage(newLanguage)}
      />

      <main className="flex-1 overflow-y-auto p-6">
        <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-7xl mx-auto p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm`}
        >
        {error && (
          <p className="text-red-500 text-center font-medium mb-4">{error}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRole === "freelancer" && (
          <>
            <DashboardCard
            title={t.profile}
            description={t.profileDescFreelancer}
            gradient="from-green-400 to-green-600"
            onClick={handleProfileRedirect}
            icon="👤"
            />
            <DashboardCard
            title={t.applyProjects}
            description={t.applyProjectsDesc}
            gradient="from-indigo-400 to-indigo-600"
            onClick={() => router.push("/pages/dashboard/project-listings")}
            icon="📝"
            />
            <DashboardCard
            title={t.jobListings}
            description={t.jobListingsDesc}
            gradient="from-orange-400 to-orange-600"
            onClick={handleJobListingsRedirect}
            icon="📋"
            />
            <DashboardCard
            title={t.projects}
            description={t.projectsDescFreelancer}
            gradient="from-blue-500 to-blue-700"
            onClick={handleProjectsRedirect}
            icon="📂"
            />
          </>
          )}

          {userRole === "employer" && (
          <>
            <DashboardCard
            title={t.profile}
            description={t.profileDescEmployer}
            gradient="from-green-400 to-green-600"
            onClick={handleProfileRedirect}
            icon="🏢"
            />
            <DashboardCard
            title={t.createProject}
            description={t.createProjectDesc}
            gradient="from-blue-500 to-blue-700"
            onClick={() => router.push("/pages/dashboard/manage-project")}
            icon="📋"
            />
            <DashboardCard
            title={t.hireFreelancers}
            description={t.hireFreelancersDesc}
            gradient="from-blue-500 to-blue-700"
            onClick={handleHireFreelancersRedirect}
            icon="👥"
            />
            <DashboardCard
            title={t.projects}
            description={t.projectsDescEmployer}
            gradient="from-blue-500 to-blue-700"
            onClick={handleProjectsRedirect}
            icon="📂"
            />
            <DashboardCard
            title={t.manageJobs}
            description={t.manageJobsDesc}
            gradient="from-purple-400 to-purple-600"
            onClick={handleManageJobsRedirect}
            icon="📊"
            />
          </>
          )}

          <DashboardCard
          title={t.analytics}
          description={t.analyticsDesc}
          gradient="from-yellow-400 to-yellow-600"
          onClick={handleAnalyticsRedirect}
          icon="📈"
          />
          <DashboardCard
          title={t.messages}
          description={t.messagesDesc}
          gradient="from-teal-400 to-teal-600"
          onClick={handleMessagesRedirect}
          icon="📩"
          unreadCount={unreadCount}
          />
          <DashboardCard
          title={t.settings}
          description={t.settingsDesc}
          gradient="from-purple-400 to-purple-600"
          onClick={handleSettingsRedirect}
          icon="⚙️"
          />
        </div>

        <div className="mt-8 text-center text-sm">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {t.needHelp}
          <span
            onClick={() => router.push("/dashboard/support")}
            className="text-blue-500 cursor-pointer hover:underline ml-1"
          >
            {t.contactSupport}
          </span>
          </p>
        </div>
        </motion.div>
      </main>
      </div>
    </div>
  );
}
