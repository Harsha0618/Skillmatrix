// import React, { useState } from "react";
// import axios from "axios";

// const FileUpload = ({ onSkillsExtracted }) => {
//   const [file, setFile] = useState(null);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(false); // Loading state

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//     setError(""); // Clear error when a new file is selected
//   };
  
//   const handleUpload = async () => {
//     if (!file) {
//       setError("Please select a file.");
//       return;
//     }
  
//     setIsLoading(true);
//     setError("");
  
//     const formData = new FormData();
//     formData.append("file", file);
  
//     try {
//       const token = localStorage.getItem("access_token");
//       const response = await axios.post("http://localhost:5000/upload", formData, {
//         headers: { 
//           "Content-Type": "multipart/form-data",
//           "Authorization": `Bearer ${token}`  // Add this line
//         },
//       });
//       onSkillsExtracted(response.data.skills);
//     } catch (error) {
//       console.error("Upload error:", error);
//       setError(error.response?.data?.error || "Failed to upload file. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-lg">
//       <h3 className="text-xl font-bold text-purple-600 mb-4">Upload Your Resume</h3>

//       {/* File Input */}
//       <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-all duration-300 mb-4">
//         <label htmlFor="file-upload" className="text-purple-600 text-sm sm:text-base">
//           {file ? file.name : "Drag & drop your file or click to upload"}
//         </label>
//         <input
//           id="file-upload"
//           type="file"
//           accept=".pdf"
//           onChange={handleFileChange}
//           className="hidden"
//         />
//       </div>

//       {/* Upload Button */}
//       <button
//         onClick={handleUpload}
//         disabled={isLoading || !file} // Disable button when loading or no file is selected
//         className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
//       >
//         {isLoading ? (
//           <>
//             <svg
//               className="animate-spin h-5 w-5 mr-3 text-white"
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               ></circle>
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//               ></path>
//             </svg>
//             Uploading...
//           </>
//         ) : (
//           "Upload"
//         )}
//       </button>

//       {/* Error Message */}
//       {error && (
//         <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
//       )}
//     </div>
//   );
// };

// export default FileUpload;

import React, { useState } from "react";
import axios from "axios";

const FileUpload = ({ onSkillsExtracted }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    const droppedFile = e.dataTransfer.files[0];
    validateFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 transition-all duration-300 mb-4"
      >
        <label htmlFor="file-upload" className="text-purple-600 text-sm sm:text-base text-center">
          {file ? file.name : "Drag & drop your file or click to upload"}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={isLoading || !file}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center"
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
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-all duration-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;
