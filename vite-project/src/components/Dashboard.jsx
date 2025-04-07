import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import SkillsSection from "./SkillsSection";
import QuestionsSection from "./QuestionsSection";

const Dashboard = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 text-white rounded-lg px-4 py-2 transition-all duration-500 hover:bg-gradient-to-r hover:from-pink-800 hover:to-purple-800 hover:shadow-xl hover:-translate-y-1 hover:scale-105"
              >
                SkillMatrix
              </Link>
            </div>

            {/* Menu for larger screens */}
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-white hover:text-purple-200 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-purple-700 hover:shadow-sm"
              >
                Home
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:text-purple-200 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 hover:bg-purple-700 hover:shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Tips for Success */}
          <div className="hidden lg:block relative">
            <div className="bg-white h-[300px] rounded-2xl shadow-lg p-6 border border-purple-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <h2 className="text-xl font-bold text-purple-600 mb-4">
                Tips for Success
              </h2>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="mr-2 text-purple-600">👉</span>
                  <span className="text-gray-700">Practice regularly.</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-purple-600">👉</span>
                  <span className="text-gray-700">Focus on your weak areas.</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-purple-600">👉</span>
                  <span className="text-gray-700">Stay confident and calm.</span>
                </li>
              </ul>
            </div>

            {/* Right Side - Did You Know? (Fixed below Tips for Success) */}
            <div className="absolute top-[320px] w-full">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <h2 className="text-xl font-bold text-purple-600 mb-4">
                  Did You Know?
                </h2>
                <p className="text-gray-700">
                  Tailwind CSS makes it easy to create responsive and modern designs
                  without writing custom CSS.
                </p>
              </div>
            </div>
          </div>

          {/* Middle - Main Functionality */}
          <div className="col-span-2 min-h-[400px]">
            <h1 className="text-3xl sm:text-4xl font-bold text-purple-600 mb-8">
              Welcome to Your Dashboard
            </h1>

            {/* File Upload Section */}
            <div className="mb-8">
              <FileUpload onSkillsExtracted={setSkills} />
            </div>

            {/* Skills Section */}
            {skills.length > 0 && (
              <div className="mb-8">
                <SkillsSection skills={skills} onSkillSelect={setSelectedSkills} />
              </div>
            )}

            {/* Questions Section */}
            {selectedSkills.length > 0 && (
              <div className="mb-8">
                <QuestionsSection selectedSkills={selectedSkills} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600 to-pink-600 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-white text-sm">
            &copy; 2025 SkillMatrix. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;