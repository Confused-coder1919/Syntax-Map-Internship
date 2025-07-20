import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { LockClosedIcon, CheckCircleIcon, XCircleIcon, ClockIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const QuizPreview = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30); // seconds per question
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Sample quiz data
  const quiz = {
    name: 'Present Simple Quiz (Preview)',
    description: 'Test your knowledge of Present Simple tense',
    totalQuestions: 5,
    questions: [
      {
        id: 1,
        type: 'multiple-choice',
        text: 'She _____ to work every day.',
        options: ['go', 'goes', 'going', 'is going'],
        correctAnswer: 'goes',
        explanation: 'In Present Simple, we add -s or -es to the base form of the verb for third person singular (he, she, it).'
      },
      {
        id: 2,
        type: 'multiple-choice',
        text: 'They _____ in London.',
        options: ['live', 'lives', 'living', 'are living'],
        correctAnswer: 'live',
        explanation: 'For plural subjects, we use the base form of the verb without -s in Present Simple.'
      },
      {
        id: 3,
        type: 'multiple-choice',
        text: '_____ she like chocolate?',
        options: ['Do', 'Does', 'Is', 'Are'],
        correctAnswer: 'Does',
        explanation: 'For questions in Present Simple with third person singular, we use "does" as an auxiliary verb.'
      },
      {
        id: 4,
        type: 'true-false',
        text: 'In negative sentences with "he", "she", or "it", we use "don\'t".',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'We use "doesn\'t" for negatives with third person singular (he, she, it), not "don\'t".'
      },
      {
        id: 5,
        type: 'fill-in',
        text: 'Water _____ (boil) at 100°C.',
        correctAnswer: 'boils',
        explanation: 'For scientific facts in Present Simple with singular subjects like "water", we add -s to the verb.'
      }
    ]
  };

  // Timer effect
  React.useEffect(() => {
    let timer;
    if (quizStarted && !quizCompleted && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !quizCompleted) {
      // Time's up for this question
      handleTimeUp();
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [quizStarted, timeLeft, quizCompleted]);

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setAnswers([]);
    setTimeLeft(30);
    setQuizCompleted(false);
    setScore(0);
  };

  const handleSelectAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
    
    // Move to next question or complete quiz
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30); // Reset timer for next question
    } else {
      completeQuiz(newAnswers);
    }
  };
  
  const handleFillInAnswer = (e) => {
    e.preventDefault();
    const answer = e.target.answer.value.trim();
    if (!answer) return;
    
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    
    // Move to next question or complete quiz
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30); // Reset timer for next question
      e.target.answer.value = ''; // Clear input
    } else {
      completeQuiz(newAnswers);
    }
  };

  const handleTimeUp = () => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = "no answer"; // Mark as no answer
    setAnswers(newAnswers);
    
    // Move to next question or complete quiz
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30); // Reset timer for next question
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = (finalAnswers) => {
    // Calculate score
    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    setScore(correctAnswers);
    setQuizCompleted(true);
  };
  
  const formatTime = (seconds) => {
    return `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' : ''}${seconds % 60}`;
  };

  return (
    <GuestLayout title="Quiz Preview">
      {!quizStarted ? (
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {quiz.name}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {quiz.description}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Questions</dt>
                  <dd className="mt-1 text-sm text-gray-900">{quiz.totalQuestions}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Time Per Question</dt>
                  <dd className="mt-1 text-sm text-gray-900">30 seconds</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Difficulty</dt>
                  <dd className="mt-1 text-sm text-gray-900">Beginner</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Tense Focus</dt>
                  <dd className="mt-1 text-sm text-gray-900">Present Simple</dd>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleStartQuiz}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <LightBulbIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  This is a preview quiz with 5 questions. As a guest user, you can try this sample quiz, but your progress won't be saved.
                  <Link
                    to="/register"
                    className="font-medium text-yellow-700 underline ml-1"
                  >
                    Create an account
                  </Link> to unlock all quizzes and track your progress.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 flex flex-col">
              <div className="px-4 py-5 sm:p-6 flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Multiple Choice</h3>
                    <p className="text-sm text-gray-500">Select the correct answer from options</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 flex flex-col">
              <div className="px-4 py-5 sm:p-6 flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <XCircleIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">True/False</h3>
                    <p className="text-sm text-gray-500">Determine if statements are correct</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 flex flex-col">
              <div className="px-4 py-5 sm:p-6 flex-1">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5">
                    <h3 className="text-lg font-medium text-gray-900">Fill in the Blank</h3>
                    <p className="text-sm text-gray-500">Complete sentences with correct words</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : quizCompleted ? (
        // Quiz Results
        <div className="space-y-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quiz Completed!
              </h3>
              <div className="mt-6">
                <div className="text-5xl font-bold text-indigo-600">
                  {score}/{quiz.questions.length}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Your score for {quiz.name}
                </p>
              </div>
              
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h4 className="text-lg font-medium text-gray-900">Review Your Answers</h4>
                <div className="mt-4 space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div 
                      key={question.id} 
                      className={`p-4 rounded-lg ${answers[index] === question.correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {answers[index] === question.correctAnswer ? (
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          ) : (
                            <XMarkIcon className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h5 className="text-sm font-medium text-gray-900">
                            Question {index + 1}: {question.text}
                          </h5>
                          <p className="mt-1 text-sm">
                            <span className="text-gray-700">Your answer: </span>
                            <span className={`font-medium ${answers[index] === question.correctAnswer ? 'text-green-700' : 'text-red-700'}`}>
                              {answers[index] === "no answer" ? "Time expired" : answers[index]}
                            </span>
                          </p>
                          <p className="mt-1 text-sm">
                            <span className="text-gray-700">Correct answer: </span>
                            <span className="font-medium text-green-700">{question.correctAnswer}</span>
                          </p>
                          <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded">
                            <span className="font-medium">Explanation: </span>
                            {question.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleStartQuiz}
                  className="mr-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  Try Again
                </button>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign Up to Save Progress
                </Link>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                As a guest, your quiz results won't be saved.
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Active Quiz
        <div className="space-y-6">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {/* Quiz progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <div>Question {currentQuestion + 1} of {quiz.questions.length}</div>
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1 text-red-500" />
                    {timeLeft <= 10 ? (
                      <span className="text-red-500 font-medium">{formatTime(timeLeft)}</span>
                    ) : (
                      <span>{formatTime(timeLeft)}</span>
                    )}
                  </div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`}}
                  ></div>
                </div>
              </div>
              
              {/* Current question */}
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {quiz.questions[currentQuestion].text}
                </h3>
                <div className="mt-6">
                  {quiz.questions[currentQuestion].type === 'fill-in' ? (
                    <form onSubmit={handleFillInAnswer} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          name="answer"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Type your answer"
                          autoFocus
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Next
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {quiz.questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectAnswer(option)}
                          className="w-full text-left px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </GuestLayout>
  );
};

export default QuizPreview;