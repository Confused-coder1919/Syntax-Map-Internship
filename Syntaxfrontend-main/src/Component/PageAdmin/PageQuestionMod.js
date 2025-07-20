import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import AdminLayout from "./AdminLayout";
import FormAddQuestion from "./FormAddQuestion";
import toast from "react-hot-toast";
import config from "../../config";

const PageQuestionMod = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [page, setPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(10);
  const [questionToDelete, setQuestionToDelete] = useState({
    id: -1,
    item: "",
    title: ""
  });
  const [filters, setFilters] = useState({
    title: "",
    item: "",
    difficulty: "",
    verified: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if(filters.title || filters.item || filters.difficulty || filters.verified) {
      applyFilters();
    }
  }, [filters, questions]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${config.backendUrl}/quiz`, {
        headers: {
          "Authorization": localStorage.getItem('jstoken')
        }
      });
      const data = await response.json();
      setFilteredQuestions(data.questions || []);
      setQuestions(data.questions);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };
  const applyFilters = () => {
    const filtered = questions.filter(question => {
      let result = true;
      
      // Apply title filter
      if (filters.title) {
        result = result && question.question_title && question.question_title.toLowerCase().includes(filters.title.toLowerCase());
      }
      
      // Apply difficulty filter
      if (filters.difficulty) {
        result = result && question.difficulty == filters.difficulty;
      }
      
      // Apply item filter
      if (filters.item && question.online_exam_ids) {
        result = result && question.online_exam_ids.join().toLowerCase().includes(filters.item.toLowerCase());
      }
      
      // Apply verified filter - only check when the filter is on
      if (filters.verified) {
        result = result && question.verified === true;
      }
      
      return result;
    });
    
    setFilteredQuestions(filtered||[]);
    setPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const confirmDelete = (id, item, title) => {
    setQuestionToDelete({ id, item, title });
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${config.backendUrl}/quiz/${questionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          "Authorization": localStorage.getItem('jstoken')
        }
      });
      
      const data = await response.json();
      
      // Remove the deleted question from state
      fetchQuestions(); // Refresh the questions list
      toast.success("Question deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete question");
    } finally {
      setShowDeleteModal(false);
      setQuestionToDelete({ id: -1, item: "", title: "" });
    }
  };

  const handleUpdateQuestion = async (e, questionId) => {
    e.preventDefault();
    const form = e.target;
  
    try {
      // Clean and parse the exam IDs properly
      const examIds = form.examIds.value
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '')
        .map(id => parseInt(id, 10));
      
      const updatedData = {
        question_id: questionId,
        online_exam_ids: examIds,
        question_title: form.title.value.trim(),
        answer_title_a: form.answerA.value.trim(),
        answer_title_b: form.answerB.value.trim(),
        answer_title_c: form.answerC.value.trim(),
        answer_title_d: form.answerD.value.trim(),
        right_answer: form.rightAnswer.value.trim(),
        difficulty: parseInt(form.difficulty.value, 10),
        verified: form.verified.checked
      };
    
      console.log("Updating question with data:", updatedData);
    
      const response = await fetch(`${config.backendUrl}/quiz/${questionId}/`, {
        method: 'PUT',
        body: JSON.stringify(updatedData),
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": localStorage.getItem('jstoken')
        }
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from server:", errorText);
        throw new Error(`Failed to update: ${response.status} ${response.statusText}`);
      }
    
      let data = {};
      const responseText = await response.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.warn("Response was not valid JSON, but operation was successful");
        }
      }
    
      // Update the question in the local state 
      setQuestions(prev => 
        prev.map(q => q.question_id === questionId ? {
          ...q,
          ...updatedData
        } : q)
      );
      
      // Hide the edit form
      document.getElementById(`edit-form-${questionId}`).classList.add('hidden');
      
      // Refresh the questions list to get the latest data
      await fetchQuestions();
      
      toast.success("Question updated successfully");
    
    } catch (err) {
      console.error("Update error:", err);
      toast.error(`Failed to update question: ${err.message}`);
    }
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredQuestions?.length / questionsPerPage);
  const startIndex = (page - 1) * questionsPerPage;
  const paginatedQuestions = filteredQuestions?.slice(startIndex, startIndex + questionsPerPage);

  // Check if there are no questions after filtering
  const noQuestionsFound = filteredQuestions?.length === 0 && !isLoading;

  return (
    <AdminLayout title="Question Management">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Add Question Form */}
        <motion.div
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-medium text-indigo-800">Add New Question</h2>
          </div>
          <div className="p-6">
            <FormAddQuestion fetchQuestions={()=>fetchQuestions()}  />
          </div>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-medium text-indigo-800">Filter Questions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Question Contains
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={filters.title}
                  onChange={handleFilterChange}
                  placeholder="Search by title..."
                />
              </div>
              
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={filters.difficulty}
                  onChange={handleFilterChange}
                >
                  <option value="">All Difficulties</option>
                  <option value="1">Easy (1)</option>
                  <option value="2">Medium (2)</option>
                  <option value="3">Hard (3)</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-1">
                  Item ID
                </label>
                <input
                  id="item"
                  name="item"
                  type="text"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={filters.item}
                  onChange={handleFilterChange}
                  placeholder="Search by item ID..."
                />
              </div>
              
              <div className="flex items-end">
                <div className="flex items-center h-10">
                  <input
                    id="verified"
                    name="verified"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={filters.verified}
                    onChange={handleFilterChange}
                  />
                  <label htmlFor="verified" className="ml-2 block text-sm text-gray-700">
                    Verified Only
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Found <span className="font-medium">{filteredQuestions?.length}</span> questions
              </div>
              
              <div className="flex items-center">
                <label htmlFor="questionsPerPage" className="mr-2 text-sm text-gray-600">
                  Show
                </label>
                <select
                  id="questionsPerPage"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                  value={questionsPerPage}
                  onChange={(e) => setQuestionsPerPage(Number(e.target.value))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions Table */}
        <motion.div
          ref={ref}
          className="bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100">
            <h2 className="text-lg font-medium text-indigo-800">Question List</h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : noQuestionsFound ? (
            <div className="flex flex-col justify-center items-center h-64 text-gray-500">
              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-lg font-medium">No questions found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 ">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item IDs</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answers</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {paginatedQuestions.map((question, index) => (
                    <motion.tr 
                      key={question.question_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {question.question_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.online_exam_ids ? question.online_exam_ids.join(', ') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {question.question_title}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>A: {question.answer_title_a}</div>
                          <div>B: {question.answer_title_b}</div>
                          <div>C: {question.answer_title_c}</div>
                          <div>D: {question.answer_title_d}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {question.right_answer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          question.difficulty == 1 ? 'bg-green-100 text-green-800' :
                          question.difficulty == 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty == 1 ? 'Easy' :
                           question.difficulty == 2 ? 'Medium' : 'Hard'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          question.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {question.verified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => {
                            document.getElementById(`edit-form-${question.question_id}`).classList.toggle('hidden');
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(question.question_id, question.question_item, question.question_title)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                        
                        {/* Hidden edit form */}
                        <div id={`edit-form-${question.question_id}`} className="hidden mt-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Edit Question</h4>
                          <form onSubmit={(e) => handleUpdateQuestion(e, question.question_id)} className="space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Item IDs</label>
                              <input
                                name="examIds"
                                type="text"
                                defaultValue={question.online_exam_ids ? question.online_exam_ids.join(', ') : ''}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500">Question</label>
                              <input
                                name="title"
                                type="text"
                                defaultValue={question.question_title}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Answer A</label>
                                <input
                                  name="answerA"
                                  type="text"
                                  defaultValue={question.answer_title_a}
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Answer B</label>
                                <input
                                  name="answerB"
                                  type="text"
                                  defaultValue={question.answer_title_b}
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Answer C</label>
                                <input
                                  name="answerC"
                                  type="text"
                                  defaultValue={question.answer_title_c}
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Answer D</label>
                                <input
                                  name="answerD"
                                  type="text"
                                  defaultValue={question.answer_title_d}
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Correct Answer</label>
                                <input
                                  name="rightAnswer"
                                  type="text"
                                  defaultValue={question.right_answer}
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500">Difficulty</label>
                                <select
                                  name="difficulty"
                                  defaultValue={question.difficulty}
                                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                  <option value="1">Easy (1)</option>
                                  <option value="2">Medium (2)</option>
                                  <option value="3">Hard (3)</option>
                                </select>
                              </div>
                              <div className="flex items-end">
                                <div className="flex items-center h-9">
                                  <input
                                    id={`verified-${question.question_id}`}
                                    name="verified"
                                    type="checkbox"
                                    defaultChecked={question.verified}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <label htmlFor={`verified-${question.question_id}`} className="ml-2 block text-xs font-medium text-gray-500">
                                    Verified
                                  </label>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button
                                type="button"
                                onClick={() => {
                                  document.getElementById(`edit-form-${question.question_id}`).classList.toggle('hidden');
                                }}
                                className="px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 border border-transparent rounded text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Save Changes
                              </button>
                            </div>
                          </form>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {!isLoading && filteredQuestions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(page > 1 ? page - 1 : 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                    page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                  disabled={page === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white ${
                    page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(startIndex + questionsPerPage, filteredQuestions.length)}
                    </span>{" "}
                    of <span className="font-medium">{filteredQuestions.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(page > 1 ? page - 1 : 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                        page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 01-1.414 1.414l-4-4a1 1 010-1.414l4-4a1 1 010 1.414l-4 4a1 1 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Calculate which page numbers to show
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      // Show ellipsis if needed
                      if (totalPages > 5) {
                        if (i === 0 && pageNum > 1) {
                          return (
                            <span key="ellipsis-start" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          );
                        }
                        if (i === 4 && pageNum < totalPages) {
                          return (
                            <span key="ellipsis-end" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                              ...
                            </span>
                          );
                        }
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pageNum
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 ${
                        page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 011.414-1.414l4 4a1 1 010 1.414l-4 4a1 1 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Delete Question
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete the question "{questionToDelete.title.length > 30 ? questionToDelete.title.substring(0, 30) + '...' : questionToDelete.title}"? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PageQuestionMod;