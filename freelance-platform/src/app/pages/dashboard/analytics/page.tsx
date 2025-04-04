"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type Translations = {
  [key: string]: {
    title: string;
    filters: string;
    metric: string;
    revenue: string;
    projects: string;
    clients: string;
    timeRange: string;
    last7Days: string;
    last30Days: string;
    last6Months: string;
    lastYear: string;
    revenueOverTime: string;
    projectStatistics: string;
    otherMetrics: string;
    totalRevenue: string;
    activeProjects: string;
    back: string;
    newClients: string;
    dashboard: string;
    profile: string;
    messages: string;
    analytics: string;
    settings: string; 
    logout: string;
    applyProjects: string;
    jobListings: string;
    createProject: string;
    hireFreelancers: string;
    manageJobs: string;
  };
};

type Language = "en" | "tr" | "az";

const translations: Translations = {
  en: {
    title: "Analytics Dashboard",
    filters: "Filters",
    metric: "Metric",
    revenue: "Revenue",
    projects: "Projects",
    clients: "Clients",
    timeRange: "Time Range",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    last6Months: "Last 6 Months",
    lastYear: "Last Year",
    revenueOverTime: "Revenue Over Time",
    projectStatistics: "Project Statistics",
    otherMetrics: "Other Metrics",
    totalRevenue: "Total Revenue",
    activeProjects: "Active Projects",
    back: "Back",
    newClients: "New Clients",
    dashboard: "Dashboard",
    profile: "Profile",
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
    title: "Analitik Panosu",
    filters: "Filtreler",
    metric: "Metrik",
    revenue: "Gelir",
    projects: "Projeler",
    clients: "Müşteriler",
    timeRange: "Zaman Aralığı",
    last7Days: "Son 7 Gün",
    last30Days: "Son 30 Gün",
    last6Months: "Son 6 Ay",
    lastYear: "Son 1 Yıl",
    revenueOverTime: "Zaman İçinde Gelir",
    projectStatistics: "Proje İstatistikleri",
    otherMetrics: "Diğer Metrikler",
    totalRevenue: "Toplam Gelir",
    activeProjects: "Aktif Projeler",
    back: "Geri",
    newClients: "Yeni Müşteriler",
    dashboard: "Panel",
    profile: "Profil",
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
    title: "Analitika Paneli",
    filters: "Filtrlər",
    metric: "Metrik",
    revenue: "Gəlir",
    projects: "Layihələr",
    clients: "Müştərilər",
    timeRange: "Zaman Aralığı",
    last7Days: "Son 7 Gün",
    last30Days: "Son 30 Gün",
    last6Months: "Son 6 Ay",
    lastYear: "Son 1 İl",
    revenueOverTime: "Zamanla Gəlir",
    projectStatistics: "Layihə Statistikası",
    otherMetrics: "Digər Metrikalar",
    totalRevenue: "Ümumi Gəlir",
    activeProjects: "Aktiv Layihələr",
    back: "Geri",
    newClients: "Yeni Müştərilər",
    dashboard: "İdarə Paneli",
    profile: "Profil",
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

const AnalyticsPage = () => {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [timeRange, setTimeRange] = useState("last_30_days");
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userRole, setUserRole] = useState("client"); // or "freelancer"

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    const savedUserRole = localStorage.getItem("userRole");
    setUserRole(savedUserRole || "client"); // Default to "client" if not set
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setLanguage(savedLanguage as Language);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const revenueData = [
    { name: "Jan", revenue: 4000 },
    { name: "Feb", revenue: 3000 },
    { name: "Mar", revenue: 2000 },
    { name: "Apr", revenue: 2780 },
    { name: "May", revenue: 1890 },
    { name: "Jun", revenue: 2390 },
    { name: "Jul", revenue: 3490 },
  ];

  const projectData = [
    { name: "Completed", value: 24 },
    { name: "In Progress", value: 8 },
    { name: "Not Started", value: 5 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]; 

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

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
  
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`w-full mx-auto max-w-6xl ${theme === "dark" ? "bg-gray-800" : "bg-white"} rounded-2xl shadow-lg p-6 space-y-8`}
          >
            <div className="text-center mb-8">
              <h1 className={`text-3xl md:text-4xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"} mb-2`}>
                {t.title}
              </h1>
              {error && (
                <p className="text-red-500 font-medium">{error}</p>
              )}
            </div>
  
            {/* Filters Section */}
            <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.filters}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.metric}
                  </label>
                  <select
                    value={selectedMetric}
                    onChange={(e) => handleMetricChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="revenue">{t.revenue}</option>
                    <option value="projects">{t.projects}</option>
                    <option value="clients">{t.clients}</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.timeRange}
                  </label>
                  <select
                    value={timeRange}
                    onChange={(e) => handleTimeRangeChange(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      theme === "dark" 
                        ? "bg-gray-600 border-gray-500 text-white" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="last_7_days">{t.last7Days}</option>
                    <option value="last_30_days">{t.last30Days}</option>
                    <option value="last_6_months">{t.last6Months}</option>
                    <option value="last_year">{t.lastYear}</option>
                  </select>
                </div>
              </div>
            </div>
  
            {/* Revenue Chart */}
            <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.revenueOverTime}
              </h2>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <LineChart
                    width={800}
                    height={300}
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#4b5563" : "#e5e7eb"} />
                    <XAxis 
                      dataKey="name" 
                      stroke={theme === "dark" ? "#d1d5db" : "#4b5563"} 
                    />
                    <YAxis 
                      stroke={theme === "dark" ? "#d1d5db" : "#4b5563"} 
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                        borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </div>
              </div>
            </div>
  
            {/* Project Statistics */}
            <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.projectStatistics}
              </h2>
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
                <div className="w-full lg:w-1/2">
                  <BarChart
                    width={500}
                    height={300}
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#4b5563" : "#e5e7eb"} />
                    <XAxis 
                      dataKey="name" 
                      stroke={theme === "dark" ? "#d1d5db" : "#4b5563"} 
                    />
                    <YAxis 
                      stroke={theme === "dark" ? "#d1d5db" : "#4b5563"} 
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                        borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill="#82ca9d" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </div>
                <div className="w-full lg:w-1/2">
                  <PieChart width={400} height={300}>
                    <Pie
                      data={projectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {projectData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                        borderColor: theme === "dark" ? "#4b5563" : "#e5e7eb",
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </div>
              </div>
            </div>
  
            {/* Metrics Cards */}
            <div className={`p-5 rounded-xl ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
              <h2 className={`text-xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                {t.otherMetrics}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg transition-all hover:shadow-md ${
                  theme === "dark" 
                    ? "bg-gray-600 hover:bg-gray-600/90" 
                    : "bg-white hover:bg-gray-50"
                }`}>
                  <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.totalRevenue}
                  </p>
                  <p className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>
                    $12,345
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}>
                    ↑ 12% from last month
                  </p>
                </div>
                <div className={`p-4 rounded-lg transition-all hover:shadow-md ${
                  theme === "dark" 
                    ? "bg-gray-600 hover:bg-gray-600/90" 
                    : "bg-white hover:bg-gray-50"
                }`}>
                  <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.activeProjects}
                  </p>
                  <p className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>
                    8
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === "dark" ? "text-blue-400" : "text-blue-600"
                  }`}>
                    → Same as last month
                  </p>
                </div>
                <div className={`p-4 rounded-lg transition-all hover:shadow-md ${
                  theme === "dark" 
                    ? "bg-gray-600 hover:bg-gray-600/90" 
                    : "bg-white hover:bg-gray-50"
                }`}>
                  <p className={`text-sm mb-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    {t.newClients}
                  </p>
                  <p className={`text-2xl font-bold ${
                    theme === "dark" ? "text-white" : "text-gray-800"
                  }`}>
                    3
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}>
                    ↑ 50% from last month
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8">
              <button
                onClick={() => router.push("/pages/dashboard/main")}
                className={`px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg ${
                  theme === "dark" 
                    ? "bg-gray-600 hover:bg-gray-500 text-white" 
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

export default AnalyticsPage;
