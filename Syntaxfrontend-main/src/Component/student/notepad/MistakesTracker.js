import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  ExclamationTriangleIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BookmarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const MistakesTracker = () => {
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    tense: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // View detail modal state
  const [selectedMistake, setSelectedMistake] = useState(null);
  const [showMistakeDetail, setShowMistakeDetail] = useState(false);
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  useEffect(() => {
    const fetchMistakes = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await axios.get('/api/student/notepad/mistakes');
        setMistakes(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching mistakes:', err);
        setError('Failed to load your mistakes. Please try again later.');
        setLoading(false);
        
        // For development - mock data
        setMistakes([
          {
            id: 1,
            question: "He _____ to the movies last night.",
            studentAnswer: "has gone",
            correctAnswer: "went",
            explanation: "This requires the past simple tense because it happened at a specific completed time in the past ('last night').",
            tense: {
              id: 'past-simple',
              name: 'Past Simple'
            },
            quizName: "Past Simple vs Present Perfect",
            status: 'unresolved',
            date: '2025-05-01'
          },
          {
            id: 2,
            question: "I _____ for three hours when he called.",
            studentAnswer: "was sleeping",
            correctAnswer: "had been sleeping",
            explanation: "This requires the past perfect continuous because it describes an ongoing action that started in the past and continued up until another past action (the call).",
            tense: {
              id: 'past-perfect-continuous',
              name: 'Past Perfect Continuous'
            },
            quizName: "Advanced Past Tenses",
            status: 'resolved',
            date: '2025-04-28'
          },
          {
            id: 3,
            question: "By next month, I _____ in this company for five years.",
            studentAnswer: "will work",
            correctAnswer: "will have been working",
            explanation: "This requires the future perfect continuous because it describes an ongoing action that will continue up until a specific point in the future.",
            tense: {
              id: 'future-perfect-continuous',
              name: 'Future Perfect Continuous'
            },
            quizName: "Future Tenses Quiz",
            status: 'unresolved',
            date: '2025-04-25'
          },
          {
            id: 4,
            question: "She _____ the report before the deadline.",
            studentAnswer: "has finished",
            correctAnswer: "will have finished",
            explanation: "This requires the future perfect tense because it describes an action that will be completed before a specific time in the future.",
            tense: {
              id: 'future-perfect',
              name: 'Future Perfect'
            },
            quizName: "Future Tenses Quiz",
            status: 'unresolved',
            date: '2025-04-23'
          },
          {
            id: 5,
            question: "They _____ tennis every Sunday morning.",
            studentAnswer: "are playing",
            correctAnswer: "play",
            explanation: "This requires the present simple tense because it describes a habitual action or routine.",
            tense: {
              id: 'present-simple',
              name: 'Present Simple'
            },
            quizName: "Present Tenses",
            status: 'resolved',
            date: '2025-04-20'
          }
        ]);
      }
    };
    
    fetchMistakes();
  }, []);
  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'unresolved' ? 'resolved' : 'unresolved';
    
    try {
      // Replace with actual API endpoint
      // await axios.patch(`/api/student/notepad/mistakes/${id}`, { status: newStatus });
      
      setMistakes(mistakes.map(mistake => 
        mistake.id === id ? { ...mistake, status: newStatus } : mistake
      ));
      
      // Update selected mistake if it's currently being viewed
      if (selectedMistake && selectedMistake.id === id) {
        setSelectedMistake({
          ...selectedMistake,
          status: newStatus
        });
      }
    } catch (err) {
      console.error('Error updating mistake status:', err);
    }
  };
  
  const handleDeleteMistake = async (id) => {
    try {
      // Replace with actual API endpoint
      // await axios.delete(`/api/student/notepad/mistakes/${id}`);
      
      setMistakes(mistakes.filter(mistake => mistake.id !== id));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      
      // If the deleted mistake was being viewed in detail, close the detail view
      if (selectedMistake && selectedMistake.id === id) {
        setShowMistakeDetail(false);
        setSelectedMistake(null);
      }
    } catch (err) {
      console.error('Error deleting mistake:', err);
    }
  };
  
  const openMistakeDetail = (mistake) => {
    setSelectedMistake(mistake);
    setShowMistakeDetail(true);
  };
  
  // Filter and search functionality
  const filteredMistakes = mistakes.filter(mistake => {
    // Apply search query
    const matchesSearch = searchQuery === '' || 
      mistake.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mistake.studentAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mistake.correctAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mistake.quizName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mistake.tense.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    // Apply filters
    const matchesTense = filters.tense === 'all' || mistake.tense.id === filters.tense;
    const matchesStatus = filters.status === 'all' || mistake.status === filters.status;
    
    return matchesSearch && matchesTense && matchesStatus;
  });
  
  // Get unique tenses from mistakes for filter dropdown
  const uniqueTenses = ['all', ...new Set(mistakes.map(mistake => mistake.tense.id))];
  const tenseNames = mistakes.reduce((acc, mistake) => {
    if (!acc[mistake.tense.id]) {
      acc[mistake.tense.id] = mistake.tense.name;
    }
    return acc;
  }, { all: 'All Tenses' });
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: '2-digit'
    });
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">My Mistakes Tracker</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review and learn from your previous quiz mistakes
          </p>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              placeholder="Search mistakes by question or answer..."
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-md border ${
              showFilters ? 'bg-red-50 border-red-200 text-red-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {(filters.tense !== 'all' || filters.status !== 'all') && (
              <span className="ml-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(filters.tense !== 'all' ? 1 : 0) + 
                 (filters.status !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>
        
        {/* Filter Options */}
        {showFilters && (
          <motion.div 
            className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            {/* Tense Filter */}
            <div>
              <label htmlFor="tenseFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Tense
              </label>
              <select
                id="tenseFilter"
                value={filters.tense}
                onChange={(e) => setFilters({ ...filters, tense: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                {uniqueTenses.map(tense => (
                  <option key={tense} value={tense}>{tenseNames[tense]}</option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="unresolved">Still Learning</option>
                <option value="resolved">Mastered</option>
              </select>
            </div>
            
            {/* Reset Filters Button */}
            {(filters.tense !== 'all' || filters.status !== 'all') && (
              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={() => setFilters({ tense: 'all', status: 'all' })}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
      
      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        {filteredMistakes.length} {filteredMistakes.length === 1 ? 'mistake' : 'mistakes'} found
      </div>
      
      {/* Mistakes List */}
      {filteredMistakes.length > 0 ? (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredMistakes.map((mistake) => (
            <motion.div
              key={mistake.id}
              variants={itemVariants}
              className={`border rounded-lg overflow-hidden bg-white ${
                mistake.status === 'resolved' ? 'border-green-200' : 'border-red-200'
              }`}
              onClick={() => openMistakeDetail(mistake)}
            >
              <div className={`px-4 py-3 flex justify-between items-center ${
                mistake.status === 'resolved' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    mistake.status === 'resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {mistake.status === 'resolved' ? 'Mastered' : 'Still Learning'}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">{mistake.tense.name}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{formatDate(mistake.date)}</span>
                  <span className="mx-2">•</span>
                  <span className="truncate max-w-[120px]">{mistake.quizName}</span>
                </div>
              </div>
              
              <div className="p-4 cursor-pointer">
                <h4 className="font-medium text-gray-800 mb-3">
                  {mistake.question}
                </h4>
                
                <div className="space-y-2">
                  <div className="flex">
                    <span className="text-sm font-medium text-red-600 w-24">Your answer:</span>
                    <span className="text-sm text-gray-800">{mistake.studentAnswer}</span>
                  </div>
                  
                  <div className="flex">
                    <span className="text-sm font-medium text-green-600 w-24">Correct:</span>
                    <span className="text-sm text-gray-800">{mistake.correctAnswer}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(mistake.id, mistake.status);
                    }}
                    className={`p-1.5 rounded-md text-sm flex items-center ${
                      mistake.status === 'resolved'
                        ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                        : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={mistake.status === 'resolved' ? 'Mark as still learning' : 'Mark as mastered'}
                  >
                    {mistake.status === 'resolved' ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-1" />
                        <span>Still Learning</span>
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span>Mark Mastered</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(mistake.id);
                      setShowDeleteConfirm(true);
                    }}
                    className="p-1.5 rounded-md text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center"
                    title="Delete mistake"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No mistakes found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-5">
            {searchQuery || filters.tense !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your search or filters to find what you're looking for.'
              : 'Great job! You haven\'t made any mistakes in your quizzes yet, or they\'ve all been cleared.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 inline-flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>
      )}
      
      {/* Mistake Detail Modal */}
      {showMistakeDetail && selectedMistake && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900">
                  Review Mistake
                </h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedMistake.status === 'resolved' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedMistake.status === 'resolved' ? 'Mastered' : 'Still Learning'}
                  </span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{selectedMistake.tense.name}</span>
                </div>
              </div>
              <button
                onClick={() => setShowMistakeDetail(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                {selectedMistake.question}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border-l-4 border-red-400">
                  <div className="text-sm font-medium text-red-600 mb-1">Your answer:</div>
                  <div className="text-gray-900">{selectedMistake.studentAnswer}</div>
                </div>
                
                <div className="bg-white p-3 rounded border-l-4 border-green-400">
                  <div className="text-sm font-medium text-green-600 mb-1">Correct answer:</div>
                  <div className="text-gray-900">{selectedMistake.correctAnswer}</div>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Explanation:</h4>
              <p className="text-gray-800 bg-yellow-50 p-4 rounded-md border-l-4 border-yellow-300">
                {selectedMistake.explanation}
              </p>
            </div>
            
            <div className="text-xs text-gray-600 flex justify-between mt-2 mb-6">
              <div>
                <span className="font-medium">Date:</span> {formatDate(selectedMistake.date)}
              </div>
              <div>
                <span className="font-medium">Quiz:</span> {selectedMistake.quizName}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleToggleStatus(selectedMistake.id, selectedMistake.status)}
                className={`px-3 py-2 rounded-md flex items-center ${
                  selectedMistake.status === 'resolved'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {selectedMistake.status === 'resolved' ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                    Mark as Still Learning
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                    Mark as Mastered
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setDeleteId(selectedMistake.id);
                  setShowDeleteConfirm(true);
                  setShowMistakeDetail(false);
                }}
                className="px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-1.5" />
                Remove Mistake
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Removal</h3>
            <p className="text-gray-500 mb-5">
              Are you sure you want to remove this mistake from your tracker? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMistake(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MistakesTracker;