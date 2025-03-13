"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface DashboardCardProps {
  title: string;
  description: string;
  gradient: string;
  onClick: () => void;
  icon: React.ReactNode;
  unreadCount?: number; 
}

const DashboardCard = ({ title, description, gradient, onClick, icon, unreadCount }: DashboardCardProps) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`p-6 bg-gradient-to-r ${gradient} rounded-xl shadow-xl hover:shadow-2xl cursor-pointer transition-all relative`} 
    onClick={onClick}
  >
    {/* Unread Count */}
    {(unreadCount ?? 0) > 0 && (
      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {unreadCount}
      </div>
    )}
    <div className="flex items-center">
      <span className="text-3xl mr-4">{icon}</span>
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
    </div>
    <p className="text-white text-sm mt-2">{description}</p>
  </motion.div>
);

const Dashboard = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState({
    theme: 'light',
    language: 'en',
  });
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    const savedUserRole = localStorage.getItem("userRole");
    setUserRole(savedUserRole);
    setUser({ theme: savedTheme, language: savedLanguage });

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
      setUser({
        theme: data.theme,
        language: data.language,
      });
      localStorage.setItem("theme", data.theme);
      localStorage.setItem("language", data.language);
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

  const handleProfileRedirect = () => {
    router.push("/pages/dashboard/profile");
  };

  const handleProjectsRedirect = () => {
    router.push("/pages/dashboard/projects");
  };

  const handleSettingsRedirect = () => {
    router.push("/pages/dashboard/settings");
  };

  const handleJobListingsRedirect = () => {
    router.push("/pages/dashboard/job-listings");
  };

  const handleHireFreelancersRedirect = () => {
    router.push("/pages/dashboard/hire-freelancers");
  };

  const handleManageJobsRedirect = () => {
    router.push("/pages/dashboard/manage-jobs");
  };
  
  return (
    <div className={`min-h-screen w-full flex flex-col ${user.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Arka Plan Animasyonu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://www.example.com/dashboard-background.jpg")',
        }}
      ></motion.div>

      {/* Ana İçerik */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`w-full max-w-7xl mx-auto p-8 space-y-8 ${user.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl flex-1 flex flex-col justify-center`}
      >
        {/* Başlık ve Açıklama */}
        <div className="text-center">
          <h1 className={`text-5xl font-extrabold ${user.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            {userRole === "freelancer"
              ? user.language === 'tr' 
                ? "Freelance Panosuna Hoş Geldiniz" 
                : user.language === 'az' 
                ? "Freelance Paneline Xoş Gəlmisiniz" 
                : "Welcome to Your Freelance Dashboard"
              : user.language === 'tr' 
              ? "İşveren Panosuna Hoş Geldiniz" 
              : user.language === 'az' 
              ? "İşəgötürən Paneline Xoş Gəlmisiniz" 
              : "Welcome to Your Employer Dashboard"}
          </h1>
          <p className={`mt-4 ${user.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-lg md:text-xl`}>
            {userRole === "freelancer"
              ? user.language === 'tr'
                ? "Freelance kariyerinizi yönetin, projelerinizi takip edin, profilinizi güncelleyin ve daha fazlasını yapın."
                : user.language === 'az'
                ? "Freelance karyeranızı idarə edin, layihələrinizi izləyin, profilini yeniləyin və daha çoxunu edin."
                : "Manage your freelance career, track projects, update your profile, and more."
              : user.language === 'tr'
              ? "İş ilanlarınızı yönetin, en iyi freelancer'ları işe alın ve projelerinizi takip edin."
              : user.language === 'az'
              ? "İş elanlarınızı idarə edin, ən yaxşı freelancer-ları işə götürün və layihələrinizi izləyin."
              : "Manage your job postings, hire top freelancers, and track your projects."}
          </p>
        </div>

        {/* Kartlar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {/* Freelancer Kartları */}
          {userRole === "freelancer" && (
            <>
              <DashboardCard
                title={user.language === 'tr' ? 'Profil' : user.language === 'az' ? 'Profil' : 'Profile'}
                description={
                  user.language === 'tr'
                    ? 'Kişisel bilgilerinizi, becerilerinizi ve portföyünüzü güncelleyin.'
                    : user.language === 'az'
                    ? 'Şəxsi məlumatlarınızı, bacarıqlarınızı və portfolionuzu yeniləyin.'
                    : 'Update your personal details, skills, and portfolio.'
                }
                gradient="from-green-400 to-green-600"
                onClick={handleProfileRedirect}
                icon="👤"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'Projelere Başvur' : user.language === 'az' ? 'Layihələrə Müraciət Et' : 'Apply to Projects'}
                description={
                  user.language === 'tr'
                    ? 'Yeni projelere başvurun ve iş fırsatlarını değerlendirin.'
                    : user.language === 'az'
                    ? 'Yeni layihələrə müraciət edin və iş imkanlarından yararlanın.'
                    : 'Apply to new projects and explore job opportunities.'
                }
                gradient="from-indigo-400 to-indigo-600"
                onClick={() => router.push("/pages/dashboard/project-listings")}
                icon="📝"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'İş İlanları' : user.language === 'az' ? 'İş Elanları' : 'Job Listings'}
                description={
                  user.language === 'tr'
                    ? 'Freelance iş fırsatlarını göz atın ve başvurun.'
                    : user.language === 'az'
                    ? 'Freelance iş imkanlarına baxın və müraciət edin.'
                    : 'Browse and apply for freelance job opportunities.'
                }
                gradient="from-orange-400 to-orange-600"
                onClick={handleJobListingsRedirect}
                icon="📋"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'Projeler' : user.language === 'az' ? 'Layihələr' : 'Projects'}
                description={
                  user.language === 'tr'
                    ? 'Devam eden projelerinizi, son teslim tarihlerini ve gönderilen işleri görüntüleyin.'
                    : user.language === 'az'
                    ? 'Davam edən layihələrinizi, son tarixləri və təqdim edilmiş işləri görüntüləyin.'
                    : 'View your ongoing projects, deadlines, and submitted work.'
                }
                gradient="from-blue-500 to-blue-700"
                onClick={handleProjectsRedirect}
                icon="📂"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'Ayarlar' : user.language === 'az' ? 'Tənzimləmələr' : 'Settings'}
                description={
                  user.language === 'tr'
                    ? 'Hesap tercihlerinizi, bildirim ayarlarınızı ve daha fazlasını güncelleyin.'
                    : user.language === 'az'
                    ? 'Hesab seçimlərinizi, bildiriş tənzimləmələrinizi və daha çoxunu yeniləyin.'
                    : 'Update account preferences, notification settings, and more.'
                }
                gradient="from-purple-400 to-purple-600"
                onClick={handleSettingsRedirect}
                icon="⚙️"
              />
            </>
          )}

          {/* Employer Kartları */}
          {userRole === "employer" && (
            <>
              <DashboardCard
                title={user.language === 'tr' ? 'Profil' : user.language === 'az' ? 'Profil' : 'Profile'}
                description={
                  user.language === 'tr'
                    ? 'Şirket bilgilerinizi ve tercihlerinizi güncelleyin.'
                    : user.language === 'az'
                    ? 'Şirkət məlumatlarınızı və seçimlərinizi yeniləyin.'
                    : 'Update your company details and preferences.'
                }
                gradient="from-green-400 to-green-600"
                onClick={handleProfileRedirect}
                icon="🏢"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'Proje İlanı Oluştur' : user.language === 'az' ? 'Layihə Elanı Yarat' : 'Create Project Listing'}
                description={
                  user.language === 'tr'
                    ? 'Yeni bir proje ilanı oluşturarak freelancer\'ların başvurmasını sağlayın.'
                    : user.language === 'az'
                    ? 'Yeni bir layihə elanı yaradaraq freelancer-ların müraciət etməsini təmin edin.'
                    : 'Create a new project listing and let freelancers apply.'
                }
                gradient="from-blue-500 to-blue-700"
                onClick={() => router.push("/pages/dashboard/manage-project")}
                icon="📋"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'Freelancer İşe Al' : user.language === 'az' ? 'Freelancer İşə Götür' : 'Hire Freelancers'}
                description={
                  user.language === 'tr'
                    ? 'Projeleriniz için en iyi freelancer\'ları bulun ve işe alın.'
                    : user.language === 'az'
                    ? 'Layihələriniz üçün ən yaxşı freelancer-ları tapın və işə götürün.'
                    : 'Find and hire top freelancers for your projects.'
                }
                gradient="from-blue-500 to-blue-700"
                onClick={handleHireFreelancersRedirect}
                icon="👥"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'Projeler' : user.language === 'az' ? 'Layihələr' : 'Projects'}
                description={
                  user.language === 'tr'
                    ? 'Devam eden projelerinizi, son teslim tarihlerini ve gönderilen işleri görüntüleyin.'
                    : user.language === 'az'
                    ? 'Davam edən layihələrinizi, son tarixləri və təqdim edilmiş işləri görüntüləyin.'
                    : 'View your ongoing projects, deadlines, and submitted work.'
                }
                gradient="from-blue-500 to-blue-700"
                onClick={handleProjectsRedirect}
                icon="📂"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'İşleri Yönet' : user.language === 'az' ? 'İşləri İdarə Et' : 'Manage Jobs'}
                description={
                  user.language === 'tr'
                    ? 'İş ilanlarınızı gönderin, düzenleyin ve takip edin.'
                    : user.language === 'az'
                    ? 'İş elanlarınızı yerləşdirin, redaktə edin və izləyin.'
                    : 'Post, edit, and track your job listings.'
                }
                gradient="from-purple-400 to-purple-600"
                onClick={handleManageJobsRedirect}
                icon="📊"
              />
              <DashboardCard
                title={user.language === 'tr' ? 'Ayarlar' : user.language === 'az' ? 'Tənzimləmələr' : 'Settings'}
                description={
                  user.language === 'tr'
                    ? 'Hesap tercihlerinizi, bildirim ayarlarınızı ve daha fazlasını güncelleyin.'
                    : user.language === 'az'
                    ? 'Hesab seçimlərinizi, bildiriş tənzimləmələrinizi və daha çoxunu yeniləyin.'
                    : 'Update account preferences, notification settings, and more.'
                }
                gradient="from-orange-400 to-orange-600"
                onClick={handleSettingsRedirect}
                icon="⚙️"
              />
            </>
          )}

          {/* Ortak Kartlar */}
          <DashboardCard
            title={user.language === 'tr' ? 'Analitik' : user.language === 'az' ? 'Analitika' : 'Analytics'}
            description={
              user.language === 'tr'
                ? 'Performansınızı ve istatistiklerinizi takip edin.'
                : user.language === 'az'
                ? 'Performansınızı və statistikalarınızı izləyin.'
                : 'Track your performance and statistics.'
            }
            gradient="from-yellow-400 to-yellow-600"
            onClick={() => router.push("/pages/dashboard/analytics")}
            icon="📈"
          />
          <DashboardCard
            title={user.language === 'tr' ? 'Mesajlar' : user.language === 'az' ? 'Mesajlar' : 'Messages'}
            description={
              user.language === 'tr'
                ? 'Mesajlarınızı kontrol edin ve iletişimi yönetin.'
                : user.language === 'az'
                ? 'Mesajlarınızı yoxlayın və əlaqəni idarə edin.'
                : 'Check messages and manage communication.'
            }
            gradient="from-teal-400 to-teal-600"
            onClick={() => router.push("/pages/dashboard/messages")}
            icon="📩"
            unreadCount={unreadCount} 
          />
        </div>

        {/* Hata Mesajı */}
        {error && (
          <p className="text-red-500 text-center font-medium mt-4">{error}</p>
        )}

        {/* Destek Bağlantısı */}
        <div className="mt-8 text-center text-sm">
          <p className={user.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {user.language === 'tr'
              ? 'Yardıma mı ihtiyacınız var? '
              : user.language === 'az'
              ? 'Kömək lazımdır? '
              : 'Need help? '}
            <span
              onClick={() => router.push("/dashboard/support")}
              className="text-blue-500 cursor-pointer hover:underline"
            >
              {user.language === 'tr' 
                ? 'Destekle İletişime Geçin' 
                : user.language === 'az'
                ? 'Dəstəklə Əlaqə Saxlayın'
                : 'Contact Support'}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;