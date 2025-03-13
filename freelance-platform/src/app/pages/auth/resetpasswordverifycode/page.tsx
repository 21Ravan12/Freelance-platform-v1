"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const ResetPasswordVerifyCode = () => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("resetToken"); 

      const response = await fetch("https://localhost:3002/api/resetPassword/verifyCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Token'i gönder
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification code invalid");
      }

      router.push("/pages/auth/resetpassword");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Verification code invalid");
      } else {
        setError("Verification code invalid");
      }
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
        <h2 className="text-3xl font-semibold text-center text-gray-800">Verify Reset Password Code</h2>
        {error && <p className="text-red-600 text-center font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div whileFocus={{ scale: 1.05 }}>
            <input
              type="text"
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
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
            Verify Code
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordVerifyCode;
