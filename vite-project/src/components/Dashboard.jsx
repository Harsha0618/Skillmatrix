import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import SkillsSection from "./SkillsSection";
import QuestionsSection from "./QuestionsSection";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import axios from "axios";
import ResumeAnalyzer from "./ResumeAnalyzer";

const Dashboard = () => {
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [activeSection, setActiveSection] = useState("generator");
  const [useResume, setUseResume] = useState(true);
  const [jobDescription, setJobDescription] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [questionTypes, setQuestionTypes] = useState({
    technical: true,
    behavioral: true,
    situational: false
  });
  const [additionalSkills, setAdditionalSkills] = useState("");
  const [userName, setUserName] = useState("User");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:5000/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserName(response.data.name);
      
      // Redirect admin users to admin dashboard
      if (response.data.role === 'admin') {
        navigate('/admin-dashboard');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleQuestionTypeChange = (type) => {
    setQuestionTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const addCustomSkill = () => {
    if (additionalSkills.trim() && !selectedSkills.includes(additionalSkills.trim())) {
      setSelectedSkills([...selectedSkills, additionalSkills.trim()]);
      setAdditionalSkills("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-pink-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar isDashboard={true} userName={userName} handleLogout={handleLogout} />
      </div>
      
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Hidden on mobile, visible on larger screens */}
        <div className="hidden md:block fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white shadow-xl border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-xl font-bold text-purple-600 mb-6 px-4">Dashboard</h2>
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden fixed top-20 left-4 z-40 p-2 rounded-md bg-purple-600 text-white"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden fixed inset-0 z-30 bg-black bg-opacity-50">
            <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-purple-600">Dashboard</h2>
                  <button 
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 md:ml-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeSection === "generator" && (
              <GeneratorSection 
                useResume={useResume}
                setUseResume={setUseResume}
                skills={skills}
                setSkills={setSkills}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                experienceLevel={experienceLevel}
                setExperienceLevel={setExperienceLevel}
                questionTypes={questionTypes}
                setQuestionTypes={setQuestionTypes}
                additionalSkills={additionalSkills}
                setAdditionalSkills={setAdditionalSkills}
                addCustomSkill={addCustomSkill}
                handleQuestionTypeChange={handleQuestionTypeChange}
              />
            )}
            
            {activeSection === "profile" && (
              <>
                <ProfileSection />
                <HistorySection />
              </>
            )}
            
            {activeSection === "resume-analyzer" && (
              <ResumeAnalyzer />
            )}
          </div>
        </div>
      </div>
      <div className="w-full z-30">
        <Footer />
      </div>
    </div>
  );
};

const GeneratorSection = ({
  useResume, setUseResume, skills, setSkills, selectedSkills, setSelectedSkills,
  jobDescription, setJobDescription, experienceLevel, setExperienceLevel,
  questionTypes, setQuestionTypes, additionalSkills, setAdditionalSkills, 
  addCustomSkill, handleQuestionTypeChange
}) => {
  return (
    <>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-4 sm:mb-8">
        Generate Interview Questions
      </h1>
      <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
        Customize your interview questions based on job role and experience level.
      </p>

      {/* Resume Upload Section */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <span className="text-sm sm:text-base">Source of skills:</span>
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setUseResume(true)}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-l-lg cursor-pointer transition-all duration-300 ${
                useResume
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-600 hover:bg-gray-50"
              }`}
            >
              Upload Resume/CV
            </button>
            <button
              onClick={() => setUseResume(false)}
              className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-r-lg cursor-pointer transition-all duration-300 ${
                !useResume
                  ? "bg-purple-600 text-white"
                  : "bg-white text-purple-600 hover:bg-gray-50"
              }`}
            >
              Select Skills Manually
            </button>
          </div>
        </div>

        {useResume ? (
          <FileUpload onSkillsExtracted={setSkills} />
        ) : (
          <ManualSkillsSelection 
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            additionalSkills={additionalSkills}
            setAdditionalSkills={setAdditionalSkills}
            addCustomSkill={addCustomSkill}
          />
        )}
      </div>

      {/* Skills Display Section */}
      <div className="mb-6 sm:mb-8 bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-purple-600">Skills</h3>
          {useResume && skills.length > 0 && (
            <button
              onClick={() => setSelectedSkills(skills)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 cursor-pointer text-sm sm:text-base"
            >
              Select All Skills
            </button>
          )}
        </div>

        {/* Extracted Skills */}
        {useResume && skills.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Extracted Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm cursor-pointer transition-all duration-300 ${
                    selectedSkills.includes(skill)
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                  }`}
                  onClick={() => {
                    if (selectedSkills.includes(skill)) {
                      setSelectedSkills(selectedSkills.filter(s => s !== skill));
                    } else {
                      setSelectedSkills([...selectedSkills, skill]);
                    }
                  }}
                >
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Skills */}
        <div>
          <h4 className="text-base sm:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">Selected Skills</h4>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.length > 0 ? (
              selectedSkills.map((skill, index) => (
                <div
                  key={index}
                  className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                    className="text-purple-500 hover:text-purple-700 cursor-pointer transition-all duration-300"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic text-sm sm:text-base">No skills selected yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Job Description and Settings Section */}
      <JobDescriptionSection 
        jobDescription={jobDescription}
        setJobDescription={setJobDescription}
        experienceLevel={experienceLevel}
        setExperienceLevel={setExperienceLevel}
        questionTypes={questionTypes}
        setQuestionTypes={setQuestionTypes}
        handleQuestionTypeChange={handleQuestionTypeChange}
      />

      {/* Questions Section */}
      <div className="mb-6 sm:mb-8">
        <QuestionsSection 
          selectedSkills={selectedSkills}
          jobDescription={jobDescription}
          experienceLevel={experienceLevel}
          questionTypes={questionTypes}
        />
      </div>
    </>
  );
};

const ManualSkillsSelection = ({
  selectedSkills,
  setSelectedSkills,
  additionalSkills,
  setAdditionalSkills,
  addCustomSkill
}) => {
  const predefinedSkills = [
    "Python", "JavaScript", "Java", "C++", "C#",
    "React", "Angular", "Vue.js", "Node.js",
    "Django", "Flask", "Spring Boot",
    "SQL", "MongoDB", "PostgreSQL",
    "AWS", "Azure", "Docker", "Kubernetes",
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch",
    "Data Structures", "Algorithms",
    "Git", "CI/CD", "REST API", "GraphQL",
    "System Design", "Microservices", "Cloud Computing",
    "DevOps", "Linux", "Networking", "Security"
  ];

  const handlePredefinedSkillClick = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-purple-600 mb-4">Add Skills Manually</h3>
      
      {/* Predefined Skills */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Predefined Skills</h4>
        <div className="flex flex-wrap gap-2">
          {predefinedSkills.map((skill, index) => (
            <div
              key={index}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-all duration-300 ${
                selectedSkills.includes(skill)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-purple-100"
              }`}
              onClick={() => handlePredefinedSkillClick(skill)}
            >
              {skill}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Skill Input */}
      <div>
        <h4 className="text-lg font-semibold text-gray-700 mb-3">Add Custom Skill</h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={additionalSkills}
            onChange={(e) => setAdditionalSkills(e.target.value)}
            placeholder="Enter a custom skill"
            className="flex-1 p-2 border border-gray-300 rounded-l-lg"
            onKeyDown={(e) => e.key === "Enter" && addCustomSkill()}
          />
          <button 
            onClick={addCustomSkill}
            className="p-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 cursor-pointer transition-all duration-300"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

const JobDescriptionSection = ({
  jobDescription, setJobDescription,
  experienceLevel, setExperienceLevel,
  questionTypes, setQuestionTypes, handleQuestionTypeChange
}) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-bold text-purple-600 mb-4">Job Description & Settings</h3>
      
      <div className="space-y-4 sm:space-y-6">
        {/* Job Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            rows="4"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Experience Level Selection */}
          <div className="bg-gray p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            >
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="executive">Executive Level</option>
            </select>
          </div>

          {/* Question Types Selection */}
          <div className="bg-gray p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Types
            </label>
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center p rounded-lg hover:bg-white transition-all duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionTypes.technical}
                  onChange={() => handleQuestionTypeChange("technical")}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm sm:text-base text-gray-700">Technical Questions</span>
              </label>
              <label className="flex items-center p rounded-lg hover:bg-white transition-all duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionTypes.behavioral}
                  onChange={() => handleQuestionTypeChange("behavioral")}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm sm:text-base text-gray-700">Behavioral Questions</span>
              </label>
              <label className="flex items-center p rounded-lg hover:bg-white transition-all duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={questionTypes.situational}
                  onChange={() => handleQuestionTypeChange("situational")}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm sm:text-base text-gray-700">Situational Questions</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SelectedSkillsPreview = ({ selectedSkills }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-xl font-semibold text-purple-600 mb-4">Selected Skills</h3>
      <div className="flex flex-wrap gap-2">
        {selectedSkills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const ProfileSection = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:5000/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('User data:', response.data); // Debug log
      setUserData(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        password: ''
      });
    } catch (error) {
      console.error('Error fetching user data:', error); // Debug log
      setError('Failed to fetch user data');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.put('http://localhost:5000/update-profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setUserData(response.data.user);
    } catch (error) {
      console.error('Error updating profile:', error); // Debug log
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userData) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-purple-600">Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 cursor-pointer text-sm sm:text-base"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm sm:text-base">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm sm:text-base">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm sm:text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={!isEditing}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 text-sm sm:text-base"
          />
        </div>
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (leave blank to keep current)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
            />
          </div>
        )}
        {isEditing && (
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </button>
        )}
      </form>

      <div className="mt-6 sm:mt-8">
        <h3 className="text-lg sm:text-xl font-semibold text-purple-600 mb-4">Skills from Resume</h3>
        <div className="flex flex-wrap gap-2">
          {userData.skills && userData.skills.length > 0 ? (
            userData.skills.map((skill, index) => (
              <span
                key={index}
                className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm"
              >
                {skill}
              </span>
            ))
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">No skills found. Upload a resume to extract skills.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const HistorySection = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('http://localhost:5000/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('History data:', response.data); // Debug log
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching history:', error); // Debug log
      setError('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mt-6 sm:mt-8">
      <h2 className="text-xl sm:text-2xl font-bold text-purple-600 mb-4 sm:mb-6">Question History</h2>
      
      {userData.saved_questions && userData.saved_questions.length > 0 ? (
        <div className="space-y-4">
          {userData.saved_questions.map((question, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm">
                  {question.skill}
                </span>
                <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm">
                  {question.difficulty}
                </span>
              </div>
              <p className="text-gray-700 mb-2 text-sm sm:text-base">{question.question}</p>
              <div className="text-xs sm:text-sm text-gray-600">
                <p><strong>Type:</strong> {question.type}</p>
                <p><strong>Saved on:</strong> {new Date(question.saved_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center text-sm sm:text-base">No saved questions yet. Generate and save questions to see them here.</p>
      )}
    </div>
  );
};

export default Dashboard;