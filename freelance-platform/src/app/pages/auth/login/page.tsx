"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); 

    try {
      const response = await fetch("https://localhost:3002/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.token);

      router.push("/pages/dashboard/main");
    } catch (err: any) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-xl shadow-blue-400"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800">Login</h2>
        {error && <p className="text-red-600 text-center font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div whileFocus={{ scale: 1.05 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </motion.div>

          <motion.div whileFocus={{ scale: 1.05 }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            Login
          </motion.button>
        </form>
        
        <div className="text-center">
          <p className="text-sm text-gray-700">
            Don't have an account?{" "}
            <a href="/pages/auth/signup" className="text-indigo-500 hover:underline font-medium">
              Sign up
            </a>
          </p>
          <p className="text-sm text-gray-700">
            Forgot your password?{" "}
            <a href="/pages/auth/resetpasswordsendcode" className="text-indigo-500 hover:underline font-medium">
              Click here to reset it.
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;