import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BookmarkIcon,
  SpeakerWaveIcon,
  TrashIcon,
  PlusCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  TagIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const MyVocabulary = () => {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // New word form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState({
    word: '',
    definition: '',
    translation: '',
    example: '',
    category: 'noun',
    status: 'learning'
  });
  
  // Word detail modal state
  const [selectedWord, setSelectedWord] = useState(null);
  const [showWordDetail, setShowWordDetail] = useState(false);
  
  // Confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  
  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await axios.get('/api/student/notepad/vocabulary');
        setVocabulary(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vocabulary:', err);
        setError('Failed to load your vocabulary. Please try again later.');
        setLoading(false);
        
        // For development - mock data
        setVocabulary([
          {
            id: 1,
            word: 'ambiguous',
            pronunciation: 'amˈbɪɡjuəs',
            definition: 'Open to more than one interpretation; having a double meaning.',
            translation: 'ambigu',
            example: 'The teacher's instructions were ambiguous, so many students were confused.',
            category: 'adjective',
            status: 'learning',
            dateAdded: '2025-05-01',
            lastReviewed: '2025-05-04',
            source: 'Grammar lesson on modifiers'
          },
          {
            id: 2,
            word: 'enumerate',
            pronunciation: 'ɪˈnjuːməreɪt',
            definition: 'Mention (a number of things) one by one.',
            translation: 'énumérer',
            example: 'She enumerated the many obstacles that they had encountered.',
            category: 'verb',
            status: 'mastered',
            dateAdded: '2025-04-28',
            lastReviewed: '2025-05-02',
            source: 'Reading about list comprehensions'
          },
          {
            id: 3,
            word: 'pragmatic',
            pronunciation: 'præɡˈmætɪk',
            definition: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
            translation: 'pragmatique',
            example: 'We need a pragmatic approach to solving this problem.',
            category: 'adjective',
            status: 'learning',
            dateAdded: '2025-04-25',
            lastReviewed: '2025-05-03',
            source: 'Present Perfect Continuous lesson'
          },
          {
            id: 4,
            word: 'meticulous',
            pronunciation: 'məˈtɪkjʊləs',
            definition: 'Showing great attention to detail; very careful and precise.',
            translation: 'méticuleux',
            example: 'She is meticulous about keeping her financial records.',
            category: 'adjective',
            status: 'learning',
            dateAdded: '2025-04-20',
            lastReviewed: '2025-04-30',
            source: 'Double-clicked during lesson'
          },
          {
            id: 5,
            word: 'articulate',
            pronunciation: 'ɑːˈtɪkjʊlət',
            definition: 'Having or showing the ability to speak fluently and coherently.',
            translation: 'articulé',
            example: 'He is an articulate speaker who can explain complex issues clearly.',
            category: 'adjective',
            status: 'mastered',
            dateAdded: '2025-04-15',
            lastReviewed: '2025-05-01',
            source: 'Speaking practice'
          }
        ]);
      }
    };
    
    fetchVocabulary();
  }, []);
  
  const handleAddWord = async (e) => {
    e.preventDefault();
    
    if (!newWord.word || !newWord.definition) {
      return; // Basic validation
    }
    
    try {
      // Replace with actual API endpoint
      // const response = await axios.post('/api/student/notepad/vocabulary', newWord);
      // const createdWord = response.data;
      
      // Mock API response for development
      const createdWord = {
        id: Date.now(),
        word: newWord.word,
        pronunciation: '',
        definition: newWord.definition,
        translation: newWord.translation,
        example: newWord.example,
        category: newWord.category,
        status: newWord.status,
        dateAdded: new Date().toISOString().split('T')[0],
        lastReviewed: new Date().toISOString().split('T')[0],
        source: 'Manually added'
      };
      
      setVocabulary([createdWord, ...vocabulary]);
      setNewWord({
        word: '',
        definition: '',
        translation: '',
        example: '',
        category: 'noun',
        status: 'learning'
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding vocabulary word:', err);
    }
  };
  
  const handleDeleteWord = async (id) => {
    try {
      // Replace with actual API endpoint
      // await axios.delete(`/api/student/notepad/vocabulary/${id}`);
      
      setVocabulary(vocabulary.filter(word => word.id !== id));
      setShowDeleteConfirm(false);
      setDeleteId(null);
      
      // If the deleted word was being viewed in detail, close the detail view
      if (selectedWord && selectedWord.id === id) {
        setShowWordDetail(false);
        setSelectedWord(null);
      }
    } catch (err) {
      console.error('Error deleting vocabulary word:', err);
    }
  };
  
  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'learning' ? 'mastered' : 'learning';
    
    try {
      // Replace with actual API endpoint
      // await axios.patch(`/api/student/notepad/vocabulary/${id}`, { status: newStatus });
      
      setVocabulary(vocabulary.map(word => 
        word.id === id ? { ...word, status: newStatus, lastReviewed: new Date().toISOString().split('T')[0] } : word
      ));
      
      // Update selected word if it's currently being viewed
      if (selectedWord && selectedWord.id === id) {
        setSelectedWord({
          ...selectedWord,
          status: newStatus,
          lastReviewed: new Date().toISOString().split('T')[0]
        });
      }
    } catch (err) {
      console.error('Error updating vocabulary status:', err);
    }
  };
  
  const handlePlayPronunciation = (word) => {
    // In a real implementation, this would use the Web Speech API or another text-to-speech service
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };
  
  const openWordDetail = (word) => {
    setSelectedWord(word);
    setShowWordDetail(true);
  };
  
  // Filter and search functionality
  const filteredVocabulary = vocabulary.filter(wordItem => {
    // Apply search query
    const matchesSearch = searchQuery === '' || 
      wordItem.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wordItem.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (wordItem.translation && wordItem.translation.toLowerCase().includes(searchQuery.toLowerCase()));
      
    // Apply filters
    const matchesCategory = filters.category === 'all' || wordItem.category === filters.category;
    const matchesStatus = filters.status === 'all' || wordItem.status === filters.status;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Word categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'noun', name: 'Nouns' },
    { id: 'verb', name: 'Verbs' },
    { id: 'adjective', name: 'Adjectives' },
    { id: 'adverb', name: 'Adverbs' },
    { id: 'preposition', name: 'Prepositions' },
    { id: 'conjunction', name: 'Conjunctions' },
    { id: 'other', name: 'Other' }
  ];
  
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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div>
      {/* Header & Add Word Button */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">My Vocabulary</h2>
          <p className="text-sm text-gray-600 mt-1">
            Words you've saved while learning. Double-click any word in lessons to add it.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2 rounded-md flex items-center ${
            showAddForm 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {showAddForm ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircleIcon className="h-5 w-5 mr-1.5" />
              Add New Word
            </>
          )}
        </button>
      </div>
      
      {/* Add Word Form */}
      {showAddForm && (
        <motion.div 
          className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <form onSubmit={handleAddWord}>
            <h3 className="font-medium text-gray-800 mb-4">Add New Word</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="wordInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Word *
                </label>
                <input
                  type="text"
                  id="wordInput"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter word"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="translationInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Translation (optional)
                </label>
                <input
                  type="text"
                  id="translationInput"
                  value={newWord.translation}
                  onChange={(e) => setNewWord({ ...newWord, translation: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Translation in your language"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="definitionInput" className="block text-sm font-medium text-gray-700 mb-1">
                Definition *
              </label>
              <textarea
                id="definitionInput"
                value={newWord.definition}
                onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows="2"
                placeholder="Enter definition"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="exampleInput" className="block text-sm font-medium text-gray-700 mb-1">
                Example (optional)
              </label>
              <textarea
                id="exampleInput"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                rows="2"
                placeholder="Enter an example sentence"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="categorySelect"
                  value={newWord.category}
                  onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {categories.filter(cat => cat.id !== 'all').map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="statusSelect" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="statusSelect"
                  value={newWord.status}
                  onChange={(e) => setNewWord({ ...newWord, status: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="learning">Still Learning</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1.5" />
                Add Word
              </button>
            </div>
          </form>
        </motion.div>
      )}
      
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search vocabulary..."
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 rounded-md border ${
              showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700'
            }`}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {(filters.category !== 'all' || filters.status !== 'all') && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {(filters.category !== 'all' ? 1 : 0) + 
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
            {/* Category Filter */}
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                Word Type
              </label>
              <select
                id="categoryFilter"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="learning">Still Learning</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
            
            {/* Reset Filters Button */}
            {(filters.category !== 'all' || filters.status !== 'all') && (
              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={() => setFilters({ category: 'all', status: 'all' })}
                  className="text-sm text-blue-600 hover:text-blue-800"
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
        {filteredVocabulary.length} {filteredVocabulary.length === 1 ? 'word' : 'words'} found
      </div>
      
      {/* Vocabulary List */}
      {filteredVocabulary.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredVocabulary.map((wordItem) => (
            <motion.div
              key={wordItem.id}
              variants={itemVariants}
              className={`border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200 ${
                wordItem.status === 'mastered' ? 'border-green-200' : 'border-blue-200'
              }`}
              onClick={() => openWordDetail(wordItem)}
              whileHover={{ y: -2 }}
            >
              <div className={`px-4 py-3 ${wordItem.status === 'mastered' ? 'bg-green-50' : 'bg-blue-50'}`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{wordItem.word}</div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPronunciation(wordItem.word);
                      }}
                      className="text-gray-600 hover:text-blue-600 p-1"
                      title="Hear pronunciation"
                    >
                      <SpeakerWaveIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(wordItem.id, wordItem.status);
                      }}
                      className={`p-1 ${
                        wordItem.status === 'mastered' 
                          ? 'text-green-600 hover:text-gray-600' 
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                      title={wordItem.status === 'mastered' ? 'Mark as still learning' : 'Mark as mastered'}
                    >
                      <BookmarkIcon className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(wordItem.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="text-gray-600 hover:text-red-600 p-1"
                      title="Delete word"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <TagIcon className="h-3 w-3 mr-1" />
                  <span className="capitalize">{wordItem.category}</span>
                  <span className="mx-2">•</span>
                  <span>Added {formatDate(wordItem.dateAdded)}</span>
                </div>
              </div>
              
              <div className="p-3">
                <p className="text-sm text-gray-800 line-clamp-2">{wordItem.definition}</p>
                
                {wordItem.translation && (
                  <p className="text-xs text-gray-600 mt-2 italic flex items-center">
                    <GlobeAltIcon className="h-3 w-3 mr-1" />
                    {wordItem.translation}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No vocabulary found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-5">
            {searchQuery || filters.category !== 'all' || filters.status !== 'all'
              ? 'Try adjusting your search or filters to find what you're looking for.'
              : 'You haven\'t added any vocabulary words yet. Double-click words while learning or add them manually.'}
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add Your First Word
            </button>
          )}
        </div>
      )}
      
      {/* Word Detail Modal */}
      {showWordDetail && selectedWord && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-medium text-gray-900 flex items-center">
                  {selectedWord.word}
                  <button
                    onClick={() => handlePlayPronunciation(selectedWord.word)}
                    className="ml-2 text-gray-600 hover:text-blue-600"
                    title="Hear pronunciation"
                  >
                    <SpeakerWaveIcon className="h-5 w-5" />
                  </button>
                  {selectedWord.pronunciation && (
                    <span className="ml-2 text-gray-500 text-sm">/{selectedWord.pronunciation}/</span>
                  )}
                </h3>
                <div className="flex items-center mt-1 text-sm">
                  <span className="text-gray-600 capitalize">{selectedWord.category}</span>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className={`${
                    selectedWord.status === 'mastered' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {selectedWord.status === 'mastered' ? 'Mastered' : 'Learning'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowWordDetail(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Definition:</h4>
              <p className="text-gray-900">{selectedWord.definition}</p>
              
              {selectedWord.translation && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Translation:</h4>
                  <p className="text-gray-900 italic">{selectedWord.translation}</p>
                </div>
              )}
            </div>
            
            {selectedWord.example && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Example:</h4>
                <p className="text-gray-900 bg-yellow-50 p-3 rounded-md border-l-4 border-yellow-300">
                  "{selectedWord.example}"
                </p>
              </div>
            )}
            
            <div className="text-xs text-gray-600 flex flex-wrap justify-between mt-4">
              <div>
                <span className="mr-1">Added:</span>
                <span className="font-medium">{formatDate(selectedWord.dateAdded)}</span>
              </div>
              <div>
                <span className="mr-1">Last reviewed:</span>
                <span className="font-medium">{formatDate(selectedWord.lastReviewed)}</span>
              </div>
              <div>
                <span className="mr-1">Source:</span>
                <span className="font-medium">{selectedWord.source}</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleToggleStatus(selectedWord.id, selectedWord.status)}
                className={`px-3 py-1.5 rounded-md flex items-center ${
                  selectedWord.status === 'mastered'
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <BookmarkIcon className="h-4 w-4 mr-1.5" />
                {selectedWord.status === 'mastered' ? 'Mark as Learning' : 'Mark as Mastered'}
              </button>
              
              <button
                onClick={() => {
                  setDeleteId(selectedWord.id);
                  setShowDeleteConfirm(true);
                  setShowWordDetail(false);
                }}
                className="px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center"
              >
                <TrashIcon className="h-4 w-4 mr-1.5" />
                Delete Word
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
            <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Deletion</h3>
            <p className="text-gray-500 mb-5">
              Are you sure you want to delete this vocabulary word? This action cannot be undone.
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
                onClick={() => handleDeleteWord(deleteId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyVocabulary;