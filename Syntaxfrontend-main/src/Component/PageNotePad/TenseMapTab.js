import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TenseMapSVG from "../SVGs/TenseMapSVG";
import config from "../../config";
import { 
  AcademicCapIcon, 
  BookOpenIcon,
  DocumentTextIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapIcon
} from "@heroicons/react/24/outline";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const TenseMapTab = () => {
  const [tenses, setTenses] = useState([]);
  const [selectedTense, setSelectedTense] = useState(null);
  const [examples, setExamples] = useState([]);
  const [userExamples, setUserExamples] = useState([]);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizSettings, setQuizSettings] = useState({
    questionCount: 5,
    timePerQuestion: 30
  });
  const [quizMode, setQuizMode] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [newExample, setNewExample] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status on component mount and whenever localStorage changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('jstoken');
      setIsLoggedIn(!!token && token !== "");
    };

    // Check auth status initially
    checkAuthStatus();

    // Listen for storage changes (in case user logs in/out in another tab)
    window.addEventListener('storage', checkAuthStatus);
    
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  // Fetch all tenses on component mount
  useEffect(() => {
    if(localStorage.getItem('jstoken')){
      fetchTenses();
    }
    
  }, []);

  // Fetch tenses data from the backend
  const fetchTenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.backendUrl}/tense`,{
        method: 'GET',
        headers: {
          "Authorization": localStorage.getItem('jstoken')
          }
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setTenses(data.tenses || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tenses. Please try again later.");
      setLoading(false);
      console.error("Error fetching tenses:", err);
    }
  };

  // Fetch tense details when a tense is selected
  const fetchTenseDetails = async (tenseId) => {
    try {
      setLoading(true);
      const response = await fetch(`${config.backendUrl}/tense/${tenseId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setSelectedTense(data.tense);
      
      // Also fetch examples for this tense
      fetchTenseExamples(tenseId);
      
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch tense details. Please try again later.");
      setLoading(false);
      console.error("Error fetching tense details:", err);
    }
  };

  // Fetch examples for a specific tense
  const fetchTenseExamples = async (tenseId) => {
    try {
      const response = await fetch(`${config.backendUrl}/tense/${tenseId}/examples`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setExamples(data.examples || []);
      
      // Also fetch user-submitted examples if logged in
      if (isLoggedIn) {
        fetchUserExamples(tenseId);
      }
    } catch (err) {
      console.error("Error fetching examples:", err);
    }
  };

  // Fetch user-submitted examples
  const fetchUserExamples = async (tenseId) => {
    try {
      const response = await fetch(`${config.backendUrl}/tense/${tenseId}/user-examples`, {
        headers: {"Authorization": localStorage.getItem('jstoken')}
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setUserExamples(data.userExamples || []);
    } catch (err) {
      console.error("Error fetching user examples:", err);
    }
  };

  // Generate quiz questions for the selected tense
  const generateQuiz = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.backendUrl}/tense/${selectedTense.tense_id}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": localStorage.getItem('jstoken')
        },
        body: JSON.stringify(quizSettings)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setQuizQuestions(data.questions || []);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setQuizResults(null);
      setQuizMode(true);
      setLoading(false);
    } catch (err) {
      setError("Failed to generate quiz. Please try again later.");
      setLoading(false);
      console.error("Error generating quiz:", err);
    }
  };

  // Handle quiz answer selection
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  // Move to the next question or finish the quiz
  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      return; // Don't proceed if no answer is selected
    }
    
    // Update the quiz questions array with the selected answer
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[currentQuestion].selectedAnswer = selectedAnswer;
    setQuizQuestions(updatedQuestions);
    
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Calculate and display results
      const correctAnswers = quizQuestions.filter(
        (q, idx) => q.selectedAnswer === q.correctAnswer
      ).length;
      
      setQuizResults({
        totalQuestions: quizQuestions.length,
        correctAnswers,
        score: Math.round((correctAnswers / quizQuestions.length) * 100)
      });
    }
  };

  // Submit a new example for the current tense
  const handleExampleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newExample.trim() || !isLoggedIn || !selectedTense) {
      return;
    }
    
    try {
      const response = await fetch(`${config.backendUrl}/tense/${selectedTense.tense_id}/example`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": localStorage.getItem('jstoken')
        },
        body: JSON.stringify({ 
          example: newExample,
          tense_id: selectedTense.tense_id
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Refetch user examples to update the list
      fetchUserExamples(selectedTense.tense_id);
      setNewExample('');
    } catch (err) {
      console.error("Error submitting example:", err);
      alert('Failed to submit your example. Please try again.');
    }
  };

  // Reset quiz
  const resetQuiz = () => {
    setQuizMode(false);
    setQuizResults(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
  };

  // Handle tense selection from the map
  const handleTenseSelect = (tenseId) => {
    fetchTenseDetails(tenseId);
    setQuizMode(false);
  };

  // Render the quiz
  const renderQuiz = () => {
    if (quizResults) {
      return (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h3 className="text-xl font-bold mb-4 text-center">Quiz Results</h3>
          <div className="flex justify-center mb-4">
            {quizResults.score >= 70 ? (
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            ) : (
              <XCircleIcon className="h-16 w-16 text-red-500" />
            )}
          </div>
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-gray-800">{quizResults.score}%</p>
            <p className="text-gray-600">
              You got {quizResults.correctAnswers} out of {quizResults.totalQuestions} questions correct
            </p>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2">Question Review:</h4>
            <div className="space-y-4">
              {quizQuestions.map((q, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-md ${q.selectedAnswer === q.correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <p className="font-medium">{q.question}</p>
                  <div className="mt-2 text-sm">
                    <p className={q.selectedAnswer === 0 ? (q.correctAnswer === 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium') : ''}>
                      A: {q.options[0]}
                    </p>
                    <p className={q.selectedAnswer === 1 ? (q.correctAnswer === 1 ? 'text-green-600 font-medium' : 'text-red-600 font-medium') : ''}>
                      B: {q.options[1]}
                    </p>
                    <p className={q.selectedAnswer === 2 ? (q.correctAnswer === 2 ? 'text-green-600 font-medium' : 'text-red-600 font-medium') : ''}>
                      C: {q.options[2]}
                    </p>
                    <p className={q.selectedAnswer === 3 ? (q.correctAnswer === 3 ? 'text-green-600 font-medium' : 'text-red-600 font-medium') : ''}>
                      D: {q.options[3]}
                    </p>
                  </div>
                  {q.selectedAnswer !== q.correctAnswer && (
                    <p className="mt-2 text-green-600 text-sm font-medium">
                      Correct answer: {['A', 'B', 'C', 'D'][q.correctAnswer]}: {q.options[q.correctAnswer]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={resetQuiz}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Return to Tense Details
            </button>
          </div>
        </motion.div>
      );
    }

    if (currentQuestion >= quizQuestions.length) {
      return null;
    }

    const question = quizQuestions[currentQuestion];
    
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="flex justify-between mb-4">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestion + 1} of {quizQuestions.length}
          </span>
          <span className="flex items-center text-sm font-medium text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            {quizSettings.timePerQuestion} seconds
          </span>
        </div>
        
        <h3 className="text-lg font-medium mb-6">{question.question}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(idx)}
              className={`w-full text-left p-3 border rounded-md transition-all ${
                selectedAnswer === idx 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][idx]}:</span>
              {option}
            </button>
          ))}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className={`px-4 py-2 rounded-md ${
              selectedAnswer === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600 text-white hover:bg-orange-700'
            } transition-colors`}
          >
            {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </button>
        </div>
      </motion.div>
    );
  };

  // Render the tense detail view
  const renderTenseDetail = () => {
    if (!selectedTense) {
      return (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center p-8"
        >
          <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Select a tense from the map</h3>
          <p className="text-gray-500">Click on any tense in the map to view its details, examples, and practice with quizzes.</p>
        </motion.div>
      );
    }

    if (quizMode) {
      return renderQuiz();
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-lg shadow-md overflow-hidden"
      >
        {/* Header with tense name */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
          <h2 className="text-xl font-bold text-white">{selectedTense.tense_name}</h2>
        </div>
        
        {/* Grammar explanation */}
        <div className="p-6 border-b border-gray-200">
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="flex items-center text-lg font-medium mb-3">
              <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
              Grammar Explanation
            </h3>
            <div className="prose prose-sm max-w-none">
              <p>{selectedTense.description || "No explanation available."}</p>
            </div>
          </motion.div>
          
          {/* Structure and usage */}
          <motion.div variants={itemVariants} className="mb-6">
            <h3 className="flex items-center text-lg font-medium mb-3">
              <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
              Structure and Usage
            </h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-700 mb-2">Affirmative:</h4>
              <p className="mb-4">{examples.find(ex => ex.type === 'affirmative')?.text || "No example available."}</p>
              
              <h4 className="font-medium text-gray-700 mb-2">Negative:</h4>
              <p className="mb-4">{examples.find(ex => ex.type === 'negative')?.text || "No example available."}</p>
              
              <h4 className="font-medium text-gray-700 mb-2">Interrogative:</h4>
              <p>{examples.find(ex => ex.type === 'interrogative')?.text || "No example available."}</p>
            </div>
          </motion.div>
          
          {/* Examples section */}
          <motion.div variants={itemVariants}>
            <h3 className="flex items-center text-lg font-medium mb-3">
              <BookOpenIcon className="h-5 w-5 mr-2 text-green-600" />
              Examples
            </h3>
            <div className="space-y-3">
              {examples.filter(ex => ex.type === 'example').map((example, idx) => (
                <div key={idx} className="bg-green-50 p-3 rounded-md border border-green-100">
                  <p>{example.text}</p>
                </div>
              ))}
              
              {examples.filter(ex => ex.type === 'example').length === 0 && (
                <p className="text-gray-500">No examples available.</p>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* User examples section */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <motion.div variants={itemVariants}>
            <h3 className="flex items-center text-lg font-medium mb-3">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-purple-600" />
              Community Examples
            </h3>
            
            {isLoggedIn ? (
              <form onSubmit={handleExampleSubmit} className="mb-4">
                <div className="flex">
                  <input
                    type="text"
                    value={newExample}
                    onChange={(e) => setNewExample(e.target.value)}
                    placeholder="Add your own example sentence..."
                    className="flex-grow px-4 py-2 rounded-l-md border border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="bg-orange-600 text-white px-4 py-2 rounded-r-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-700">Log in to submit your own examples.</p>
              </div>
            )}
            
            <div className="space-y-3">
              {userExamples.map((example, idx) => (
                <div key={idx} className="bg-purple-50 p-3 rounded-md border border-purple-100">
                  <p>{example.text}</p>
                  <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>By: {example.username || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(example.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              
              {userExamples.length === 0 && (
                <p className="text-gray-500">No user examples yet. Be the first to add one!</p>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Quiz section */}
        <div className="p-6">
          <motion.div variants={itemVariants}>
            <h3 className="flex items-center text-lg font-medium mb-3">
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2 text-orange-600" />
              Practice Quiz
            </h3>
            
            <div className="bg-orange-50 p-4 rounded-md border border-orange-100">
              <p className="mb-4 text-gray-700">Test your understanding of the {selectedTense.tense_name} with a custom quiz.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of questions:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={quizSettings.questionCount}
                    onChange={(e) => setQuizSettings({
                      ...quizSettings,
                      questionCount: parseInt(e.target.value) || 5
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time per question (seconds):
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={quizSettings.timePerQuestion}
                    onChange={(e) => setQuizSettings({
                      ...quizSettings,
                      timePerQuestion: parseInt(e.target.value) || 30
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <button
                onClick={generateQuiz}
                disabled={!isLoggedIn}
                className={`w-full py-2 rounded-md ${
                  isLoggedIn
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                } transition-colors`}
              >
                {isLoggedIn ? 'Start Quiz' : 'Login to Start Quiz'}
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="container mx-auto">
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left side - Tense Map */}
          <div className="md:col-span-12 lg:col-span-12">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <MapIcon className="h-5 w-5 mr-2 text-blue-600" />
                Tense Map
              </h3>
              <div className="tensemap-container" onClick={(e) => {
                // Handling the click event from the SVG map
                if (e.target.tagName === 'path' && e.target.dataset.tenseId) {
                  handleTenseSelect(e.target.dataset.tenseId);
                }
              }}>
                <TenseMapSVG />
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <p>Click on any tense in the map to view its details and examples.</p>
              </div>
            </div>
          </div>
          
          {/* Right side - Tense Detail */}
          {/* <div className="md:col-span-7 lg:col-span-8">
            {renderTenseDetail()}
          </div> */}
        </div>
      )}
    </div>
  );
};

export default TenseMapTab;