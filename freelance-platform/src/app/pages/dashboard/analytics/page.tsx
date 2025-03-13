"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  };
};

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
  },
};

const AnalyticsPage = () => {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState("revenue");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("light");
  const [timeRange, setTimeRange] = useState("last_30_days");
  const [error, setError] = useState<string | null>(null);

  const t = translations[language];

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const savedLanguage = localStorage.getItem("language") || "en";
    setTheme(savedTheme);
    setLanguage(savedLanguage);
    document.body.className = savedTheme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900";
  }, []);

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
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-8 ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"}`}>
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
        <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.filters}
          </h2>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.metric}
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => handleMetricChange(e.target.value)}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                <option value="revenue">{t.revenue}</option>
                <option value="projects">{t.projects}</option>
                <option value="clients">{t.clients}</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                {t.timeRange}
              </label>
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${theme === "dark" ? "bg-gray-600 border-gray-500 text-white" : "bg-white border-gray-300 text-gray-900"}`}
              >
                <option value="last_7_days">{t.last7Days}</option>
                <option value="last_30_days">{t.last30Days}</option>
                <option value="last_6_months">{t.last6Months}</option>
                <option value="last_year">{t.lastYear}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gelir Grafiği */}
        <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.revenueOverTime}
          </h2>
          <LineChart
            width={800}
            height={300}
            data={revenueData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke={theme === "dark" ? "#fff" : "#000"} />
            <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </div>

        {/* Proje İstatistikleri */}
        <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.projectStatistics}
          </h2>
          <div className="flex flex-wrap gap-8">
            <BarChart
              width={400}
              height={300}
              data={revenueData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={theme === "dark" ? "#fff" : "#000"} />
              <YAxis stroke={theme === "dark" ? "#fff" : "#000"} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
            <PieChart width={400} height={300}>
              <Pie
                data={projectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {projectData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>

        {/* Diğer Metrikler */}
        <div className={`p-6 rounded-xl shadow-inner ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"}`}>
          <h2 className={`text-2xl font-semibold mb-4 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
            {t.otherMetrics}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg shadow-sm ${theme === "dark" ? "bg-gray-600" : "bg-white"}`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {t.totalRevenue}
              </p>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                $12,345
              </p>
            </div>
            <div className={`p-4 rounded-lg shadow-sm ${theme === "dark" ? "bg-gray-600" : "bg-white"}`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {t.activeProjects}
              </p>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                8
              </p>
            </div>
            <div className={`p-4 rounded-lg shadow-sm ${theme === "dark" ? "bg-gray-600" : "bg-white"}`}>
              <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                {t.newClients}
              </p>
              <p className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
                3
              </p>
            </div>
          </div>
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

export default AnalyticsPage;