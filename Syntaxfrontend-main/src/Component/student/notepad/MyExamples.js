import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MyExamples = () => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTense, setSelectedTense] = useState('all');
  
  // Modal state for add/edit example
  const [showModal, setShowModal] = useState(false);
  const [editingExample, setEditingExample] = useState(null);
  const [formData, setFormData] = useState({
    sentence: '',
    translation: '',
    tenseId: '',
    notes: ''
  });
  
  // Validation state
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    const fetchExamples = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await axios.get('/api/student/notepad/examples');
        setExamples(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching examples:', err);
        setError('Failed to load your examples. Please try again later.');
        setLoading(false);
        
        // For development - mock data
        setExamples([
          {
            id: 1,
            sentence: "I have been studying English for five years.",
            translation: "Estudio inglés desde hace cinco años.",
            tense: {
              id: 'present-perfect-continuous',
              name: 'Present Perfect Continuous'
            },
            notes: "Use for actions that started in the past and continue to the present",
            createdAt: '2025-05-04'
          },
          {
            id: 2,
            sentence: "By next month, I will have completed the project.",
            translation: "Para el próximo mes, habré completado el proyecto.",
            tense: {
              id: 'future-perfect',
              name: 'Future Perfect'
            },
            notes: "Use for actions that will be completed before a specific time in the future",
            createdAt: '2025-04-29'
          },
          {
            id: 3,
            sentence: "She was watching TV when I called.",
            translation: "Ella estaba viendo la televisión cuando llamé.",
            tense: {
              id: 'past-continuous',
              name: 'Past Continuous'
            },
            notes: "Use for actions in progress at a specific time in the past",
            createdAt: '2025-04-25'
          },
          {
            id: 4,
            sentence: "I will be traveling to Paris next summer.",
            translation: "Estaré viajando a París el próximo verano.",
            tense: {
              id: 'future-continuous',
              name: 'Future Continuous'
            },
            notes: "Use for actions that will be in progress at a specific time in the future",
            createdAt: '2025-04-20'
          },
          {
            id: 5,
            sentence: "They had already left when we arrived.",
            translation: "Ya se habían ido cuando llegamos.",
            tense: {
              id: 'past-perfect',
              name: 'Past Perfect'
            },
            notes: "Use for actions completed before another action in the past",
            createdAt: '2025-04-18'
          }
        ]);
      }
    };
    
    fetchExamples();
  }, []);
  
  // Available tenses
  const tenses = [
    { id: 'present-simple', name: 'Present Simple' },
    { id: 'present-continuous', name: 'Present Continuous' },
    { id: 'present-perfect', name: 'Present Perfect' },
    { id: 'present-perfect-continuous', name: 'Present Perfect Continuous' },
    { id: 'past-simple', name: 'Past Simple' },
    { id: 'past-continuous', name: 'Past Continuous' },
    { id: 'past-perfect', name: 'Past Perfect' },
    { id: 'past-perfect-continuous', name: 'Past Perfect Continuous' },
    { id: 'future-simple', name: 'Future Simple' },
    { id: 'future-continuous', name: 'Future Continuous' },
    { id: 'future-perfect', name: 'Future Perfect' },
    { id: 'future-perfect-continuous', name: 'Future Perfect Continuous' }
  ];
  
  // Get unique tenses from examples
  const exampleTenses = examples.reduce((acc, example) => {
    if (!acc.some(t => t.id === example.tense.id)) {
      acc.push(example.tense);
    }
    return acc;
  }, []);
  
  const allTenses = [...new Set([...tenses, ...exampleTenses])].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // Handle modal open for add/edit
  const openExampleModal = (example = null) => {
    if (example) {
      setEditingExample(example);
      setFormData({
        sentence: example.sentence,
        translation: example.translation,
        tenseId: example.tense.id,
        notes: example.notes || ''
      });
    } else {
      setEditingExample(null);
      setFormData({
        sentence: '',
        translation: '',
        tenseId: selectedTense !== 'all' ? selectedTense : '',
        notes: ''
      });
    }
    setFormErrors({});
    setShowModal(true);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error for this field if there was one
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.sentence.trim()) {
      errors.sentence = 'Example sentence is required';
    }
    if (!formData.tenseId) {
      errors.tenseId = 'Please select a tense';
    }
    return errors;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      if (editingExample) {
        // Update example (mock for now)
        // const response = await axios.put(`/api/student/notepad/examples/${editingExample.id}`, formData);
        setExamples(examples.map(ex => 
          ex.id === editingExample.id 
            ? {
                ...ex,
                sentence: formData.sentence,
                translation: formData.translation,
                tense: allTenses.find(t => t.id === formData.tenseId),
                notes: formData.notes
              } 
            : ex
        ));
      } else {
        // Add new example (mock for now)
        // const response = await axios.post('/api/student/notepad/examples', formData);
        const newExample = {
          id: Date.now(), // temporary ID for mock
          sentence: formData.sentence,
          translation: formData.translation,
          tense: allTenses.find(t => t.id === formData.tenseId),
          notes: formData.notes,
          createdAt: new Date().toISOString().split('T')[0]
        };
        setExamples([newExample, ...examples]);
      }
      
      // Close modal and reset form
      setShowModal(false);
      setEditingExample(null);
      setFormData({
        sentence: '',
        translation: '',
        tenseId: '',
        notes: ''
      });
    } catch (err) {
      console.error('Error saving example:', err);
    }
  };
  
  // Handle delete example
  const handleDeleteExample = async (id) => {
    if (window.confirm('Are you sure you want to delete this example?')) {
      try {
        // Delete example (mock for now)
        // await axios.delete(`/api/student/notepad/examples/${id}`);
        setExamples(examples.filter(ex => ex.id !== id));
      } catch (err) {
        console.error('Error deleting example:', err);
      }
    }
  };
  
  // Filter examples based on search and tense filter
  const filteredExamples = examples.filter(example => {
    const matchesSearch = searchQuery === '' || 
      example.sentence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      example.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (example.notes && example.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesTense = selectedTense === 'all' || example.tense.id === selectedTense;
    
    return matchesSearch && matchesTense;
  });
  
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <>
      <div>
        {/* Header with Add Button */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">My Example Sentences</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create and save your own examples for each tense
            </p>
          </div>
          <button
            onClick={() => openExampleModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusCircleIcon className="h-5 w-5 mr-2" />
            Add Example
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search example sentences..."
            />
          </div>
          
          {/* Tense Filter */}
          <div className="md:w-64">
            <select
              value={selectedTense}
              onChange={(e) => setSelectedTense(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Tenses</option>
              {allTenses.map(tense => (
                <option key={tense.id} value={tense.id}>{tense.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
          <span>{filteredExamples.length} {filteredExamples.length === 1 ? 'example' : 'examples'} found</span>
          {filteredExamples.length > 0 && selectedTense !== 'all' && (
            <button 
              onClick={() => openExampleModal()}
              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
            >
              <PlusCircleIcon className="h-4 w-4 mr-1" />
              Add for {allTenses.find(t => t.id === selectedTense)?.name}
            </button>
          )}
        </div>
        
        {/* Examples List */}
        {filteredExamples.length > 0 ? (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredExamples.map((example) => (
              <motion.div
                key={example.id}
                variants={itemVariants}
                className="border border-gray-200 rounded-lg bg-white overflow-hidden"
              >
                <div className="px-4 py-3 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      {example.tense.name}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">{formatDate(example.createdAt)}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openExampleModal(example)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                      title="Edit example"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExample(example.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                      title="Delete example"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-900 font-medium mb-1">{example.sentence}</p>
                  {example.translation && (
                    <p className="text-gray-600 text-sm italic mb-2">{example.translation}</p>
                  )}
                  {example.notes && (
                    <div className="mt-3 text-sm bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="text-gray-600 mt-1">{example.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <PencilSquareIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No examples found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-5">
              {searchQuery || selectedTense !== 'all'
                ? 'Try adjusting your search or filter to find what you're looking for.'
                : 'Create your first example sentence to help you remember tense usage.'}
            </p>
            <button
              onClick={() => openExampleModal()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 inline-flex items-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add Your First Example
            </button>
          </div>
        )}
      </div>
      
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingExample ? 'Edit Example Sentence' : 'Add New Example Sentence'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form className="space-y-4">
              {/* Sentence field */}
              <div>
                <label htmlFor="sentence" className="block text-sm font-medium text-gray-700 mb-1">
                  Example Sentence*
                </label>
                <textarea
                  id="sentence"
                  name="sentence"
                  rows={2}
                  value={formData.sentence}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${
                    formErrors.sentence ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  } shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                  placeholder="Enter your example sentence..."
                />
                {formErrors.sentence && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.sentence}</p>
                )}
              </div>
              
              {/* Translation field */}
              <div>
                <label htmlFor="translation" className="block text-sm font-medium text-gray-700 mb-1">
                  Translation (Optional)
                </label>
                <textarea
                  id="translation"
                  name="translation"
                  rows={2}
                  value={formData.translation}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter a translation if you want..."
                />
              </div>
              
              {/* Tense selection */}
              <div>
                <label htmlFor="tenseId" className="block text-sm font-medium text-gray-700 mb-1">
                  Tense*
                </label>
                <select
                  id="tenseId"
                  name="tenseId"
                  value={formData.tenseId}
                  onChange={handleInputChange}
                  className={`block w-full rounded-md border ${
                    formErrors.tenseId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
                  } shadow-sm py-2 px-3 focus:outline-none sm:text-sm`}
                >
                  <option value="">Select a tense</option>
                  {tenses.map(tense => (
                    <option key={tense.id} value={tense.id}>{tense.name}</option>
                  ))}
                </select>
                {formErrors.tenseId && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.tenseId}</p>
                )}
              </div>
              
              {/* Notes field */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add any additional notes about this example..."
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <CheckIcon className="h-4 w-4 mr-2" />
                  {editingExample ? 'Update Example' : 'Save Example'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default MyExamples;