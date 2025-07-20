import React, { Fragment, useState, useEffect, useContext } from "react";
import config from "../../config";
import { CheckIcon, XMarkIcon as XIcon, BookmarkIcon as BookmarkSolidIcon, 
  BookOpenIcon as BookOpenSolidIcon, LinkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { VocabularyContext } from '../../Contexts/VocabularyContext';

const FalseQuestion = () => {
  const [quizPerformance, setQuizPerformance] = useState({
    performances: [],
    overall: {},
    byTense: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markedForReviewQuestions, setMarkedForReviewQuestions] = useState({});
  const [selectedTenseInfo, setSelectedTenseInfo] = useState(null);
  const [showTenseModal, setShowTenseModal] = useState(false);
  const [questionDetails, setQuestionDetails] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [groupByTense, setGroupByTense] = useState(false); 
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [groupedByQuestionId, setGroupedByQuestionId] = useState({});
  
  // Get vocabulary context for double-click word lookup
  const { fetchWordMeaning } = useContext(VocabularyContext) || {};

  useEffect(() => {
    fetchQuizPerformance();
  }, []);

  // Group questions by question ID
  useEffect(() => {
    if (questionDetails.length > 0) {
      const questionsByQuestionId = {};
      
      questionDetails.forEach(question => {
        if (!questionsByQuestionId[question.question_id]) {
          questionsByQuestionId[question.question_id] = {
            question_id: question.question_id,
            tense_id: question.tense_id,
            tense_name: question.tense_name,
            correct_option: question.correct_option,
            explanation: question.explanation,
            attempts: []
          };
        }
        
        questionsByQuestionId[question.question_id].attempts.push({
          performance_id: question.performance_id,
          selected_option: question.selected_option,
          quiz_date: question.quiz_date,
          total_time_taken: question.total_time_taken
        });
      });
      
      setGroupedByQuestionId(questionsByQuestionId);
    }
  }, [questionDetails]);

  // Group questions by tense
  useEffect(() => {
    if (questionDetails.length > 0) {
      const questionsByTense = {};
      
      questionDetails.forEach(question => {
        if (!questionsByTense[question.tense_id]) {
          questionsByTense[question.tense_id] = {
            tense_name: question.tense_name,
            questions: []
          };
        }
        
        questionsByTense[question.tense_id].questions.push(question);
      });
      
      setGroupedQuestions(questionsByTense);
    }
  }, [questionDetails]);

  // Handle double click on any word
  const handleWordDoubleClick = (event) => {
    if (!fetchWordMeaning) return;
    
    // Get the selected text
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // If there's selected text, look it up
    if (selectedText && selectedText.length > 0) {
      fetchWordMeaning(selectedText);
    }
  };

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const isExpanded = (questionId) => {
    return expandedQuestions[questionId] || false;
  };

  const fetchQuizPerformance = async () => {
    try {
      setLoading(true);
      // Fetch quiz performance stats
      const statsResponse = await fetch(`${config.backendUrl}/quiz-performance/stats/`, {
        headers: { "Authorization": localStorage.getItem('jstoken') }
      });

      if (!statsResponse.ok) {
        throw new Error(`Failed to fetch quiz performance: ${statsResponse.status}`);
      }

      const performanceData = await statsResponse.json();
      
      if (!performanceData || !performanceData.success) {
        throw new Error("Invalid quiz performance data received");
      }
      
      // Set quiz performance data
      setQuizPerformance(performanceData.data);
      
      // Extract incorrect question data from all performances
      const allIncorrectQuestions = [];
      // Create a map to track marked for review status
      const reviewStatusMap = {};
      
      if (performanceData.data.performances && performanceData.data.performances.length > 0) {
        performanceData.data.performances.forEach(performance => {
          if (performance.incorrect_question_data && performance.incorrect_question_data.length > 0) {
            // Add tense information to each question
            const questionsWithTenseInfo = performance.incorrect_question_data.map(question => {
              // Track mark_for_review status in the map
              const key = `${performance.id}-${question.question_id}`;
              reviewStatusMap[key] = question.mark_for_review || false;
              
              return {
                ...question,
                tense_id: performance.tense_id,
                tense_name: performanceData.data.byTense.find(tense => 
                  tense.tense_id === performance.tense_id)?.tense_name || "Unknown Tense",
                performance_id: performance.id,
                quiz_date: new Date(performance.created_at || Date.now()).toLocaleDateString(),
                total_time_taken: performance.total_time_taken
              };
            });
            allIncorrectQuestions.push(...questionsWithTenseInfo);
          }
        });
      }
      
      setQuestionDetails(allIncorrectQuestions);
      setMarkedForReviewQuestions(reviewStatusMap);
      
    } catch (err) {
      console.error("Error fetching quiz performance:", err);
      setError("Failed to load your quiz performance. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMarkForReview = async (performanceId, questionId) => {
    try {
      const key = `${performanceId}-${questionId}`;
      const currentStatus = markedForReviewQuestions[key] || false;
      const newStatus = !currentStatus;
      
      // Optimistically update UI
      setMarkedForReviewQuestions(prev => ({
        ...prev,
        [key]: newStatus
      }));
      
      // Send update to server
      const response = await fetch(`${config.backendUrl}/quiz-performance/id/${performanceId}/question/${questionId}`, {
        method: 'PATCH',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem('jstoken') 
        },
        body: JSON.stringify({
          mark_for_review: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update mark for review status: ${response.status}`);
      }
      
      console.log(`Question ${questionId} marked for review: ${newStatus}`);
      
    } catch (err) {
      console.error("Error toggling mark for review:", err);
      // Revert the optimistic update if there was an error
      setMarkedForReviewQuestions(prev => ({
        ...prev,
        [`${performanceId}-${questionId}`]: !prev[`${performanceId}-${questionId}`]
      }));
      alert("Failed to update review status. Please try again.");
    }
  };

  const isMarkedForReview = (performanceId, questionId) => {
    const key = `${performanceId}-${questionId}`;
    return markedForReviewQuestions[key] || false;
  };

  const getAtLeastOneMarkedForReview = (questionId) => {
    // Check if at least one attempt of this question is marked for review
    const questionData = groupedByQuestionId[questionId];
    if (!questionData) return false;
    
    return questionData.attempts.some(attempt => {
      const key = `${attempt.performance_id}-${questionId}`;
      return markedForReviewQuestions[key] || false;
    });
  };

  const fetchTenseInfo = async (tenseId) => {
    try {
      if (!tenseId) {
        throw new Error("No tense information available for this question");
      }
      
      const response = await fetch(`${config.backendUrl}/tense/${tenseId}`, {
        headers: { "Authorization": localStorage.getItem('jstoken') }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tense information: ${response.status}`);
      }
      
      const data = await response.json();
      setSelectedTenseInfo(data.tense);
      setShowTenseModal(true);
    } catch (err) {
      console.error("Error fetching tense information:", err);
      alert("Could not load tense information. Please try again.");
    }
  };

  // New function to render a grouped question card
  const renderGroupedQuestionCard = (questionData) => {
    const isOpen = isExpanded(questionData.question_id);
    const isMarked = getAtLeastOneMarkedForReview(questionData.question_id);
    const attemptsCount = questionData.attempts.length;
    
    return (
      <div 
        key={questionData.question_id} 
        className={`rounded-lg overflow-hidden transition-all duration-300`}
        onClick={() => toggleExpand(questionData.question_id)}
      >
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 "
          style={{backgroundColor:"white"}}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center">
                <h4 className="text-sm font-medium text-gray-900 mr-2">Question {questionData.question_id}</h4>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full mr-2">
                  {attemptsCount} {attemptsCount === 1 ? 'attempt' : 'attempts'}
                </span>
                {isOpen ? 
                  <ChevronUpIcon className="h-4 w-4 text-gray-500" /> :
                  <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                }
              </div>
              <p className="text-xs text-gray-500">{questionData.tense_name}</p>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent toggling expansion
                  fetchTenseInfo(questionData.tense_id);
                }}
                className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                title="View tense explanation"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
              {/* This will mark the most recent attempt for review */}
              {questionData.attempts.length > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent toggling expansion
                    const latestAttempt = questionData.attempts[0]; // First is most recent
                    toggleMarkForReview(latestAttempt.performance_id, questionData.question_id);
                  }}
                  className={`p-1.5 rounded-full ${
                    isMarked
                      ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={isMarked ? "Remove from review list" : "Mark for review"}
                >
                  <BookmarkSolidIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Condensed view - always visible */}
          <div className="mt-2 flex justify-between items-center text-xs">
            <div className="flex items-center">
              {questionData.attempts.length > 0 && (
                <>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 mr-2">
                    <XIcon className="h-3 w-3 mr-1" />
                    Latest: {questionData.attempts[0].selected_option || "No answer"}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    {questionData.correct_option}
                  </span>
                </>
              )}
            </div>
            {isMarked ? (
              <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckIcon className="h-3 w-3 mr-1" />
                Marked for review
              </span>
            ) : (
              <span className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                <XIcon className="h-3 w-3 mr-1" />
                Not marked
              </span>
            )}
          </div>
          
          {/* Expanded view - only visible when expanded */}
          {isOpen && (
            <div className="mt-4 border-t pt-3 grid grid-cols-1 gap-3 text-sm animate-fadeIn">
              {questionData.attempts.map((attempt, index) => (
                <div key={`${attempt.performance_id}-${questionData.question_id}`} 
                  className="p-3 rounded-md bg-gray-50 border border-gray-200 mb-3">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-medium text-gray-700">
                      Attempt #{index + 1} - {attempt.quiz_date}
                    </h5>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMarkForReview(attempt.performance_id, questionData.question_id);
                      }}
                      className={`p-1 rounded-full ${
                        isMarkedForReview(attempt.performance_id, questionData.question_id)
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={isMarkedForReview(attempt.performance_id, questionData.question_id) 
                        ? "Remove from review list" 
                        : "Mark for review"}
                    >
                      <BookmarkSolidIcon className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-2 rounded-md bg-red-50 border border-red-100">
                      <p className="font-medium text-red-700 mb-1 text-xs">Your Answer:</p>
                      <p className="text-red-800">{attempt.selected_option || "No answer provided"}</p>
                    </div>
                    
                    <div className="p-2 rounded-md bg-green-50 border border-green-100">
                      <p className="font-medium text-green-700 mb-1 text-xs">Correct Answer:</p>
                      <p className="text-green-800">{questionData.correct_option}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Quiz Date:</p>
                        <p className="font-medium">{attempt.quiz_date}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Time Spent:</p>
                        <p className="font-medium">{attempt.total_time_taken || "N/A"} seconds</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {questionData.explanation && questionData.explanation !== "No explanation available" && (
                <div className="p-3 rounded-md bg-yellow-50 border border-yellow-100">
                  <p className="font-medium text-yellow-700 mb-1">Explanation:</p>
                  <p className="text-yellow-800">{questionData.explanation}</p>
                </div>
              )}
              
              <button
                className="mt-1 text-blue-600 hover:text-blue-800 text-sm flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  fetchTenseInfo(questionData.tense_id);
                }}
              >
                <BookOpenSolidIcon className="h-4 w-4 mr-1" />
                Study {questionData.tense_name} Rules
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (questionDetails.length === 0) {
    return (
      <div className="py-8 px-4 text-center">
        <p className="text-gray-500">You haven't made any mistakes yet. Keep practicing!</p>
      </div>
    );
  }

  // Count unique questions
  const uniqueQuestionCount = Object.keys(groupedByQuestionId).length;

  return (
    <div className="space-y-6 py-4 bg-gray-50" onDoubleClick={handleWordDoubleClick} >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Review Your Quiz Mistakes</h3>
        <div className="flex space-x-3 items-center">
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {uniqueQuestionCount} {uniqueQuestionCount === 1 ? 'Question' : 'Questions'} 
            ({questionDetails.length} attempts)
          </span>
          <button 
            onClick={() => setGroupByTense(!groupByTense)}
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-blue-50 rounded-full"
          >
            {groupByTense ? "Show All Questions" : "Group By Tense"}
          </button>
        </div>
      </div>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="text-sm text-blue-800">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-medium">Total Quizzes:</span> {quizPerformance.overall?.total_quizzes || 0}</p>
              <p><span className="font-medium">Questions Attempted:</span> {quizPerformance.overall?.total_questions || 0}</p>
            </div>
            <div>
              <p><span className="font-medium">Correct Answers:</span> {quizPerformance.overall?.total_correct || 0}</p>
              <p><span className="font-medium">Incorrect Answers:</span> {quizPerformance.overall?.total_incorrect || 0}</p>
            </div>
          </div>
          <div className="mt-2">
            <p><span className="font-medium">Average Score:</span> {quizPerformance.overall?.avg_score_percentage || 0}%</p>
          </div>
        </div>
      </div>
      
      {/* Display questions - now using grouped by question ID approach */}
      {groupByTense ? (
        // Display questions grouped by tense
        <div className="space-y-8">
          {Object.keys(groupedQuestions).map((tenseId) => {
            // Get questions for this tense that are in the groupedByQuestionId
            const questionsInTense = groupedQuestions[tenseId].questions;
            const uniqueQuestionIdsInTense = [...new Set(questionsInTense.map(q => q.question_id))];
            
            return (
              <div key={tenseId} className="border-l-4 border-orange-400 pl-4 py-1">
                <h4 className="text-base font-medium text-gray-800 mb-3">
                  {groupedQuestions[tenseId].tense_name}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({uniqueQuestionIdsInTense.length} questions, {questionsInTense.length} attempts)
                  </span>
                </h4>
                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
                  {uniqueQuestionIdsInTense.map(qId => 
                    renderGroupedQuestionCard(groupedByQuestionId[qId])
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Display all questions in a grid
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {Object.values(groupedByQuestionId).map(questionData => 
            renderGroupedQuestionCard(questionData)
          )}
        </div>
      )}

      {/* Tense explanation modal */}
      {showTenseModal && selectedTenseInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">{selectedTenseInfo.tense_name}</h3>
                <button 
                  onClick={() => setShowTenseModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <h4 className="text-md font-medium text-gray-800 mb-2">Definition</h4>
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  {selectedTenseInfo.tense_definition || selectedTenseInfo.description}
                </div>
                
                <h4 className="text-md font-medium text-gray-800 mb-2">Examples</h4>
                <ul className="bg-gray-50 p-3 rounded-md mb-4 list-disc pl-5">
                  {selectedTenseInfo.tense_examples && selectedTenseInfo.tense_examples.split(',').map((example, index) => (
                    <li key={index} className="mb-1">{example.trim()}</li>
                  ))}
                  
                  {selectedTenseInfo.examples && Array.isArray(selectedTenseInfo.examples.affirmative) && (
                    <>
                      <li className="font-medium mt-2">Affirmative examples:</li>
                      {selectedTenseInfo.examples.affirmative.slice(0, 3).map((ex, idx) => (
                        <li key={`aff-${idx}`} className="ml-4">{ex.example_text}</li>
                      ))}
                    </>
                  )}
                  
                  {selectedTenseInfo.examples && Array.isArray(selectedTenseInfo.examples.negative) && 
                   selectedTenseInfo.examples.negative.length > 0 && (
                    <>
                      <li className="font-medium mt-2">Negative examples:</li>
                      {selectedTenseInfo.examples.negative.slice(0, 3).map((ex, idx) => (
                        <li key={`neg-${idx}`} className="ml-4">{ex.example_text}</li>
                      ))}
                    </>
                  )}
                </ul>
                
                {selectedTenseInfo.grammar_rules && (
                  <>
                    <h4 className="text-md font-medium text-gray-800 mb-2">Grammar Rules</h4>
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      {selectedTenseInfo.grammar_rules}
                    </div>
                  </>
                )}
                
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setShowTenseModal(false)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FalseQuestion;