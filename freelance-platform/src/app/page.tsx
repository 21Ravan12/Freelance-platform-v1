"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const MainPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLoginRedirect = () => {
    router.push("/pages/auth/login");
  };

  const handleSignUpRedirect = () => {
    router.push("/pages/auth/signup");
  };

  const handleExploreRedirect = () => {
    router.push("/explore");
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Arka Plan Animasyonu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://www.example.com/background-image.jpg")',
        }}
      ></motion.div>

      {/* Ana İçerik */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-lg p-10 space-y-8 bg-white bg-opacity-90 backdrop-blur-lg rounded-3xl shadow-2xl shadow-blue-500/20"
      >
        {/* Başlık ve Açıklama */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Unlock Your Potential
          </h1>
          <p className="text-lg text-gray-600">
            Connect with top freelancers or find your dream freelance job. Explore
            opportunities that fit your goals.
          </p>
        </div>

        {/* Butonlar */}
        <div className="space-y-4">
          <motion.button
            onClick={handleLoginRedirect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-lg"
          >
            Log In to Your Account
          </motion.button>

          <motion.button
            onClick={handleSignUpRedirect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-lg"
          >
            Start Your Freelance Journey
          </motion.button>

          <motion.button
            onClick={handleExploreRedirect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 text-white bg-gradient-to-r from-pink-600 to-blue-600 rounded-lg hover:from-pink-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-lg"
          >
            Explore Projects & Services
          </motion.button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        {/* Alt Bağlantılar */}
        <div className="mt-8 text-center text-gray-600 text-sm space-y-2">
          <p>
            New to the platform?{" "}
            <span
              onClick={handleSignUpRedirect}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Sign up now
            </span>
          </p>
          <p>
            Forgot your password?{" "}
            <span
              onClick={() => router.push("/pages/auth/resetpasswordsendcode")}
              className="cursor-pointer text-blue-600 hover:underline"
            >
              Reset it here
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default MainPage;