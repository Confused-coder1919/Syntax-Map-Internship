import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Contexts/AuthContext';
import { VocabularyContext } from '../../Contexts/VocabularyContext';

const useVocabularyLookup = () => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useContext(AuthContext);
  const { addWordToVocabulary } = useContext(VocabularyContext);

  // Get base URL from environment or config
  const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Only add the event listener if the user is a student (role 3) or guest (role 4)
    if (user && (user.role === 3 || user.role === 4)) {
      document.addEventListener('dblclick', handleDoubleClick);
      
      return () => {
        document.removeEventListener('dblclick', handleDoubleClick);
      };
    }
  }, [user]);

  const handleDoubleClick = (event) => {
    // Don't capture double-clicks in input fields, textareas, etc.
    if (
      event.target.tagName.toLowerCase() === 'input' ||
      event.target.tagName.toLowerCase() === 'textarea' ||
      event.target.isContentEditable
    ) {
      return;
    }
    
    // Get selected text
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // Only proceed if there's actual text selected
    if (selectedText && selectedText.length > 0) {
      // Simple word extraction - get first word if multiple words are selected
      const word = selectedText.split(/\s+/)[0].toLowerCase().replace(/[^\w-]/g, '');
      
      if (word && word.length > 0) {
        setSelectedWord(word);
        setShowPopup(true);
        
        // Prevent default actions and stop propagation
        event.preventDefault();
        event.stopPropagation();
      }
    }
  };
  
  const closePopup = () => {
    setShowPopup(false);
    setSelectedWord(null);
  };
  
  const saveWord = async (wordData) => {
    try {
      if (user.role === 3) {
        // Student - save to server
        const response = await axios.post(`${baseUrl}/dictionnary`, {
          word: wordData.word,
          session_name: 'vocabulary_lookup'
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.status === 200) {
          // Call context method to update local state
          addWordToVocabulary({
            id: response.data, // The server responds with the word_id
            ...wordData
          });
          return true;
        }
      } else if (user.role === 4) {
        // Guest - save to localStorage
        const localVocabulary = JSON.parse(localStorage.getItem('guestVocabulary') || '[]');
        const newWord = {
          id: `local_${Date.now()}`,
          ...wordData
        };
        
        localVocabulary.push(newWord);
        localStorage.setItem('guestVocabulary', JSON.stringify(localVocabulary));
        
        // Update state in context
        addWordToVocabulary(newWord);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving word:', error);
      return false;
    } finally {
      closePopup();
    }
  };
  
  return {
    selectedWord,
    showPopup,
    closePopup,
    saveWord
  };
};

export default useVocabularyLookup;
