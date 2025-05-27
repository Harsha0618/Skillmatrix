import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ isDashboard = false, userName = "User" }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  if (isDashboard) {
    return (
      <nav className="bg-gradient-to-r from-purple-700 to-indigo-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 text-white rounded-lg px-4 py-2 transition-all duration-500 hover:bg-gradient-to-r hover:from-pink-800 hover:to-purple-800 hover:shadow-xl hover:-translate-y-1 hover:scale-105"
              >
                SkillMatrix
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-white font-medium">
                Welcome, <span className="text-purple-200 font-semibold">{userName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-white hover:text-purple-200 transition-all duration-300 cursor-pointer"
              >
                Logout
              </button>
              <button
                className="text-white hover:text-purple-200 transition-all duration-300 cursor-pointer"
                aria-label="Toggle dark mode"
              >
                <i className="fas fa-moon"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-800 to-pink-800 text-white rounded-lg px-4 py-2 transition-all duration-500 hover:bg-gradient-to-r hover:from-pink-800 hover:to-purple-800 hover:shadow-lg hover:-translate-y-1"
            >
              SkillMatrix
            </Link>
          </div>

          {/* Menu for larger screens */}
          <div className="hidden sm:flex sm:items-center space-x-4">
            <Link
              to="/"
              className="text-white hover:text-purple-300 px-3 py-2 text-sm font-medium transition-all duration-300"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="text-white hover:text-purple-300 px-3 py-2 text-sm font-medium transition-all duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-white hover:text-purple-300 px-3 py-2 text-sm font-medium transition-all duration-300"
            >
              Signup
            </Link>
          </div>

          {/* Menu button for smaller screens */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-purple-200 focus:outline-none transition-all duration-300"
            >
              {/* Menu Icon (Text-based) */}
              <span className="text-lg font-bold">☰</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block text-white hover:text-purple-200 px-3 py-2 text-base font-medium transition-all duration-300"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/login"
              className="block text-white hover:text-purple-200 px-3 py-2 text-base font-medium transition-all duration-300"
              onClick={toggleMenu}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block text-white hover:text-purple-200 px-3 py-2 text-base font-medium transition-all duration-300"
              onClick={toggleMenu}
            >
              Signup
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;