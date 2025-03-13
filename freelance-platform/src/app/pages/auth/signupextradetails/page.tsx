"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Select, { MultiValue, GroupBase } from 'react-select';

interface OptionType {
  value: string;
  label: string;
}

interface FormData {
  userType: string;
  bio: string;
  skills: OptionType[];
  portfolioURL: string;
  socialLinks: string;
  experienceLevel: string;
  companyName: string;
  companyWebsite: string;
  companyBio: string;
  jobCategories: string;
  hourlyRate: { amount: string; currency: string };
  location: string;
}

const ExtraDetails = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    userType: "freelancer",
    bio: "",
    skills: [], // Boş dizi olarak tanımlı
    portfolioURL: "",
    socialLinks: "",
    experienceLevel: "Junior",
    companyName: "",
    companyWebsite: "",
    companyBio: "",
    jobCategories: "",
    hourlyRate: { amount: "", currency: "USD" },
    location: "",
  });

  const skillsOptions: OptionType[] = [
    { value: 'JavaScript', label: 'JavaScript' },
    { value: 'React', label: 'React' },
    { value: 'Node.js', label: 'Node.js' },
    { value: 'Python', label: 'Python' },
    { value: 'HTML', label: 'HTML' },
    { value: 'CSS', label: 'CSS' },
    { value: 'TypeScript', label: 'TypeScript' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData({ ...formData, userType: value });
  };

  const handleSkillsChange = (selectedOptions: MultiValue<OptionType>) => {
    setFormData({ ...formData, skills: [...selectedOptions] });
  };

  const handleHourlyRateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      hourlyRate: {
        ...formData.hourlyRate,
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (
      formData.userType === "freelancer" &&
      (!formData.bio || !formData.skills?.length || !formData.hourlyRate.amount || !formData.location)
    ) {
      setError("Bio, Skills, Hourly Rate, and Location are required for freelancers.");
      return;
    }

    console.log(formData.skills);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token is missing");
        return;
      }

      const response = await fetch("https://localhost:3002/api/signup/saveDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills, 
          hourlyRate: {
            amount: parseFloat(formData.hourlyRate.amount),
            currency: formData.hourlyRate.currency
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      console.log("API Response:", result);

      router.push("/pages/auth/login");
    } catch (err) {
      console.error("Error submitting details", err);
      if (err instanceof Error) {
        setError(err.message || "An error occurred while submitting details.");
      } else {
        setError("An error occurred while submitting details.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl shadow-blue-400"
      >
        <h2 className="text-3xl font-semibold text-center text-gray-800">Extra Details</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">User Type</label>
          <select
            value={formData.userType}
            onChange={handleUserTypeChange}
            className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="freelancer">Freelancer</option>
            <option value="employer">Employer</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.userType === "freelancer" ? (
            <>
              {['bio', 'portfolioURL', 'socialLinks', 'location'].map((field) => (
                <motion.div key={field} whileFocus={{ scale: 1.05 }}>
                  <input
                    type={field === 'portfolioURL' ? 'url' : 'text'}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, ' $1')}
                    value={formData[field as keyof typeof formData] as string}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </motion.div>
              ))}

              <motion.div whileFocus={{ scale: 1.05 }}>
                <div className="flex gap-2">
                  <input
                    type="number"
                    name="amount"
                    placeholder="Hourly Rate"
                    value={formData.hourlyRate.amount}
                    onChange={handleHourlyRateChange}
                    className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                  <select
                    name="currency"
                    value={formData.hourlyRate.currency}
                    onChange={handleHourlyRateChange}
                    className="w-1/3 px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="AZN">AZN (₼)</option>
                  </select>
                </div>
              </motion.div>

              <motion.div whileFocus={{ scale: 1.05 }}>
                <Select
                  isMulti
                  name="skills"
                  options={skillsOptions}
                  value={formData.skills}
                  onChange={handleSkillsChange}
                  placeholder="Select skills..."
                  className="w-full text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  classNamePrefix="select"
                />
              </motion.div>

              <motion.div whileFocus={{ scale: 1.05 }}>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                </select>
              </motion.div>
            </>
          ) : (
            <>
              {['companyName', 'companyWebsite', 'companyBio', 'jobCategories'].map((field) => (
                <motion.div key={field} whileFocus={{ scale: 1.05 }}>
                  <input
                    type={field === 'companyWebsite' ? 'url' : 'text'}
                    name={field}
                    placeholder={field.replace(/([A-Z])/g, ' $1')}
                    value={formData[field as keyof typeof formData] as string}
                    onChange={handleChange}
                    className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </motion.div>
              ))}
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            Submit
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default ExtraDetails;