import React, { useState } from "react";
import axios from "axios";

const FileUpload = ({ onSkillsExtracted }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE_MB = 2;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateFile(selectedFile);
  };

  const validateFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      setFile(null);
      return;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setError("File size must be less than 2MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file.");
      return;
    }

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      onSkillsExtracted(response.data.skills);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.response?.data?.error || "Failed to upload file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
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
    setFile(null);
    setError("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-purple-600 mb-4">Upload Your Resume</h3>

      {/* Drag & Drop + File Input */}
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
          id="file-upload"
          type="file"
          accept=".pdf"
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
            {file ? (
              <span className="text-purple-600 font-medium">{file.name}</span>
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
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleUpload}
          disabled={isLoading || !file}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            "Upload"
          )}
        </button>

        {/* Clear File Button */}
        {file && (
          <button
            onClick={clearFile}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-300 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
