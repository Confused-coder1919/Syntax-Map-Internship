import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import {
  ExclamationCircleIcon,
  PencilSquareIcon,
  BookOpenIcon,
  StarIcon,
  DocumentTextIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import MistakesTracker from './notepad/MistakesTracker';
import MyExamples from './notepad/MyExamples';
import MyVocabulary from './notepad/MyVocabulary';
import Flashcards from './notepad/Flashcards';

const StudentNotepad = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    // Set active tab based on URL path
    if (location.pathname.includes('mistakes')) return 'mistakes';
    if (location.pathname.includes('examples')) return 'examples';
    if (location.pathname.includes('flashcards')) return 'flashcards';
    if (location.pathname.includes('vocabulary')) return 'vocabulary';
    return 'mistakes'; // Default tab
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  // Tab data
  const tabs = [
    { 
      id: 'mistakes', 
      name: 'My Mistakes', 
      icon: <ExclamationCircleIcon className="w-5 h-5" />,
      description: 'Track and review your quiz mistakes'
    },
    { 
      id: 'examples', 
      name: 'My Examples', 
      icon: <PencilSquareIcon className="w-5 h-5" />,
      description: 'Your custom sentence examples'
    },
    { 
      id: 'vocabulary', 
      name: 'My Vocabulary', 
      icon: <BookOpenIcon className="w-5 h-5" />,
      description: 'Words you\'ve saved while learning'
    },
    { 
      id: 'flashcards', 
      name: 'Flashcards', 
      icon: <StarIcon className="w-5 h-5" />,
      description: 'Practice vocabulary with flashcards'
    },
    { 
      id: 'notes', 
      name: 'Study Notes', 
      icon: <DocumentTextIcon className="w-5 h-5" />,
      description: 'Create and organize your personal study notes'
    }
  ];
  
  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'mistakes':
        return <MistakesTracker />;
      case 'examples':
        return <MyExamples />;
      case 'vocabulary':
        return <MyVocabulary />;
      case 'flashcards':
        return <Flashcards />;
      case 'notes':
        return <StudyNotesPlaceholder />;
      default:
        return <MistakesTracker />;
    }
  };

  // Placeholder component for Study Notes (to be implemented)
  const StudyNotesPlaceholder = () => (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Study Notes Feature Coming Soon</h3>
      <p className="text-gray-600 max-w-md mx-auto">
        This feature is currently under development. Soon you'll be able to create and organize 
        your personal study notes for each tense and grammar topic.
      </p>
      <button 
        className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center mx-auto hover:bg-gray-300"
        onClick={() => setActiveTab('vocabulary')}
      >
        <ArrowPathIcon className="h-5 w-5 mr-2" />
        Switch to My Vocabulary
      </button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <DocumentTextIcon className="w-8 h-8 mr-3 text-indigo-600" />
          My Notepad
        </h1>
        <p className="text-gray-600 mt-2">
          Keep track of your learning journey with personalized notes and study materials.
        </p>
      </motion.div>
      
      {/* Tabs */}
      <motion.div 
        className="mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Mobile Tabs (Dropdown) */}
        <div className="md:hidden mb-4">
          <label htmlFor="tab-select" className="sr-only">Select tab</label>
          <select 
            id="tab-select"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>
                {tab.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Desktop Tabs */}
        <div className="hidden md:flex space-x-1 p-1 bg-gray-100 rounded-lg">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              variants={tabVariants}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className={`mr-2 ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                {tab.icon}
              </span>
              {tab.name}
            </motion.button>
          ))}
        </div>
        
        {/* Tab descriptions */}
        <div className="hidden md:block mt-2 text-sm text-gray-600">
          {tabs.find(tab => tab.id === activeTab)?.description}
        </div>
      </motion.div>
      
      {/* Tab Content */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-h-[400px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default StudentNotepad;