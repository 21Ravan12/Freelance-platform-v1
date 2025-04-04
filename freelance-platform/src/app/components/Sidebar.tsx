"use client";

import { FiHome, FiUser, FiBriefcase, FiSettings, FiBarChart2, FiLogOut, FiMessageSquare, FiFileText, FiUsers, FiList } from "react-icons/fi";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  userRole: 'freelancer' | 'employer';
}

const NavItem = ({ 
  icon, 
  label, 
  onClick, 
  active = false,
  theme
}: { 
  icon: React.ReactNode, 
  label: string, 
  onClick: () => void, 
  active?: boolean,
  theme: 'light' | 'dark'
}) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
      active 
        ? theme === 'dark' 
          ? 'bg-blue-600 text-white' 
          : 'bg-blue-100 text-blue-600'
        : theme === 'dark'
          ? 'hover:bg-gray-700'
          : 'hover:bg-gray-100'
    }`}
    onClick={onClick}
  >
    <span className="mr-3">{icon}</span>
    <span>{label}</span>
  </motion.div>
);

export const Sidebar = ({ 
  theme,
  translations,
  sidebarOpen,
  toggleSidebar,
  userType,
  language
}: { 
  theme: string,
  translations: { [key: string]: string },
  sidebarOpen: boolean,
  toggleSidebar: () => void,
  userType: string,
  language: string 
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname === route;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    router.push("/pages/auth/login");
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: sidebarOpen ? 0 : -300 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed top-0 left-0 h-full w-64 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg z-20`}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>FreelanceHub</h1>
          <button 
            onClick={toggleSidebar} 
            className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-200 text-gray-800'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.707 4.293a1 1 0 010 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/pages/dashboard/main")}
            className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
              isActive("/pages/dashboard/main")
                ? theme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
            }`}
          >
            <FiHome className="mr-3" />
            <span>{translations.dashboard}</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/pages/dashboard/profile")}
            className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
              isActive("/pages/dashboard/profile")
                ? theme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
            }`}
          >
            <FiUser className="mr-3" />
            <span>{translations.profile}</span>
          </motion.div>
          
          {userType === "freelancer" && (
            <>
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/pages/dashboard/project-listings")}
                className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
                  isActive("/pages/dashboard/project-listings")
                    ? theme === 'dark' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                }`}
              >
                <FiFileText className="mr-3" />
                <span>{translations.applyProjects}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/pages/dashboard/job-listings")}
                className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
                  isActive("/pages/dashboard/job-listings")
                    ? theme === 'dark' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                }`}
              >
                <FiList className="mr-3" />
                <span>{translations.jobListings}</span>
              </motion.div>
            </>
          )}
          
          {userType === "employer" && (
            <>
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/pages/dashboard/manage-project")}
                className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
                  isActive("/pages/dashboard/manage-project")
                    ? theme === 'dark' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                }`}
              >
                <FiFileText className="mr-3" />
                <span>{translations.createProject}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/pages/dashboard/hire-freelancers")}
                className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
                  isActive("/pages/dashboard/hire-freelancers")
                    ? theme === 'dark' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                }`}
              >
                <FiUsers className="mr-3" />
                <span>{translations.hireFreelancers}</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push("/pages/dashboard/manage-jobs")}
                className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
                  isActive("/pages/dashboard/manage-jobs")
                    ? theme === 'dark' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-100 text-blue-600'
                    : theme === 'dark'
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                }`}
              >
                <FiList className="mr-3" />
                <span>{translations.manageJobs}</span>
              </motion.div>
            </>
          )}
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/pages/dashboard/projects")}
            className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
              isActive("/pages/dashboard/projects")
                ? theme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
            }`}
          >
            <FiBriefcase className="mr-3" />
            <span>{translations.projects}</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/pages/dashboard/messages")}
            className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
              isActive("/pages/dashboard/messages")
                ? theme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
            }`}
          >
            <FiMessageSquare className="mr-3" />
            <span>{translations.messages}</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/pages/dashboard/analytics")}
            className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
              isActive("/pages/dashboard/analytics")
                ? theme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
            }`}
          >
            <FiBarChart2 className="mr-3" />
            <span>{translations.analytics}</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/pages/dashboard/settings")}
            className={`flex items-center p-3 rounded-lg cursor-pointer mb-2 ${
              isActive("/pages/dashboard/settings")
                ? theme === 'dark' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-100 text-blue-600'
                : theme === 'dark'
                  ? 'hover:bg-gray-700'
                  : 'hover:bg-gray-100'
            }`}
          >
            <FiSettings className="mr-3" />
            <span>{translations.settings}</span>
          </motion.div>
        </nav>

        <div className="mt-auto">
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className={`flex items-center p-3 rounded-lg cursor-pointer ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <FiLogOut className="mr-3" />
            <span>{translations.logout}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
