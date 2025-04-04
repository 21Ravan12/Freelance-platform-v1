"use client";

import { FiMenu, FiSun, FiMoon, FiGlobe, FiBell, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface NavbarProps {
  theme: 'light' | 'dark';
  userRole: string | null;
  unreadCount: number;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  toggleNotifications: () => void;
  notificationsOpen: boolean;
  toggleTheme: () => void;
  language: 'en' | 'tr' | 'az';
  setLanguage: (lang: 'en' | 'tr' | 'az') => void;
}

export const Navbar = ({ 
  theme,
  userRole,
  unreadCount,
  sidebarOpen,
  toggleSidebar,
  toggleNotifications,
  notificationsOpen,
  toggleTheme,
  language,
  setLanguage
}: NavbarProps) => {
  const router = useRouter();

  return (
    <header className={`sticky top-0 z-10 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleSidebar}
            className={`p-2 rounded-md ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FiMenu size={20} />
          </button>
          <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            FreelanceHub
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} relative`}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${theme === 'dark' ? 'text-yellow-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          
          {/* Language Selector */}
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'tr' | 'az')}
              className={`appearance-none py-1 pl-3 pr-8 rounded-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'} cursor-pointer`}
            >
              <option value="en">EN</option>
              <option value="tr">TR</option>
              <option value="az">AZ</option>
            </select>
            <FiGlobe className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`} />
          </div>
          
          {/* User Profile */}
          <div 
            className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center cursor-pointer`}
            onClick={() => router.push("/pages/dashboard/profile")}
          >
            <FiUser className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} />
          </div>
        </div>
      </div>
    </header>
  );
};
