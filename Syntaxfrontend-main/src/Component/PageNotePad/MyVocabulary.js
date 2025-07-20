import React, { useState, useEffect, useContext } from 'react';
import { 
  BookmarkIcon, CheckIcon, XMarkIcon as XIcon, TrashIcon, 
  SpeakerWaveIcon, PlusCircleIcon, AcademicCapIcon
} from '@heroicons/react/24/outline';
import { VocabularyContext } from '../../Contexts/VocabularyContext';
import swal from 'sweetalert';

const MyVocabulary = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWords, setSelectedWords] = useState([]);
  const [showFlashcardModal, setShowFlashcardModal] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'learned', 'unlearned'
  
  const {
    savedWords,
    fetchSavedWords,
    toggleWordLearned,
    createFlashcards,
    deleteWord,
    isLoading
  } = useContext(VocabularyContext);

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    try {
      setLoading(true);
      await fetchSavedWords();
    } catch (err) {
      console.error("Error loading vocabulary:", err);
      setError("Failed to load your vocabulary. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = (pronunciation) => {
    if (!pronunciation) return;
    
    const audio = new Audio(pronunciation);
    audio.play().catch(error => {
      console.error("Error playing audio:", error);
    });
  };

  const handleToggleLearned = async (wordId) => {
    const success = await toggleWordLearned(wordId);
    if (success) {
      swal("Success", "Word status updated", "success");
    } else {
      swal("Error", "Failed to update word status", "error");
    }
  };

  const handleDeleteWord = async (wordId) => {
    console.log("Deleting word:", wordId);
    swal({
      title: "Are you sure?",
      text: "This word will be removed from your vocabulary.",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then(async (willDelete) => {
      if (willDelete) {
        const success = await deleteWord(wordId);
        if (success) {
          // Remove from selected words if it was selected
          setSelectedWords(prev => prev.filter(word => 
            word.id !== wordId && word.word !== wordId
          ));
          swal("Success", "Word deleted successfully", "success");
        } else {
          swal("Error", "Failed to delete word", "error");
        }
      }
    });
  };

  const handleCreateFlashcards = () => {
    if (selectedWords.length === 0) {
      swal("Warning", "Please select at least one word for flashcards", "warning");
      return;
    }
    
    createFlashcards(selectedWords);
    setShowFlashcardModal(true);
  };

  const toggleWordSelection = (word) => {
    setSelectedWords(prev => {
      if (prev.some(w => w.word_id == word.word_id || w.word == word.word)) {
        return prev.filter(w => w.word_id != word.word_id && w.word != word.word);
      } else {
        return [...prev, word];
      }
    });
  };

  const isWordSelected = (word) => {
    return selectedWords.some(w => w.id === word.id || w.word === word.word);
  };

  const handleSelectAll = () => {
    if (selectedWords.length === filteredWords.length) {
      // If all are selected, deselect all
      setSelectedWords([]);
    } else {
      // Otherwise, select all visible words
      setSelectedWords(filteredWords);
    }
  };

  // Handle redirect to flashcards page
  const redirectToFlashcards = () => {
    setShowFlashcardModal(false);
    window.location.href = "/flashcards";
  };
  
  // Filter words based on current filter setting
  const filteredWords = savedWords.filter(word => {
    if (filter === 'learned') return word.learned === true;
    if (filter === 'unlearned') return !word.learned;
    return true; // 'all' filter
  });

  if (loading || isLoading) {
    return (
      <div className="py-8 px-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">My Vocabulary</h3>
        <div className="flex space-x-2 items-center">
          <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {savedWords.length} {savedWords.length === 1 ? 'Word' : 'Words'}
          </span>
          {savedWords.length > 0 && (
            <button
              onClick={handleCreateFlashcards}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
              title="Create flashcards"
            >
              <AcademicCapIcon className="h-3 w-3 mr-1" />
              Create Flashcards
            </button>
          )}
        </div>
      </div>

      {/* Filter and action bar */}
      {savedWords.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                filter === 'all' 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('learned')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                filter === 'learned' 
                  ? 'bg-green-200 text-green-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Learned
            </button>
            <button
              onClick={() => setFilter('unlearned')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                filter === 'unlearned' 
                  ? 'bg-orange-200 text-orange-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              To Learn
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedWords.length > 0 && selectedWords.length === filteredWords.length}
                onChange={handleSelectAll}
                className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 rounded"
              />
              <span className="text-xs text-gray-500">Select All</span>
            </div>
            
            {selectedWords.length > 0 && (
              <span className="text-xs text-gray-500">
                {selectedWords.length} selected
              </span>
            )}
          </div>
        </div>
      )}      {savedWords.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <BookmarkIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium mb-2">Your vocabulary list is empty</h3>
          <p className="text-gray-500 mb-4">
            You haven't saved any vocabulary words yet. Double-click on any word in the platform to look it up and add it to your vocabulary.
          </p>
          <div className="p-3 bg-blue-50 rounded-lg max-w-md mx-auto">
            <h4 className="font-medium text-blue-700 text-sm mb-1">Pro Tip</h4>
            <p className="text-xs text-blue-600">
              You can double-click any word throughout SyntaxMap to look up its definition and add it to your vocabulary list.
            </p>
          </div>
        </div>
      ) : filteredWords.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500">
            No {filter === 'learned' ? 'learned' : 'unlearned'} words found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredWords.map((word, index) => (
            <div 
              key={word.id || index}
              className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                word.learned ? 'border-green-200' : 'border-gray-200'
              }`}
            >              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 flex items-center">
                      {word.word}
                    </h4>
                    <div className="flex items-center mt-1 space-x-2">
                      {/* {word.part_of_speech && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {word.part_of_speech}
                        </span>
                      )} */}
                      {word.date && (
                        <span className="text-xs text-gray-400">
                          {new Date(word.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {word.pronunciation && (
                      <button 
                        onClick={() => handlePlayAudio(word.pronunciation)}
                        className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        title="Listen to pronunciation"
                      >
                        <SpeakerWaveIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleToggleLearned(word.word_id || word.word)}
                      className={`p-1 rounded-full ${
                        word.learned
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={word.learned ? "Mark as not learned" : "Mark as learned"}
                    >
                      {word.learned ? <CheckIcon className="h-4 w-4" /> : <BookmarkIcon className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteWord(word.word_id || word.word)}
                      className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                      title="Delete word"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {word.part_of_speech && (
                  <div className="mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {word.part_of_speech}
                    </span>
                  </div>
                )}
                
                <p className="text-sm text-gray-600 mt-1">
                  {word.definition || "No definition available"}
                </p>
                
                <div className="mt-3 text-xs text-gray-500 flex justify-between items-center">
                  <span>{new Date(word.date || Date.now()).toLocaleDateString()}</span>
                  {word.learned && (
                    <span className="flex items-center text-green-600">
                      <CheckIcon className="h-3 w-3 mr-1" />
                      Learned
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flashcard creation success modal */}
      {showFlashcardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">Flashcards Created!</h3>
                {/* <button 
                  onClick={() => setShowFlashcardModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XIcon className="h-5 w-5" />
                </button> */}
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">
                  Your flashcards have been created successfully. You can access them in the Flashcards section.
                </p>
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setShowFlashcardModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Close
                </button>
                <button
                  onClick={redirectToFlashcards}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Go to Flashcards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyVocabulary;