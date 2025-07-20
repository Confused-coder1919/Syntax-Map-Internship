import React, { Fragment, useState, useEffect, useContext } from "react";
import Question from "./Question.js";
import Timer from "./Timer.js";
import Button from "../UI/Button.js";
import { ModalContext } from "../../Contexts/ModalContext.js";
import { Link, Redirect, useHistory } from "react-router-dom";
import { API_BASE_URL } from "../../config.js";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  LightBulbIcon,
  PencilIcon,
  AcademicCapIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useParams } from "react-router-dom/cjs/react-router-dom.min.js";

const PageQuiz = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [results, setResults] = useState(null);
  const modalContext = useContext(ModalContext);
  const history = useHistory();
  const { tense } = useParams();

  const [secondsPerQuestion, setSecondsPerQuestion] = useState(10); //seconds per question
  const [startWith, setStartWith] = useState(5); //start with questions
  const [showSettingModal, setShowSettingModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all active quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/practice/quiz?status=active`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: localStorage.getItem("jstoken"),
            },
          }
        );
        console.log("response ",response.data);
        
        if (tense) {
          const filtered = response.data.data.filter(
            (quiz) => quiz.tense_id === tense
          );
          setQuizzes(filtered);
        } else {
          if (response.data.success) {
            setQuizzes(response.data.data);
          } else {
            throw new Error("Failed to fetch quizzes");
          }
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching quizzes");
        // Use alert instead of modalContext since we're not sure of the modal implementation
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const configQuizSetting = () => {
    setQuizStarted(true);
    setShowSettingModal(false);
    const totalTime = secondsPerQuestion * startWith;
    setRemainingTime(totalTime);
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowSettingModal(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // Navigate to next question
  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle quiz submission
  const submitQuiz = async () => {
    // Calculate results
    const correctAnswers = currentQuiz.questions.filter(
      (question) =>
        selectedAnswers[question.question_id] === question.correct_answer
    ).length;

    const incorrectQuestions = currentQuiz.questions.filter(
      (question) =>
        selectedAnswers[question.question_id] !== question.correct_answer
    );
    const missed_questions = currentQuiz.questions.filter(
      (question) => selectedAnswers[question.question_id] === undefined
    );
    const missed_questions_ids = missed_questions.map((q) => q.question_id);

    const resultData = {
      totalQuestions: currentQuiz.questions.length,
      correctAnswers,
      incorrectAnswers: currentQuiz.questions.length - correctAnswers,
      score: (correctAnswers / currentQuiz.questions.length) * 100,
      timeTaken:
        currentQuiz.time_per_question * currentQuiz.questions.length -
        remainingTime,
      incorrectQuestions: incorrectQuestions.map((q) => ({
        question_id: q.question_id,
        question: q.question,
        correct_answer: q.correct_answer,
        user_answer: selectedAnswers[q.question_id] || "No answer",
        tense_id: currentQuiz.tense_id,
      })),
    };

    setResults(resultData);
    setQuizFinished(true);

    // Store incorrect questions in the database
    try {
      await axios.post(
        `${API_BASE_URL}/quiz-performance`,
        {
          quiz_details_id: currentQuiz.id,
          tense_id: currentQuiz.tense_id,
          total_questions: currentQuiz.questions.length,
          correct_answers: correctAnswers,
          incorrect_answers: currentQuiz.questions.length - correctAnswers,
          total_time_taken:
            currentQuiz.time_per_question * currentQuiz.questions.length -
            remainingTime,
          incorrect_question_data: incorrectQuestions.map((q) => ({
            question_id: q.question_id,
            selected_option: selectedAnswers[q.question_id] || "No answer",
            correct_option: q.correct_answer,
            explanation: q.explanation || "No explanation available",
            mark_for_review: false,
          })),
          missed_questions: missed_questions_ids,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("jstoken"),
          },
        }
      );
    } catch (err) {
      console.error("Failed to store incorrect questions:", err);
    }
  };

  // Reset quiz state
  const resetQuiz = () => {
    setCurrentQuiz(null);
    setQuizStarted(false);
    setQuizFinished(false);
    setResults(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Timer expired callback
  const handleTimeExpired = () => {
    alert(
      "Time's Up! Your time for this quiz has expired. Let's see your results!"
    );
    submitQuiz();
  };

  // Determine difficulty badge color
  const getDifficultyColor = (level) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-orange-100 text-orange-800";
      case 4:
      case 5:
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Quiz Cards View
  const renderQuizCards = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      );
    }

    if (quizzes.length === 0) {
      return (
        <div className="p-6 text-center border rounded-lg bg-gray-50">
          <BookOpenIcon className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No quizzes available
          </h3>
          <p className="mt-1 text-gray-500">
            Check back later for new quizzes!
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {showSettingModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowSettingModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4 text-center">Quiz</h2>
              <p className="text-gray-700 mb-6 text-center">
                You can double click a word to see its definition. While you
                read the definition, the timer is stopped. Set the following
                parameters before you start the quiz.
              </p>
              <div className="flex gap-4 justify-center mb-4 ">
                <div className="w-full">
                  <label className="block mb-1 text-sm">Seconds Per</label>
                  <select
                    className="border p-2 rounded w-full"
                    value={secondsPerQuestion}
                    onChange={(e) =>
                      setSecondsPerQuestion(Number(e.target.value))
                    }
                  >
                    <option>10</option>
                    <option>20</option>
                    <option>30</option>
                    <option>40</option>
                  </select>
                </div>
                <div className="w-full">
                  <label className="block mb-1 text-sm">Start With</label>
                  <select
                    className="border p-2 rounded w-full"
                    value={startWith}
                    onChange={(e) => setStartWith(Number(e.target.value))}
                  >
                    <option>5</option>
                    {currentQuiz?.questions?.length >= 10 && (
                      <option>10</option>
                    )}
                    {currentQuiz?.questions?.length >= 20 && (
                      <option>20</option>
                    )}
                    {currentQuiz?.questions?.length >= 30 && (
                      <option>30</option>
                    )}
                    {currentQuiz?.questions?.length >= 40 && (
                      <option>40</option>
                    )}
                  </select>
                </div>
              </div>
              <button
                onClick={configQuizSetting}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                Start Quiz
              </button>
            </div>
          </div>
        )}
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-transform hover:shadow-lg hover:-translate-y-1"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900">
                  {quiz.title}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                    quiz.difficulty_level
                  )}`}
                >
                  {quiz.difficulty_level === 1
                    ? "Easy"
                    : quiz.difficulty_level === 2
                    ? "Medium"
                    : quiz.difficulty_level === 3
                    ? "Hard"
                    : quiz.difficulty_level === 4
                    ? "Expert"
                    : "Master"}
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {quiz.description}
              </p>

              <div className="mt-4 space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>{secondsPerQuestion} seconds per question</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <AcademicCapIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                  <span>{startWith} questions</span>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  onClick={() => startQuiz(quiz)}
                  className="w-full flex items-center justify-center"
                >
                  <PencilIcon className="h-5 w-5 mr-1.5" />
                  Start Quiz
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Quiz Questions View
  const renderQuizQuestions = () => {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {currentQuiz.title}
          </h2>
          <Timer
            initialTime={remainingTime}
            onTimeUpdate={setRemainingTime}
            onTimeExpired={handleTimeExpired}
          />
        </div>

        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {startWith}
          </span>
          <span className="text-sm font-medium text-gray-500">
            Time per question: {secondsPerQuestion}s
          </span>
        </div>

        <div className="h-1 w-full bg-gray-200 rounded-full mb-6">
          <div
            className="h-1 bg-blue-500 rounded-full"
            style={{
              width: `${
                ((currentQuestionIndex + 1) / currentQuiz.questions.length) *
                100
              }%`,
            }}
          ></div>
        </div>

        <Question
          questionData={currentQuestion}
          selectedAnswer={selectedAnswers[currentQuestion.question_id]}
          onAnswerSelect={(answer) =>
            handleAnswerSelect(currentQuestion.question_id, answer)
          }
        />

        <div className="mt-8 flex justify-between">
          <Button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center ${
              currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1.5" />
            Previous
          </Button>

          {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              className="bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button onClick={nextQuestion}>
              Next
              <ArrowLeftIcon className="h-5 w-5 ml-1.5 transform rotate-180" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Quiz Results View
  const renderQuizResults = () => {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <h2 className="text-xl font-bold">Quiz Results</h2>
          <h3 className="mt-1 text-lg">{currentQuiz.title}</h3>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg mb-4 sm:mb-0 sm:mr-2">
              <div className="text-3xl font-bold text-gray-800">
                {results.score.toFixed(0)}%
              </div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg mb-4 sm:mb-0 sm:mx-2">
              <div className="text-3xl font-bold text-green-600">
                {results.correctAnswers}
              </div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg sm:ml-2">
              <div className="text-3xl font-bold text-red-600">
                {results.incorrectAnswers}
              </div>
              <div className="text-sm text-gray-500">Incorrect</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-gray-700 font-medium mb-2">Time taken:</div>
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              <span>
                {Math.floor(results.timeTaken / 60)} minutes{" "}
                {results.timeTaken % 60} seconds
              </span>
            </div>
          </div>

          <h3 className="font-bold text-lg text-gray-800 mb-4">
            Question Review
          </h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {currentQuiz.questions.map((question) => {
              const userAnswer =
                selectedAnswers[question.question_id] || "No answer";
              const isCorrect = userAnswer === question.correct_answer;

              return (
                <div
                  key={question.question_id}
                  className={`p-4 border rounded-lg ${
                    isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start">
                    {isCorrect ? (
                      <CheckCircleIcon className="h-5 w-5 mt-0.5 mr-2 text-green-600" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 mt-0.5 mr-2 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-gray-800">
                        {question.question}
                      </p>
                      <div className="mt-2">
                        <p>
                          <span className="text-sm font-medium text-gray-500">
                            Your answer:{" "}
                          </span>
                          <span
                            className={
                              isCorrect ? "text-green-600" : "text-red-600"
                            }
                          >
                            {userAnswer}
                          </span>
                        </p>
                        {!isCorrect && (
                          <p className="mt-1">
                            <span className="text-sm font-medium text-gray-500">
                              Correct answer:{" "}
                            </span>
                            <span className="text-green-600">
                              {question.correct_answer}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-3">
            <Button onClick={resetQuiz}>Try Another Quiz</Button>
            <Button
              onClick={() => history.push("/dashboard")}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Quiz Practice
        </h1>
        <p className="mt-2 text-gray-600">
          Improve your language skills with interactive quizzes
        </p>
      </div>

      {!quizStarted && !quizFinished && (
        <div>
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
            <div className="flex items-start">
              <LightBulbIcon className="h-5 w-5 mr-2 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-700">Quiz Tips</h3>
                <p className="text-sm text-blue-600">
                  Take your time to read each question carefully. You can
                  navigate between questions. Your progress is automatically
                  saved when you submit the quiz.
                </p>
              </div>
            </div>
          </div>

          {renderQuizCards()}
        </div>
      )}

      {quizStarted && !quizFinished && renderQuizQuestions()}

      {quizFinished && renderQuizResults()}
    </div>
  );
};

export default PageQuiz;
