import React, { useState } from 'react';
import axios from 'axios';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-600 font-medium">Something went wrong</h3>
          <p className="text-red-500 text-sm mt-2">Please try again or contact support if the problem persists.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const ResumeAnalyzer = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setResumeFile(file);
      setError('');
    } else {
      setError('Please upload a PDF or Word document');
      setResumeFile(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearFile = () => {
    setResumeFile(null);
    setError('');
  };

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription) {
      setError('Please upload a resume and provide a job description');
      return;
    }

    setIsLoading(true);
    setError('');
    setAnalysis(null); // Reset analysis before new attempt

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:5000/analyze-resume', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Validate response data
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      setAnalysis(response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.response?.data?.error || 'Failed to analyze resume. Please try again.');
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-purple-600 mb-6">Resume Analyzer</h2>
        
        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Resume (PDF or Word)
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
              isDragging 
                ? 'border-purple-500 bg-purple-50 scale-105' 
                : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <svg 
                className={`w-12 h-12 mb-3 ${isDragging ? 'text-purple-500' : 'text-purple-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm text-gray-600 mb-1">
                {resumeFile ? (
                  <span className="text-purple-600 font-medium">{resumeFile.name}</span>
                ) : (
                  <>
                    <span className="text-purple-600 font-medium">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">PDF or Word document up to 10MB</p>
            </div>
          </div>

          {/* Action Buttons */}
          {resumeFile && (
            <div className="flex gap-3 mt-4">
              <button
                onClick={clearFile}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Remove File
              </button>
            </div>
          )}
        </div>

        {/* Job Description Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500 transition-all duration-300"
            rows="4"
          />
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Analyze Resume'
          )}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <ErrorBoundary>
          <div className="space-y-6">
            {/* ATS Compliance Score */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-purple-600 mb-4">ATS Compliance Score</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      strokeDasharray={`${analysis.atsScore || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">{analysis.atsScore || 0}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {analysis.atsIssues?.map((issue, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    <p className="text-gray-700">{issue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Job Match Score */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-purple-600 mb-4">Job Match Score</h3>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      strokeDasharray={`${analysis.jobMatchScore || 0}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">{analysis.jobMatchScore || 0}%</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matchingSkills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Suggestions */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold text-purple-600 mb-4">Improvement Suggestions</h3>
              <div className="space-y-4">
                {analysis.suggestions?.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <div className="flex-1">
                      <p className="text-gray-700">{item.suggestion}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          item.priority === 'high' 
                            ? 'bg-red-100 text-red-700'
                            : item.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ErrorBoundary>
      )}
    </div>
  );
};

export default ResumeAnalyzer;