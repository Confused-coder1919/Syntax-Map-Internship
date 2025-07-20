import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  RocketLaunchIcon,
  PencilSquareIcon,
  PencilIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

import TenseMasteryMap from "./TenseMasteryMap";
import RecentActivity from "./RecentActivity";
import GoalTracker from "./GoalTracker";
import VocabularyProgress from "./VocabularyProgress";
import { API_BASE_URL } from "../../config"; // Adjust the import based on your project structure

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState({
    progress: {
      completedTenses: 0,
      totalTenses: 0,
      vocabLearned: 0,
      totalVocab: 0,
      quizzesCompleted: 0,
      avgScore: 0,
    },
    recentActivities: [],
    goals: [],
  });

  const [quizPerformance, setQuizPerformance] = useState({
    performances: [],
    overall: {
      total_quizzes: 0,
      total_questions: 0,
      total_correct: 0,
      total_incorrect: 0,
      avg_score_percentage: 0,
      avg_time_per_question: 0,
      avg_time_per_quiz: 0,
    },
    byTense: [],
  });

  const [expandedTenseId, setExpandedTenseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await axios.get(`${API_BASE_URL}/student/dashboard`, {
          headers: {
            Authorization: localStorage.getItem("jstoken"),
          },
        });         
        setStudentData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err);
        // setError("Unable to load your dashboard. Please try again later.");
        setLoading(false);

      }
    }

    const fetchQuizPerformance = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/quiz-performance/stats`,
          {
            headers: {
              Authorization: localStorage.getItem("jstoken"),
            },
          }
        );

        if (response.data && response.data.success) {
          setQuizPerformance(response.data.data);

          // Update student data with quiz performance stats
          
          setStudentData((prevState) => ({
            ...prevState,
            progress: {
              ...prevState.progress,
              quizzesCompleted: response.data.data.overall?.total_quizzes || 0,
              avgScore: response.data.data.overall?.avg_score_percentage || 0,
            },
          }));
        }
      } catch (err) {
        console.error("Error fetching quiz performance data:", err);
      }
    };

    fetchStudentData();
    fetchQuizPerformance();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  // Calculate incorrect answers by tense
  const getIncorrectAnswersByTense = () => {
    const tenseMap = {};

    // Create a map of tense ids to their name
    quizPerformance.byTense.forEach((tense) => {
      tenseMap[tense.tense_id] = tense.tense_name;
    });

    // Group performances by tense_id
    const incorrectByTense = {};
    quizPerformance.performances.forEach((performance) => {
      const tenseId = performance.tense_id;
      const tenseName = tenseMap[tenseId] || "Unknown Tense";

      if (!incorrectByTense[tenseId]) {
        incorrectByTense[tenseId] = {
          id: tenseId,
          name: tenseName,
          incorrectAnswers: [],
        };
      }

      // Add each incorrect answer to the tense group
      performance.incorrect_question_data.forEach((incorrectQuestion) => {
        incorrectByTense[tenseId].incorrectAnswers.push({
          ...incorrectQuestion,
          quiz_id: performance.quiz_details_id,
          quiz_date: performance.created_at || "Unknown date",
        });
      });
    });

    return Object.values(incorrectByTense);
  };

  const toggleTenseExpansion = (tenseId) => {
    if (expandedTenseId === tenseId) {
      setExpandedTenseId(null);
    } else {
      setExpandedTenseId(tenseId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const incorrectAnswersByTense = getIncorrectAnswersByTense();


  return (
    <motion.div
      className="container mx-auto px-4 py-8 min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome back</h1>
        <p className="text-gray-600 mt-2">
          Track your progress, continue learning, and achieve your language
          goals.
        </p>
      </motion.div>

      {/* Progress Overview Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={itemVariants}
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
                Tense Mastery
              </h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold text-gray-800">
                  {studentData.progress.completedTenses}/
                  {studentData.progress.totalTenses}
                </p>
                <p className="ml-2 text-sm text-gray-600">tenses completed</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-1 -top-1 bg-indigo-100 rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300"></div>
              <BookOpenIcon className="w-10 h-10 text-indigo-500 opacity-60 group-hover:opacity-100 relative z-10 transition-opacity duration-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (studentData.progress.completedTenses /
                      studentData.progress.totalTenses) *
                    100
                  }%`,
                }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="bg-indigo-600 h-2.5 rounded-full"
              ></motion.div>
            </div>
          </div>
          <div className="mt-3 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view details →
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-green-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
                Quiz Performance
              </h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold text-gray-800">
                  {quizPerformance.overall?.avg_score_percentage || 0}%
                </p>
                <p className="ml-2 text-sm text-gray-600">avg. score</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-1 -top-1 bg-green-100 rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300"></div>
              <ClipboardDocumentListIcon className="w-10 h-10 text-green-500 opacity-60 group-hover:opacity-100 relative z-10 transition-opacity duration-300" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            <span className="font-medium">
              {quizPerformance.overall?.total_quizzes || 0}
            </span>{" "}
            quizzes completed
          </p>
          <div className="mt-1.5 text-xs text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view details →
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 transition-all duration-300 hover:shadow-lg relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-gray-500 text-sm uppercase font-semibold tracking-wider">
                Vocabulary
              </h3>
              <div className="mt-2 flex items-baseline">
                <p className="text-3xl font-bold text-gray-800">
                  {studentData.progress.vocabLearned}
                </p>
                <p className="ml-2 text-sm text-gray-600">words learned</p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -right-1 -top-1 bg-purple-100 rounded-full w-12 h-12 opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300"></div>
              <PencilSquareIcon className="w-10 h-10 text-purple-500 opacity-60 group-hover:opacity-100 relative z-10 transition-opacity duration-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (studentData.progress.vocabLearned /
                      studentData.progress.totalVocab) *
                    100
                  }%`,
                }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className="bg-purple-600 h-2.5 rounded-full"
              ></motion.div>
            </div>
          </div>
          <div className="mt-3 text-xs text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view details →
          </div>
        </motion.div>
      </motion.div>

      {/* Quiz Performance Stats */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <ClipboardDocumentListIcon className="w-5 h-5 mr-2 text-green-600" />
            Quiz Performance Details
          </h2>

          {/* Quiz Performance Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Quizzes</div>
              <div className="text-2xl font-bold text-gray-800">
                {quizPerformance.overall?.total_quizzes || 0}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">
                Questions Answered
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {quizPerformance.overall?.total_questions || 0}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">
                Avg. Time per Question
              </div>
              <div className="text-2xl font-bold text-gray-800">
                {quizPerformance.overall?.avg_time_per_question?.toFixed(1) ||
                  0}{" "}
                sec
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Avg. Quiz Time</div>
              <div className="text-2xl font-bold text-gray-800">
                {quizPerformance.overall?.avg_time_per_quiz?.toFixed(1) || 0}{" "}
                sec
              </div>
            </div>
          </div>

          {/* Correct/Incorrect Stats */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-700">
                Accuracy Performance
              </h3>
              <span className="text-sm text-gray-500">
                {quizPerformance.overall?.avg_score_percentage || 0}% correct
              </span>
            </div>
            <div className="w-full h-4 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{
                  width: `${
                    quizPerformance.overall?.avg_score_percentage || 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span>
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                Correct: {quizPerformance.overall?.total_correct || 0}
              </span>
              <span>
                <span className="inline-block w-3 h-3 bg-red-100 rounded-full mr-1"></span>
                Incorrect: {quizPerformance.overall?.total_incorrect || 0}
              </span>
            </div>
          </div>

          {/* Per-Tense Stats */}
          {quizPerformance.byTense && quizPerformance.byTense.length > 0 && (
            <div className="mb-2">
              <h3 className="font-medium text-gray-700 mb-3">
                Performance by Tense
              </h3>
              <div className="space-y-3">
                {quizPerformance.byTense.map((tense) => (
                  <div key={tense.tense_id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{tense.tense_name}</h4>
                        <p className="text-sm text-gray-600">
                          {tense.quizzes_taken} quizzes |{" "}
                          {tense.total_questions} questions
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          {tense.avg_score_percentage}%
                        </div>
                        <p className="text-xs text-gray-500">
                          {tense.avg_time_per_question?.toFixed(1)} sec/question
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${tense.avg_score_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Incorrect Answers Analysis */}
      {incorrectAnswersByTense.length > 0 && (
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 text-red-600" />
              Incorrect Answers Analysis
            </h2>

            <div className="space-y-4">
              {incorrectAnswersByTense.map((tense) => (
                <div
                  key={tense.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleTenseExpansion(tense.id)}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 text-red-500 flex-shrink-0">
                        <ExclamationCircleIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-medium">{tense.name}</h3>
                        <p className="text-sm text-gray-600">
                          {tense.incorrectAnswers.length} incorrect answers
                        </p>
                      </div>
                    </div>
                    <div
                      className="transform transition-transform duration-200"
                      style={{
                        transform:
                          expandedTenseId === tense.id
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                      }}
                    >
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                  </button>

                  {expandedTenseId === tense.id && (
                    <div className="p-4 bg-white">
                      <div className="space-y-4">
                        {tense.incorrectAnswers.map(
                          (incorrectAnswer, index) => (
                            <div
                              key={`${incorrectAnswer.question_id}-${index}`}
                              className="border-l-4 border-red-400 bg-red-50 p-3 rounded-r-lg"
                            >
                              <div className="mb-2">
                                <p className="font-medium">{`Question ${incorrectAnswer.question_id}`}</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div className="flex items-start">
                                  <div className="text-red-500 mr-2 flex-shrink-0 mt-0.5">
                                    <ExclamationCircleIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Your Answer:
                                    </p>
                                    <p className="font-medium">
                                      {incorrectAnswer.selected_option ||
                                        "No answer"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start">
                                  <div className="text-green-500 mr-2 flex-shrink-0 mt-0.5">
                                    <CheckCircleIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">
                                      Correct Answer:
                                    </p>
                                    <p className="font-medium">
                                      {incorrectAnswer.correct_option}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-start mt-2 bg-white p-2 rounded border border-gray-200">
                                <div className="text-blue-500 mr-2 flex-shrink-0 mt-0.5">
                                  <InformationCircleIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">
                                    Explanation:
                                  </p>
                                  <p className="text-sm">
                                    {incorrectAnswer.explanation ||
                                      "No explanation available"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Resource Links */}
            {incorrectAnswersByTense.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-2">
                  Study Resources
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[...new Set(incorrectAnswersByTense.map((t) => t.name))].map(
                    (tenseName, index) => (
                      <Link
                        key={index}
                        to={`/tense/${tenseName
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
                      >
                        {tenseName}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Bottom Section - Two columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Recent Activity
            </h2>
            <RecentActivity activities={studentData.recentActivities} />
          </div>
        </motion.div>

        {/* Goals & Vocabulary Progress */}
        <motion.div variants={itemVariants} className="flex flex-col">
          {/* Goals */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <RocketLaunchIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Learning Goals
            </h2>
            <GoalTracker goals={studentData.goals} />
          </div>

          {/* Vocabulary Progress */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <PencilSquareIcon className="w-5 h-5 mr-2 text-indigo-600" />
              Vocabulary Progress
            </h2>
            <VocabularyProgress data={studentData.progress} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StudentDashboard;
