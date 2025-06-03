import React, { useState, useEffect } from "react";
import axios from "axios";

const QuestionsSection = ({ selectedSkills, jobDescription, experienceLevel, questionTypes }) => {
  const [difficulty, setDifficulty] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [gradingResults, setGradingResults] = useState({});
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [showAnswerBox, setShowAnswerBox] = useState({});
  const [expandedFeedback, setExpandedFeedback] = useState({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState({});
  const [modelAnswers, setModelAnswers] = useState({});
  const [isLoadingAnswer, setIsLoadingAnswer] = useState({});
  const [isListening, setIsListening] = useState({});
  const [recognition, setRecognition] = useState(null);
  const [savedQuestions, setSavedQuestions] = useState({});
  const [isSaving, setIsSaving] = useState({});

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      setRecognition(recognition);
    }
  }, []);

  const startListening = (id) => {
    if (!recognition) {
      setError("Speech recognition is not supported in your browser.");
      return;
    }

    setIsListening(prev => ({ ...prev, [id]: true }));
    
    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      
      if (event.results[current].isFinal) {
        setUserAnswers(prev => ({
          ...prev,
          [id]: (prev[id] || '') + ' ' + transcript
        }));
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(prev => ({ ...prev, [id]: false }));
      setError("Error with speech recognition. Please try again.");
    };

    recognition.start();
  };

  const stopListening = (id) => {
    if (recognition) {
      recognition.stop();
      setIsListening(prev => ({ ...prev, [id]: false }));
    }
  };

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("access_token");
      const res = await axios.post("http://localhost:5000/generate", {
        skills: selectedSkills,
        jobDescription,
        experienceLevel,
        questionTypes,
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
      setError(err.response?.data?.error || "Failed to generate questions. Please try again.");
    } finally {
      setIsLoading(false);
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

  const fetchModelAnswer = async (id, question, skill, difficulty) => {
    try {
      setIsLoadingAnswer(prev => ({ ...prev, [id]: true }));
      const token = localStorage.getItem("access_token");
      const res = await axios.post("http://localhost:5000/get-answer", {
        question,
        skill,
        difficulty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setModelAnswers(prev => ({ ...prev, [id]: res.data.answer }));
      setShowModelAnswer(prev => ({ ...prev, [id]: true }));
      setShowAnswerBox(prev => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error("Error fetching model answer:", err);
      setError("Failed to fetch model answer. Please try again.");
    } finally {
      setIsLoadingAnswer(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleModelAnswer = (id) => {
    setShowModelAnswer(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveQuestion = async (question) => {
    try {
      setIsSaving(prev => ({ ...prev, [question.id]: true }));
      const token = localStorage.getItem('access_token');
      await axios.post('http://localhost:5000/save-question', {
        question: question.question,
        skill: question.skill,
        type: question.type,
        difficulty: question.difficulty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedQuestions(prev => ({ ...prev, [question.id]: true }));
    } catch (error) {
      console.error('Error saving question:', error);
      setError('Failed to save question');
    } finally {
      setIsSaving(prev => ({ ...prev, [question.id]: false }));
    }
  };

  return (
    <div className="questions-section bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-purple-700 mb-6">Generated Questions</h3>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-700 font-medium">Experience Level:</span>
              <span className="ml-2 text-purple-600">{experienceLevel}</span>
            </div>
            <div>
              <span className="text-gray-700 font-medium">Question Types:</span>
              <span className="ml-2 text-purple-600">
                {Object.entries(questionTypes)
                  .filter(([_, value]) => value)
                  .map(([key]) => key)
                  .join(", ")}
              </span>
            </div>
            <div>
              <label className="text-gray-700 font-medium mr-2">Difficulty:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:ring-purple-600"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <button
            onClick={fetchQuestions}
            disabled={(!jobDescription && selectedSkills.length === 0) || isLoading}
            className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${
              (!jobDescription && selectedSkills.length === 0) || isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              "Generate Questions"
            )}
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        {jobDescription && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-gray-700 font-medium mb-2">Job Description:</h4>
            <p className="text-gray-600">{jobDescription}</p>
          </div>
        )}
        {selectedSkills.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-gray-700 font-medium mb-2">Selected Skills:</h4>
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
        )}
      </div>

      {questions.length > 0 ? (
        <ul className="space-y-6">
          {questions.map((q) => (
            <li key={q.id} className="p-6 bg-purple-50 rounded-lg">
              <div className="mb-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                      {q.skill}
                    </span>
                    <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
                      {q.difficulty}
                    </span>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                      {q.type}
                    </span>
                  </div>
                  <button
                    onClick={() => saveQuestion(q)}
                    disabled={savedQuestions[q.id] || isSaving[q.id]}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                      savedQuestions[q.id] || isSaving[q.id]
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700 cursor-pointer"
                    }`}
                  >
                    {isSaving[q.id] ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : savedQuestions[q.id] ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Saved
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Save
                      </>
                    )}
                  </button>
                </div>
                
                <p className="text-gray-700 text-base mb-2">{q.question}</p>
              </div>

              <div className="flex justify-end gap-2 mb-2">
                <button
                  onClick={() => toggleAnswerBox(q.id)}
                  disabled={showModelAnswer[q.id]}
                  className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${
                    showModelAnswer[q.id]
                      ? "bg-gray-400 cursor-not-allowed"
                      : showAnswerBox[q.id]
                        ? "bg-gray-600 hover:bg-gray-700 cursor-pointer"
                        : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {showAnswerBox[q.id] ? "Hide" : "Answer"}
                </button>
                <button
                  onClick={() => showModelAnswer[q.id] ? toggleModelAnswer(q.id) : fetchModelAnswer(q.id, q.question, q.skill, q.difficulty)}
                  disabled={isLoadingAnswer[q.id]}
                  className={`px-4 py-2 rounded-lg text-white transition flex items-center gap-2 ${
                    isLoadingAnswer[q.id]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
                  }`}
                >
                  {isLoadingAnswer[q.id] ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    showModelAnswer[q.id] ? "Hide Answer" : "Show Answer"
                  )}
                </button>
                
              </div>

              <div className="space-y-4">
                {showAnswerBox[q.id] && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="relative">
                      <textarea
                        value={userAnswers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-purple-600 pr-12"
                        placeholder="Type your answer..."
                        rows={4}
                      />
                      <button
                        onClick={() => isListening[q.id] ? stopListening(q.id) : startListening(q.id)}
                        className={`absolute right-2 top-2 p-2 rounded-full transition-colors cursor-pointer ${
                          isListening[q.id]
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-purple-500 hover:bg-purple-600"
                        }`}
                        title={isListening[q.id] ? "Stop recording" : "Start recording"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          {isListening[q.id] ? (
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                              clipRule="evenodd"
                            />
                          ) : (
                            <path
                              fillRule="evenodd"
                              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                              clipRule="evenodd"
                            />
                          )}
                        </svg>
                      </button>
                    </div>
                    {isListening[q.id] && (
                      <div className="mt-2 text-sm text-purple-600 flex items-center gap-2">
                        <svg className="animate-pulse h-3 w-3 text-red-500" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" fill="currentColor" />
                        </svg>
                        Listening...
                      </div>
                    )}
                    <button
                      onClick={() => submitAnswer(q.id, q.question)}
                      disabled={submittedAnswers[q.id]}
                      className={`mt-2 px-4 py-2 rounded-lg text-white transition ${
                        submittedAnswers[q.id]
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 cursor-pointer"
                      }`}
                    >
                      {submittedAnswers[q.id] ? "Submitted" : "Submit Answer"}
                    </button>
                  </div>
                )}

                {gradingResults[q.id] && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div
                      className="cursor-pointer text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300"
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

                {showModelAnswer[q.id] && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-600 mb-2">Model Answer:</h4>
                    <div className="text-gray-700">
                      {modelAnswers[q.id].split('\n').map((line, index) => {
                        const trimmedLine = line.trim();
                        // Check if the line is a heading (ends with colon and is not empty)
                        if (trimmedLine.endsWith(':') && trimmedLine.length > 1) {
                          return (
                            <h5 key={index} className="font-semibold text-black mt-2 mb-1">
                              {trimmedLine}
                            </h5>
                          );
                        }
                        // Check if the line is a bullet point
                        else if (trimmedLine.startsWith('•')) {
                          return (
                            <div key={index} className="flex items-start ml-4 mb-1">
                              <span className="text-black mr-2">•</span>
                              <span className="text-sm">{trimmedLine.substring(1).trim()}</span>
                            </div>
                          );
                        }
                        // Regular paragraph (non-empty line)
                        else if (trimmedLine) {
                          return <p key={index} className="text-sm mb-1">{trimmedLine}</p>;
                        }
                        // Skip empty lines
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center text-gray-500 py-8">
          {!jobDescription && selectedSkills.length === 0 ? (
            <p>Please provide either a job description or select skills to generate questions.</p>
          ) : (
            <p>Click "Generate Questions" to create interview questions based on your inputs.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionsSection;
