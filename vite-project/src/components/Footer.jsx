import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-4 shadow-lg mt-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            © {new Date().getFullYear()} SkillMatrix. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-white hover:text-purple-200 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-white hover:text-purple-200 transition-colors duration-300">
              Terms of Service
            </a>
            <a href="#" className="text-white hover:text-purple-200 transition-colors duration-300">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;