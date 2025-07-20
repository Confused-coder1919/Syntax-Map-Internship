import React, { useState, useEffect, useContext } from 'react';
import { 
  ArrowLeftIcon, ArrowRightIcon, ArrowPathIcon, 
  SpeakerWaveIcon, CheckIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { VocabularyContext } from '../../Contexts/VocabularyContext';
import toast from 'react-hot-toast';

const Flashcards = () => {
  const [flashcardWords, setFlashcardWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [studyResults, setStudyResults] = useState({
    total: 0,
    learned: 0,
    needsReview: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn] = useState(Boolean(localStorage.getItem('jstoken')));
  
  const { toggleWordLearned, savedWords } = useContext(VocabularyContext);
  
  // Load flashcards from localStorage or use all saved vocabulary if none selected
  useEffect(() => {
    const loadFlashcards = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First try to get specifically created flashcards
        const flashcardWordsJson = localStorage.getItem('flashcard_words');
        
        if (flashcardWordsJson) {
          // User has explicitly created flashcards
          const selectedWords = JSON.parse(flashcardWordsJson);
          
          if (selectedWords && selectedWords.length > 0) {
            // Shuffle the words
            const shuffled = [...selectedWords].sort(() => Math.random() - 0.5);
            setFlashcardWords(shuffled);
            return;
          }
        }
        
        // If no specific flashcards, use all saved words
        if (savedWords && savedWords.length > 0) {
          // Filter out words marked as learned
          const unlearned = savedWords.filter(word => !word.learned);
          
          if (unlearned.length > 0) {
            // Shuffle the words
            const shuffled = [...unlearned].sort(() => Math.random() - 0.5);
            setFlashcardWords(shuffled);
          } else {
            setFlashcardWords(savedWords.sort(() => Math.random() - 0.5));
          }
        } else {
          // No words found
          setFlashcardWords([]);
        }
      } catch (err) {
        console.error("Error loading flashcards:", err);
        setError("Failed to load vocabulary. Please try again later.");
        setFlashcardWords([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadFlashcards();
    
    // Clean up flashcards from localStorage after loading
    return () => {
      // Remove the temporary flashcard selection when component unmounts
      localStorage.removeItem('flashcard_words');
    };
  }, [savedWords]);
  
  const handleNext = () => {
    if (currentIndex < flashcardWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // End of flashcards
      calculateResults();
      setShowResults(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handlePlayAudio = (pronunciation) => {
    if (!pronunciation) return;
    
    const audio = new Audio(pronunciation);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      toast.error('Could not play pronunciation');
    });
  };
  
  const handleMarkLearned = async () => {
    const word = flashcardWords[currentIndex];
    console.log("Marking word as learned:", word);
    
    try {
      // Use our context method to toggle learned status
      const wordId = word.word_id || word.id || word.word;
      const success = await toggleWordLearned(wordId);
      
      if (success) {
        // Update the local state
        const updatedWords = flashcardWords.map((w, idx) => 
          idx === currentIndex ? { ...w, learned: true } : w
        );
        setFlashcardWords(updatedWords);
        
        toast.success('Word marked as learned!');
      } else {
        toast.error('Failed to mark word as learned');
      }
    } catch (err) {
      console.error("Error marking word as learned:", err);
      toast.error('Failed to mark word as learned');
    }
  };
  
  const calculateResults = () => {
    const total = flashcardWords.length;
    const learned = flashcardWords.filter(word => word.learned).length;
    
    setStudyResults({
      total,
      learned,
      needsReview: total - learned
    });
  };
  
  const handleRestartSession = () => {
    setShowResults(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    
    // Reshuffle the cards
    const shuffled = [...flashcardWords].sort(() => Math.random() - 0.5);
    setFlashcardWords(shuffled);
  };
  
  // If there's an error
  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If there are no flashcards
  if (flashcardWords.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <svg className="h-16 w-16 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No flashcards available</h3>
        <p className="text-gray-500 mb-4">
          You don't have any words to review yet. Add words to your vocabulary by double-clicking on words throughout the platform.
        </p>
        <a 
          href="/tensemap" 
          className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700"
        >
          Explore Tense Map
        </a>
      </div>
    );
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // Show results screen
  if (showResults) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="p-6 bg-white rounded-lg shadow-md"
      >
        <h3 className="text-xl font-bold text-center mb-6">Study Session Complete!</h3>
        
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span>Total Words:</span>
            <span className="font-medium">{studyResults.total}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Words Learned:</span>
            <span className="font-medium text-green-600">{studyResults.learned}</span>
          </div>
          <div className="flex justify-between">
            <span>Need Review:</span>
            <span className="font-medium text-orange-600">{studyResults.needsReview}</span>
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-md border border-orange-100 mb-6">
          <p className="text-sm text-orange-700">
            Words you've marked as "learned" will be filtered out of future study sessions unless you specifically include them.
          </p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={handleRestartSession}
            className="inline-flex items-center px-4 py-2 rounded-md bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Restart Session
          </button>
        </div>
      </motion.div>
    );
  }
    // Get the current flashcard
  const currentFlashcard = flashcardWords[currentIndex] || { word: '', definition: '', meaning: '' };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Flashcards</h3>
        <div className="text-sm text-gray-600">
          Card {currentIndex + 1} of {flashcardWords.length}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div 
          className="bg-orange-500 h-2 rounded-full"
          style={{ width: `${((currentIndex + 1) / flashcardWords.length) * 100}%` }}
        ></div>
      </div>
      
      {/* Flashcard */}
      <div 
        className="relative w-full h-64 mb-6 cursor-pointer"
        onClick={handleFlip}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div 
            key={isFlipped ? 'back' : 'front'}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full bg-white rounded-lg shadow-md flex flex-col items-center justify-center p-6 border border-gray-200"
            style={{ backfaceVisibility: "hidden" }}
          >
            {isFlipped ? (
              // Back of card (definition)
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-500 mb-2">DEFINITION</h4>
                <p className="text-lg">{currentFlashcard.definition || currentFlashcard.meaning}</p>
                
                {(currentFlashcard.part_of_speech || currentFlashcard.wordType) && (
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {currentFlashcard.part_of_speech || currentFlashcard.wordType}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Front of card (word)
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-500 mb-2">WORD</h4>
                <div className="flex items-center justify-center">
                  <h3 className="text-2xl font-bold">{currentFlashcard.word}</h3>
                  {(currentFlashcard.pronunciation || currentFlashcard.audio) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayAudio(currentFlashcard.pronunciation || currentFlashcard.audio);
                      }}
                      className="ml-2 p-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <SpeakerWaveIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-600">Tap to see definition</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Controls */}
      <div className="flex justify-between">
        <div>
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`inline-flex items-center px-3 py-1 rounded-md mr-2 
              ${currentIndex === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Previous
          </button>
          
          <button
            onClick={handleNext}
            className="inline-flex items-center px-3 py-1 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Next
            <ArrowRightIcon className="h-4 w-4 ml-1" />
          </button>
        </div>
        
        <button
          onClick={handleMarkLearned}
          className={`inline-flex items-center px-3 py-1 rounded-md ${
            currentFlashcard.learned 
              ? 'bg-green-100 text-green-700'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          {currentFlashcard.learned ? (
            <>
              <CheckIcon className="h-4 w-4 mr-1" />
              Learned
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 mr-1" />
              Mark as Learned
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Flashcards;