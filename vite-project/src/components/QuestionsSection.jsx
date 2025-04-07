// import React, { useState } from "react";
// import axios from "axios";

// const QuestionsSection = ({ selectedSkills }) => {
//   const [difficulty, setDifficulty] = useState("medium");
//   const [questions, setQuestions] = useState([]);

//   const fetchQuestions = async () => {
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await axios.post(
//         "http://localhost:5000/generate", 
//         {
//           skills: selectedSkills,
//           difficulty,
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
//       setQuestions(response.data.questions);
//     } catch (error) {
//       console.error("Failed to fetch questions:", error);
//       if (error.response?.status === 401) {
//         console.error("Unauthorized - Please login again");
//         // Optionally redirect to login page
//       }
//     }
//   };

//   return (
//     <div className="questions-section bg-white p-6 rounded-lg shadow-lg border border-purple-100">
//       <h3 className="text-2xl font-bold text-purple-600 mb-6">
//         Generated Questions
//       </h3>

//       {/* Difficulty Selector */}
//       <div className="difficulty-selector mb-6 flex items-center">
//         <label className="text-gray-700 font-medium mr-2">Difficulty:</label>
//         <select
//           value={difficulty}
//           onChange={(e) => setDifficulty(e.target.value)}
//           className="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
//         >
//           <option value="easy">Easy</option>
//           <option value="medium">Medium</option>
//           <option value="hard">Hard</option>
//         </select>
//          
//       </div>

//       {/* Generated Questions List */}
//       <ul className="space-y-4">
//         {questions.map((question, index) => (
//           <li
//             key={index}
//             className="p-4 bg-purple-50 rounded-lg border border-purple-100 hover:shadow-md transition-all duration-300"
//           >
//             <strong className="text-purple-600 font-semibold">
//               {question.skill}:
//             </strong>{" "}
//             <span className="text-gray-700">{question.question}</span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default QuestionsSection;

// import React, { useState } from "react";
// import axios from "axios";

// const QuestionsSection = ({ selectedSkills }) => {
//   const [difficulty, setDifficulty] = useState("medium");
//   const [questions, setQuestions] = useState([]);
//   const [userAnswers, setUserAnswers] = useState({});
//   const [gradingResults, setGradingResults] = useState({});
//   const [correctAnswers, setCorrectAnswers] = useState({});

//   const fetchQuestions = async () => {
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await axios.post(
//         "http://localhost:5000/generate",
//         { skills: selectedSkills, difficulty },
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );
//       setQuestions(response.data.questions);
//       setUserAnswers({});
//       setGradingResults({});
//     } catch (error) {
//       console.error("Failed to fetch questions:", error);
//     }
//   };

//   const handleAnswerChange = (questionId, answer) => {
//     setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
//   };

//   const submitAnswer = async (questionId, questionText) => {
//     try {
//       const token = localStorage.getItem('access_token');
//       const response = await axios.post(
//         "http://localhost:5000/grade-answer",
//         {
//           question: questionText,
//           userAnswer: userAnswers[questionId],
//           skill: questions.find(q => q.id === questionId)?.skill
//         },
//         { headers: { 'Authorization': `Bearer ${token}` } }
//       );

//       setGradingResults(prev => ({
//         ...prev,
//         [questionId]: response.data.feedback
//       }));

//       setCorrectAnswers(prev => ({
//         ...prev,
//         [questionId]: response.data.correctAnswer
//       }));
//     } catch (error) {
//       console.error("Grading error:", error);
//     }
//   };

//   return (
//     <div className="questions-section bg-white p-6 rounded-lg shadow-lg border border-purple-100">
//       <h3 className="text-2xl font-bold text-purple-600 mb-6">
//         Generated Questions
//       </h3>

//       <div className="difficulty-selector mb-6 flex items-center">
//         <label className="text-gray-700 font-medium mr-2">Difficulty:</label>
//         <select
//           value={difficulty}
//           onChange={(e) => setDifficulty(e.target.value)}
//           className="px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all duration-300"
//         >
//           <option value="easy">Easy</option>
//           <option value="medium">Medium</option>
//           <option value="hard">Hard</option>
//         </select>
//         <button
//           onClick={fetchQuestions}
//           className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300"
//         >
//           Generate Questions
//         </button>
//       </div>

//       <ul className="space-y-6">
//         {questions.map((question, index) => (
//           <li key={index} className="p-4 bg-purple-50 rounded-lg border border-purple-100">
//             <div className="mb-3">
//               <strong className="text-purple-600 font-semibold">
//                 {question.skill} ({question.difficulty}):
//               </strong>{" "}
//               <span className="text-gray-700">{question.question}</span>
//             </div>

//             <div className="mb-3">
//               <textarea
//                 value={userAnswers[question.id] || ''}
//                 onChange={(e) => handleAnswerChange(question.id, e.target.value)}
//                 className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
//                 placeholder="Type your answer here..."
//                 rows={3}
//               />
//             </div>

//             <button
//               onClick={() => submitAnswer(question.id, question.question)}
//               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300"
//             >
//               Submit Answer
//             </button>

//             {gradingResults[question.id] && (
//               <div className="mt-3 p-3 bg-blue-50 rounded-lg">
//                 <h4 className="font-bold text-blue-600">Feedback:</h4>
//                 <p>{gradingResults[question.id]}</p>
//               </div>
//             )}

//             {correctAnswers[question.id] && (
//               <div className="mt-3 p-3 bg-green-50 rounded-lg">
//                 <h4 className="font-bold text-green-600">Correct Answer:</h4>
//                 <p>{correctAnswers[question.id]}</p>
//               </div>
//             )}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default QuestionsSection;
import React, { useState } from "react";
import axios from "axios";

const QuestionsSection = ({ selectedSkills }) => {
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [gradingResults, setGradingResults] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [showAnswerBox, setShowAnswerBox] = useState({});
  const [expandedFeedback, setExpandedFeedback] = useState({});

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.post("http://localhost:5000/generate", {
        skills: selectedSkills,
        difficulty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updated = res.data.questions.map((q, i) => ({
        ...q,
        id: `${q.skill}-${i}-${Math.random().toString(36).slice(2)}`
      }));

      setQuestions(updated);
      setUserAnswers({});
      setGradingResults({});
      setCorrectAnswers({});
      setSubmittedAnswers({});
      setShowAnswerBox({});
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleAnswerChange = (id, value) => {
    setUserAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const submitAnswer = async (id, questionText) => {
    const questionObj = questions.find((q) => q.id === id);
    const token = localStorage.getItem("access_token");

    try {
      const res = await axios.post("http://localhost:5000/grade-answer", {
        question: questionText,
        userAnswer: userAnswers[id],
        skill: questionObj.skill
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setGradingResults((prev) => ({
        ...prev,
        [id]: {
          grade: res.data.grade,
          strengths: res.data.strengths,
          weaknesses: res.data.weaknesses,
          suggestions: res.data.suggestions
        }
      }));

      setCorrectAnswers((prev) => ({ ...prev, [id]: res.data.correctAnswer }));
      setSubmittedAnswers((prev) => ({ ...prev, [id]: true }));
    } catch (err) {
      console.error("Grading error:", err);
    }
  };

  const toggleAnswerBox = (id) =>
    setShowAnswerBox((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleFeedback = (id) =>
    setExpandedFeedback((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="questions-section bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-purple-700 mb-6">Generated Questions</h3>

      <div className="mb-6 flex items-center">
        <label className="mr-2 text-gray-700">Difficulty:</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-3 py-2 border rounded-lg focus:ring-purple-600"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button
          onClick={fetchQuestions}
          className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all duration-300"
        >
          Generate Questions
        </button>
        {/* <button
          onClick={fetchQuestions}
          className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg"
        >
          Generate Questions
        </button> */}
      </div>

      <ul className="space-y-6">
        {questions.map((q) => (
          <li key={q.id} className="p-4 bg-purple-50  rounded-lg">
            <div className="mb-2">
              <strong className="text-purple-600">{q.skill} ({q.difficulty}):</strong>{" "}
              <span className="text-gray-700">{q.question}</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => toggleAnswerBox(q.id)}
                className={`w-fit px-4 py-2 rounded-lg text-white transition ${
                  showAnswerBox[q.id] ? "bg-gray-600" : "bg-blue-600"
                }`}
              >
                {showAnswerBox[q.id] ? "Hide" : "Answer"}
              </button>

              {showAnswerBox[q.id] && (
                <div>
                  <textarea
                    value={userAnswers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="w-full mt-3 px-3 py-2 border rounded-lg focus:ring-purple-600"
                    placeholder="Type your answer..."
                    rows={4}
                  />
                  <button
                    onClick={() => submitAnswer(q.id, q.question)}
                    disabled={submittedAnswers[q.id]}
                    className={`mt-2 px-4 py-2 rounded-lg text-white transition ${
                      submittedAnswers[q.id]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {submittedAnswers[q.id] ? "Submitted" : "Submit Answer"}
                  </button>
                </div>
              )}

              {gradingResults[q.id] && (
                <div className="mt-3 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <div
                    className="cursor-pointer text-blue-600 font-semibold"
                    onClick={() => toggleFeedback(q.id)}
                  >
                    Feedback ({gradingResults[q.id].grade}){" "}
                    <span className="text-sm">
                      [{expandedFeedback[q.id] ? "Hide" : "Show"}]
                    </span>
                  </div>

                  {expandedFeedback[q.id] && (
                    <div className="mt-2 space-y-2 text-sm text-gray-700">
                      <div>
                        <strong>Strengths:</strong>
                        <ul className="list-disc ml-6">
                          {gradingResults[q.id].strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Weaknesses:</strong>
                        <ul className="list-disc ml-6">
                          {gradingResults[q.id].weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Suggestions:</strong>
                        <ul className="list-disc ml-6">
                          {gradingResults[q.id].suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {correctAnswers[q.id] && (
                <div className="mt-2 bg-green-50 border border-green-200 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-600">Correct Answer:</h4>
                  <p className="text-gray-700 text-sm">{correctAnswers[q.id]}</p>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionsSection;
