import React from "react";

const Sidebar = ({ activeSection, setActiveSection }) => {
  const menuItems = [
    { id: "generator", label: "Question Generator", icon: "📝" },
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "resume-analyzer", label: "Resume Analyzer", icon: "📊" },
  ];

  return (
    <nav className="space-y-3">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveSection(item.id)}
          className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 cursor-pointer ${
            activeSection === item.id
              ? "bg-purple-500 text-white"
              : "text-gray-700 hover:bg-purple-100"
          }`}
        >
          <span className="mr-3 text-lg">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default Sidebar;