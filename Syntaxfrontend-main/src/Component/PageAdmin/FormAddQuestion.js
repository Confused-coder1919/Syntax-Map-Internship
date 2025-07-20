import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import config from "../../config";
import AdminLayout from "./AdminLayout";

const FormAddQuestion = ({fetchQuestions, standalone = false}) => {
  const [formData, setFormData] = useState({
    question: "",
    answers: ["", "", "", ""],
    difficulty: "1",
    course: []
  });
  const [listCourse, setListCourse] = useState([]);
  const [showModItems, setShowModItems] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/tense`, {
        headers: {
          "Authorization": localStorage.getItem('jstoken')
        }
      });
      const data = await response.json();
      setListCourse(data.courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to load courses");
    }
  };

  const handleQuestionChange = (e) => {
    setFormData(prev => ({
      ...prev,
      question: e.target.value
    }));
    setSuccessMessage("");
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData(prev => ({
      ...prev,
      answers: newAnswers
    }));
    setSuccessMessage("");
  };

  const handleDifficultyChange = (e) => {
    setFormData(prev => ({
      ...prev,
      difficulty: e.target.value
    }));
    setSuccessMessage("");
  };

  const handleCourseChange = (courseId) => {
    const numericId = parseInt(courseId, 10);
    const updatedCourses = [...formData.course];
    
    const index = updatedCourses.indexOf(numericId);
    if (index >= 0) {
      updatedCourses.splice(index, 1);
    } else {
      updatedCourses.push(numericId);
    }
    
    setFormData(prev => ({
      ...prev,
      course: updatedCourses
    }));
    setSuccessMessage("");
  };

  const toggleModItems = () => {
    setShowModItems(!showModItems);
  };

  const checkCombinationOrder = (order, id) => {
    let i = 0;
    let tmp = id;

    while (tmp > 0) {
      tmp = tmp - Math.pow(2, Math.floor(Math.log2(tmp)));
      i = i + 1;
    }

    return i === order;
  };

  const isMod = (id) => {
    if (id > 127 && id <= 65536 && !showModItems) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Ensure course IDs are numbers and non-empty
      const cleanedCourseIds = formData.course.filter(id => id !== null && id !== undefined);
      
      // Structure the data according to what the backend expects
      const requestBody = {
        quiz_data: formData.answers.map(answer => answer.trim()).filter(answer => answer),
        question_title: formData.question.trim(),
        online_exam_ids: cleanedCourseIds,
        difficulty: parseInt(formData.difficulty, 10),
        verified: false // Default new questions to unverified
      };
      
      console.log("Sending quiz data:", requestBody);

      const response = await fetch(`${config.backendUrl}/quiz`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Authorization": localStorage.getItem('jstoken')
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      toast.success("Question added successfully!");
      
      if (typeof fetchQuestions === 'function') {
        fetchQuestions();
      }
      
      // Reset form
      setFormData({
        question: "",
        answers: ["", "", "", ""],
        difficulty: "1",
        course: []
      });
      
      setSuccessMessage(`Successfully added question: ${data.msg || "Quiz question created"}`);
    } catch (error) {
      console.error("Error adding question:", error);
      toast.error(`Failed to add question: ${error.message || "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group courses by combination rank
  const rank4Courses = listCourse.filter(course => checkCombinationOrder(4, course.course_id));
  const rank3Courses = listCourse.filter(course => checkCombinationOrder(3, course.course_id));
  const rank2Courses = listCourse.filter(course => checkCombinationOrder(2, course.course_id));
  const simpleItems = listCourse.filter(course => 
    (Number.isInteger(Math.log2(course.course_id)) && isMod(course.course_id)) || course.course_id === 0
  );
  const modToggle = listCourse.find(course => course.course_id === 127);

  // Render with or without AdminLayout based on prop
  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Course Selection Section */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Combination Rank 4</h3>
            <div className="flex flex-wrap gap-2">
              {rank4Courses.map((course, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`course-${course.course_id}`}
                    value={course.course_id}
                    checked={formData.course.includes(course.course_id)}
                    onChange={() => handleCourseChange(course.course_id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`course-${course.course_id}`}
                    className="ml-2 mr-4 text-sm text-gray-700 border-r border-gray-300 pr-2"
                  >
                    {course.course_item}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Combination Rank 3</h3>
            <div className="flex flex-wrap gap-2">
              {rank3Courses.map((course, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`course-${course.course_id}`}
                    value={course.course_id}
                    checked={formData.course.includes(course.course_id)}
                    onChange={() => handleCourseChange(course.course_id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`course-${course.course_id}`}
                    className="ml-2 mr-4 text-sm text-gray-700 border-r border-gray-300 pr-2"
                  >
                    {course.course_item}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Combination Rank 2</h3>
            <div className="flex flex-wrap gap-2">
              {rank2Courses.map((course, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`course-${course.course_id}`}
                    value={course.course_id}
                    checked={formData.course.includes(course.course_id)}
                    onChange={() => handleCourseChange(course.course_id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`course-${course.course_id}`}
                    className="ml-2 mr-4 text-sm text-gray-700 border-r border-gray-300 pr-2"
                  >
                    {course.course_item}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700">Simple Items</h3>
              {modToggle && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="mod-toggle"
                    checked={showModItems}
                    onChange={toggleModItems}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="mod-toggle" className="ml-2 text-sm text-gray-700">
                    {modToggle.course_item}
                  </label>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {simpleItems.map((course, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`course-${course.course_id}`}
                    value={course.course_id}
                    checked={formData.course.includes(course.course_id)}
                    onChange={() => handleCourseChange(course.course_id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`course-${course.course_id}`}
                    className="ml-2 mr-4 text-sm text-gray-700 border-r border-gray-300 pr-2"
                  >
                    {course.course_item}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Question and Answers Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="question"
                id="question"
                value={formData.question}
                onChange={handleQuestionChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300"
                placeholder="It ____ a simple sentence"
                required
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Example: It ____ a simple sentence</p>
          </div>
          
          <div>
            <label htmlFor="answerA" className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
            </label>
            <input
              type="text"
              name="answerA"
              id="answerA"
              value={formData.answers[0]}
              onChange={(e) => handleAnswerChange(0, e.target.value)}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="answerB" className="block text-sm font-medium text-gray-700 mb-1">
                Wrong Answer 1
              </label>
              <input
                type="text"
                name="answerB"
                id="answerB"
                value={formData.answers[1]}
                onChange={(e) => handleAnswerChange(1, e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                required
              />
            </div>
            
            <div>
              <label htmlFor="answerC" className="block text-sm font-medium text-gray-700 mb-1">
                Wrong Answer 2
              </label>
              <input
                type="text"
                name="answerC"
                id="answerC"
                value={formData.answers[2]}
                onChange={(e) => handleAnswerChange(2, e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                required
              />
            </div>
            
            <div>
              <label htmlFor="answerD" className="block text-sm font-medium text-gray-700 mb-1">
                Wrong Answer 3
              </label>
              <input
                type="text"
                name="answerD"
                id="answerD"
                value={formData.answers[3]}
                onChange={(e) => handleAnswerChange(3, e.target.value)}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-md sm:text-sm border-gray-300"
                required
              />
            </div>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Difficulty Level
            </label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  id="easy"
                  name="difficulty"
                  type="radio"
                  value="1"
                  checked={formData.difficulty === "1"}
                  onChange={handleDifficultyChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor="easy" className="ml-3 block text-sm font-medium text-gray-700">
                  Easy
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="medium"
                  name="difficulty"
                  type="radio"
                  value="2"
                  checked={formData.difficulty === "2"}
                  onChange={handleDifficultyChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor="medium" className="ml-3 block text-sm font-medium text-gray-700">
                  Medium
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="toeic"
                  name="difficulty"
                  type="radio"
                  value="3"
                  checked={formData.difficulty === "3"}
                  onChange={handleDifficultyChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                />
                <label htmlFor="toeic" className="ml-3 block text-sm font-medium text-gray-700">
                  TOEIC
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`
              w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md
              shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
            `}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding Question...
              </>
            ) : (
              "Add Question"
            )}
          </motion.button>
        </div>
      </form>
      
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-md bg-green-50 border border-green-200"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                {successMessage}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // Only wrap in AdminLayout if used as standalone component
  return standalone ? <AdminLayout title="Quiz Builder">{content}</AdminLayout> : content;
};

export default FormAddQuestion;