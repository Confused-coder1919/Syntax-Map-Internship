import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "./AdminLayout";
import { API_BASE_URL } from "../../config";
import {
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeSlashIcon
} from "@heroicons/react/24/outline";

const QuizBuilder = () => {
  // Main state variables
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tenses, setTenses] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Quiz creation/editing states
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    tense_id: "",
    difficulty_level: 2,
    time_per_question: 30,
    number_of_questions: 10,
    status: "active",
    questions: []
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({});

  // Question management state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionForm, setQuestionForm] = useState({
    question_type: "mcq",
    question: "",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation:""
  });

  // Fetch initial data
  useEffect(() => {

    fetchTenses();
    fetchQuizzes();
  }, []);

  // Fetch tenses for dropdown selection
  const fetchTenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tense`, {
        headers: {
          "Authorization": localStorage.getItem("jstoken")
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tenses: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.tenses) {
        setTenses(data.tenses);
      }
    } catch (err) {
      console.error("Error fetching tenses:", err);
      setError("Failed to load tenses. Please refresh the page and try again.");
    }
  };

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/practice/quiz`, {
        headers: {
          "Authorization": localStorage.getItem("jstoken")
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quizzes: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data) {
        setQuizzes(data.data);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
      setError("Failed to load quizzes. Please refresh the page and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz form input changes
  const handleQuizFormChange = (e) => {
    const { name, value } = e.target;
    setQuizForm({
      ...quizForm,
      [name]: name === "difficulty_level" || name === "time_per_question" || name === "number_of_questions"
        ? parseInt(value, 10)
        : value
    });
  };

  // Handle question form input changes
  const handleQuestionFormChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm({
      ...questionForm,
      [name]: value
    });
  };

  // Handle changes to question options
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...questionForm.options];
    updatedOptions[index] = value;
    setQuestionForm({
      ...questionForm,
      options: updatedOptions
    });
  };

  // Add a question to the quiz
  const addQuestion = () => {
    // Validate question form
    const errors = {};
    if (!questionForm.question.trim()) {
      errors.question = "Question text is required";
    }

    const optionsWithValues = questionForm.options.filter(opt => opt.trim());
    if (optionsWithValues.length < 2) {
      errors.options = "At least 2 options are required";
    }

    if (!questionForm.correct_answer) {
      errors.correct_answer = "Please select the correct answer";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Add the question to the quiz form
    const newQuestions = [
      ...quizForm.questions,
      {
        ...questionForm
      }
    ];

    // Update quiz form with the new question
    setQuizForm({
      ...quizForm,
      questions: newQuestions
    });

    // Reset question form for the next question
    setQuestionForm({
      question_type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correct_answer: ""
    });

    // Clear form errors
    setFormErrors({});

    // Provide feedback to user
    toast.success("Question added successfully");
  };

  // Remove a question from the quiz
  const removeQuestion = (index) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions.splice(index, 1);
    setQuizForm({
      ...quizForm,
      questions: updatedQuestions
    });
    toast.success("Question removed");
  };

  // Edit a specific question
  const editQuestion = (index) => {
    setCurrentQuestionIndex(index);
    const question = quizForm.questions[index];
    setQuestionForm({
      ...question
    });
  };

  // Update an existing question
  const updateQuestion = () => {
    // Validate question form
    const errors = {};
    if (!questionForm.question.trim()) {
      errors.question = "Question text is required";
    }
    if (!questionForm.explanation.trim()) {
      errors.explanation = "explanation text is required";
    }

    const optionsWithValues = questionForm.options.filter(opt => opt.trim());
    if (optionsWithValues.length < 2) {
      errors.options = "At least 2 options are required";
    }

    if (!questionForm.correct_answer) {
      errors.correct_answer = "Please select the correct answer";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Update the question in the quiz form
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions[currentQuestionIndex] = { ...questionForm };

    setQuizForm({
      ...quizForm,
      questions: updatedQuestions
    });

    // Reset question form and index
    setQuestionForm({
      question_type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correct_answer: "",
      explanation:""
    });
    setCurrentQuestionIndex(-1);

    // Clear form errors
    setFormErrors({});

    // Provide feedback to user
    toast.success("Question updated successfully");
  };

  // Submit quiz form to create a new quiz
  const createQuiz = async () => {
    // Validate the entire quiz form
    const errors = {};
    if (!quizForm.title.trim()) {
      errors.title = "Quiz title is required";
    }

    if (!quizForm.description.trim()) {
      errors.description = "Description is required";
    }

    if (!quizForm.tense_id) {
      errors.tense_id = "Please select a tense";
    }

    if (quizForm.questions.length < 1) {
      errors.questions = "At least one question is required";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/practice/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("jstoken")
        },
        body: JSON.stringify(quizForm)
      });

      

      if (!response.ok) {
        throw new Error(`Failed to create quiz: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.success) {
        // Reset form and state
        setQuizForm({
          title: "",
          description: "",
          tense_id: "",
          difficulty_level: 2,
          time_per_question: 30,
          number_of_questions: 10,
          status: "active",
          questions: []
        });

        setCreatingQuiz(false);
        setSuccess("Quiz created successfully!");

        // Refresh quizzes
        fetchQuizzes();
      } else {
        throw new Error(data.message || "Failed to create quiz");
      }
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Failed to create quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // Update quiz status (active/inactive)
  const toggleQuizStatus = async (quizId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/practice/quiz/${quizId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": localStorage.getItem("jstoken")
        },
        body: JSON.stringify({
          "status": currentStatus === "active" ? "inactive" : "active"
        })
      });

      const data = await response.json();
      toast.success(`Quiz ${currentStatus === "active" ? "deactivated" : "activated"} successfully`);

      // Refresh quizzes
      fetchQuizzes();

    } catch (err) {
      console.log(err)
      console.error("Error updating quiz status:", err);
      toast.error("Failed to update quiz status. Please try again.");
    }
  };



  // Toggle expansion of quiz details
  const toggleQuizExpansion = (quizId) => {
    if (expandedQuizId === quizId) {
      setExpandedQuizId(null);
    } else {
      setExpandedQuizId(quizId);
    }
  };

  // Cancel form submission
  const cancelForm = () => {
    // Reset form state
    setQuizForm({
      title: "",
      description: "",
      tense_id: "",
      difficulty_level: 2,
      time_per_question: 30,
      number_of_questions: 10,
      status: "active",
      questions: []
    });

    setQuestionForm({
      question_type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correct_answer: ""
    });

    setFormErrors({});
    setCreatingQuiz(false);
  };

  // Render quiz form for creating/editing
  const renderQuizForm = () => (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {"Create New Quiz"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Quiz Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
            Quiz Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={quizForm.title}
            onChange={handleQuizFormChange}
            className={`w-full rounded-md border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            placeholder="Enter quiz title"
          />
          {formErrors.title && (
            <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
          )}
        </div>

        {/* Tense Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tense_id">
            Tense <span className="text-red-500">*</span>
          </label>
          <select
            id="tense_id"
            name="tense_id"
            value={quizForm.tense_id}
            onChange={handleQuizFormChange}
            className={`w-full rounded-md border ${formErrors.tense_id ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
          >
            <option value="">Select a tense</option>
            {tenses.map(tense => (
              <option key={tense.tense_id} value={tense.tense_id}>
                {tense.tense_name}
              </option>
            ))}
          </select>
          {formErrors.tense_id && (
            <p className="mt-1 text-sm text-red-500">{formErrors.tense_id}</p>
          )}
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={quizForm.description}
            onChange={handleQuizFormChange}
            rows={3}
            className={`w-full rounded-md border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
            placeholder="Enter quiz description"
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
          )}
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="difficulty_level">
            Difficulty Level
          </label>
          <select
            id="difficulty_level"
            name="difficulty_level"
            value={quizForm.difficulty_level}
            onChange={handleQuizFormChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value={1}>Easy</option>
            <option value={2}>Medium</option>
            <option value={3}>Hard</option>
          </select>
        </div>

        {/* Time Per Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="time_per_question">
            Time Per Question (seconds)
          </label>
          <input
            type="number"
            id="time_per_question"
            name="time_per_question"
            min={5}
            max={300}
            value={quizForm.time_per_question}
            onChange={handleQuizFormChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Number of Questions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="number_of_questions">
            Number of Questions
          </label>
          <input
            type="number"
            id="number_of_questions"
            name="number_of_questions"
            min={1}
            max={20}
            value={quizForm.number_of_questions}
            onChange={handleQuizFormChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Quiz Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={quizForm.status}
            onChange={handleQuizFormChange}
            className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-200 my-6 pt-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Questions
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({quizForm.questions.length} added)
          </span>
        </h3>

        {formErrors.questions && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{formErrors.questions}</p>
          </div>
        )}

        {/* Question List */}
        {quizForm.questions.length > 0 && (
          <div className="mb-6 bg-gray-50 rounded-md p-4">
            {quizForm.questions.map((question, index) => (
              <div key={index} className="flex items-start justify-between p-3 border-b border-gray-200 last:border-0">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    <span className="inline-block bg-gray-200 text-gray-600 rounded-full w-6 h-6 text-center mr-2">
                      {index + 1}
                    </span>
                    {question.question}
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {question.explanation}
                  </p>

                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className={`text-xs px-2 py-1 rounded ${option === question.correct_answer ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {option}
                        {option === question.correct_answer && (
                          <CheckIcon className="inline-block h-3 w-3 ml-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    type="button"
                    onClick={() => editQuestion(index)}
                    className="p-1 text-gray-500 hover:text-indigo-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="p-1 text-gray-500 hover:text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Question Form */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-700 mb-3">
            {currentQuestionIndex !== -1 ? "Edit Question" : "Add New Question"}
          </h4>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="question">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="question"
              name="question"
              value={questionForm.question}
              onChange={handleQuestionFormChange}
              className={`w-full rounded-md border ${formErrors.question ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              placeholder="Enter question text"
            />
            {formErrors.question && (
              <p className="mt-1 text-sm text-red-500">{formErrors.question}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="explanation">
              explanation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="explanation"
              name="explanation"
              value={questionForm.explanation}
              onChange={handleQuestionFormChange}
              rows={3}
              className={`w-full rounded-md border ${formErrors.explanation ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              placeholder="Enter quiz description"
            />
            {formErrors.explanation && (
              <p className="mt-1 text-sm text-red-500">{formErrors.explanation}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Options <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {questionForm.options.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    id={`correct_${index}`}
                    name="correct_answer"
                    value={option}
                    checked={questionForm.correct_answer === option}
                    onChange={handleQuestionFormChange}
                    className="mr-2"
                    disabled={!option.trim()}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className={`flex-1 rounded-md border ${formErrors.options && !option.trim() ? 'border-red-500' : 'border-gray-300'} shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
            </div>
            {formErrors.options && (
              <p className="mt-1 text-sm text-red-500">{formErrors.options}</p>
            )}
            {formErrors.correct_answer && (
              <p className="mt-1 text-sm text-red-500">{formErrors.correct_answer}</p>
            )}
          </div>

          <div className="flex justify-end">
            {currentQuestionIndex !== -1 ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentQuestionIndex(-1);
                    setQuestionForm({
                      question_type: "mcq",
                      question: "",
                      options: ["", "", "", ""],
                      correct_answer: ""
                    });
                    setFormErrors({});
                  }}
                  className="mr-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateQuestion}
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Update Question
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={addQuestion}
                className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Question
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6 space-x-3">
        <button
          type="button"
          onClick={cancelForm}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={createQuiz}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 flex items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading && (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {"Create Quiz"}
        </button>
      </div>
    </div>
  );

  // Render quiz list
  const renderQuizList = () => (
    <div className="space-y-6">
      {quizzes.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-8 text-center">
          <QuestionMarkCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first quiz.</p>
          <button
            onClick={() => setCreatingQuiz(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create Quiz
          </button>
        </div>
      ) : (
        quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                  <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${quiz.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {quiz.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{quiz.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center">
                    <span className="font-medium text-gray-900">Difficulty:</span>
                    <span className="ml-1">
                      {quiz.difficulty_level === 1 ? 'Easy' : quiz.difficulty_level === 2 ? 'Medium' : 'Hard'}
                    </span>
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium text-gray-900">Time:</span>
                    <span className="ml-1">{quiz.time_per_question}s per question</span>
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium text-gray-900">Questions:</span>
                    <span className="ml-1">{quiz.number_of_questions}</span>
                  </span>
                  {tenses.find(t => t.tense_id === quiz.tense_id) && (
                    <span className="flex items-center">
                      <span className="font-medium text-gray-900">Tense:</span>
                      <span className="ml-1">{tenses.find(t => t.tense_id === quiz.tense_id).tense_name}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleQuizStatus(quiz.id, quiz.status)}
                  className={`p-1.5 rounded-full ${quiz.status === 'active' ? 'hover:bg-red-100' : 'hover:bg-green-100'}`}
                  title={quiz.status === 'active' ? 'Deactivate Quiz' : 'Activate Quiz'}
                >
                  {quiz.status === 'active' ? (
                    <EyeIcon className="h-5 w-5 text-gray-500 hover:text-green-600" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500 hover:text-red-600" />
                  )}
                </button>
                <button
                  onClick={() => toggleQuizExpansion(quiz.id)}
                  className="p-1.5 rounded-full hover:bg-gray-100"
                  title={expandedQuizId === quiz.id ? "Collapse Quiz Details" : "Expand Quiz Details"}
                >
                  {expandedQuizId === quiz.id ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {expandedQuizId === quiz.id && quiz.questions.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Quiz Questions</h4>
                <div className="space-y-4">
                  {quiz.questions.map((question, index) => (
                    <div key={index} className="p-3 bg-white rounded-md shadow-sm">
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        <span className="inline-block bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 text-center mr-2 text-xs">
                          {index + 1}
                        </span>
                        {question.question}
                      </p>
                      <p className="text-sm font-medium text-gray-800 mb-2">
                        {question.explanation}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`text-xs px-2 py-1.5 rounded-md ${option === question.correct_answer ? 'bg-green-100 border border-green-200 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                            {option}
                            {option === question.correct_answer && (
                              <CheckIcon className="inline-block h-3 w-3 ml-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <AdminLayout title="Quiz Builder">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quiz Builder</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage quizzes for your language lessons
            </p>
          </div>
          <button
            onClick={() => setCreatingQuiz(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Create Quiz
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-700 hover:text-green-900"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        {loading && !creatingQuiz && !editingQuizId ? (
          <div className="flex justify-center items-center h-64">
            <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {(creatingQuiz || editingQuizId) ? renderQuizForm() : renderQuizList()}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default QuizBuilder;