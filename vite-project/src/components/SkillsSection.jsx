import React, { useState } from "react";

const SkillsSection = ({ skills, onSkillSelect }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);

  const handleSkillClick = (skill) => {
    let updatedSkills;

    if (selectedSkills.includes(skill)) {
      updatedSkills = selectedSkills.filter((s) => s !== skill);
    } else {
      updatedSkills = [...selectedSkills, skill];
    }

    setSelectedSkills(updatedSkills);
    onSkillSelect(updatedSkills);
  };

  const toggleSelectAll = () => {
    const allSelected = selectedSkills.length === skills.length;
    const updatedSkills = allSelected ? [] : [...skills];

    setSelectedSkills(updatedSkills);
    onSkillSelect(updatedSkills);
  };

  return (
    <div className="skills-section bg-white p-6 rounded-lg shadow-lg border border-purple-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-purple-600">Extracted Skills</h3>
        <button
          onClick={toggleSelectAll}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-300"
        >
          {selectedSkills.length === skills.length ? "Deselect All" : "Select All"}
        </button>
      </div>

      {/* Skills List */}
      <div className="flex flex-wrap gap-3">
        {skills.map((skill, index) => (
          <div
            key={index}
            className={`skill px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 ${
              selectedSkills.includes(skill)
                ? "bg-purple-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:shadow-md"
            }`}
            onClick={() => handleSkillClick(skill)}
          >
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsSection;
