import React, { createContext, Component } from 'react';
import { DictionaryContext } from './DictionaryContext';
import { AuthContext } from './AuthContext';
import axios from 'axios';
import config, { getBackendUrl } from '../config';

export const VocabularyContext = createContext();

class VocabularyContextProvider extends Component {
  static contextType = AuthContext;

  state = {
    myVocabulary: [],
    loading: false,
    error: null,
    showAddToNotepadModal: false,
    currentWord: null,
    savedWords: [],
    isLoading: false
  };

  componentDidMount() {
    this.fetchSavedWords();
  }

  // Fetch the user's saved words from the server
  fetchSavedWords = async () => {
    const isLoggedIn = Boolean(localStorage.getItem('jstoken')) && localStorage.getItem("user_role") == 3;
    if (!isLoggedIn && localStorage.getItem("user_role") == 4) {
      this.loadLocalSavedWords();
      return;
    }

    try {
      this.setState({ isLoading: true });

      // Get backend URL with fallback mechanism
      const backendUrl = await getBackendUrl();

      try {
        const response = await fetch(`${backendUrl}/dictionnary/user/`, {
          headers: { "Authorization": localStorage.getItem('jstoken') }
        });

        if (!response.ok) {
          throw new Error(`Dictionary API responded with status: ${response.status}`);
        }

        const data = await response.json();
        if (data && data.dictionnary) {
          this.setState({
            savedWords: data.dictionnary,
            isLoading: false
          });
        } else {
          this.setState({
            savedWords: [],
            isLoading: false
          });
        }
      } catch (error) {
        // Only try production as fallback if not already using it
        if (backendUrl !== config.prodBackendUrl && !config.usingFallbackBackend) {
          try {
            const response = await fetch(`${config.prodBackendUrl}/dictionnary/user`, {
              headers: { "Authorization": localStorage.getItem('jstoken') }
            });

            if (!response.ok) {
              throw new Error(`Dictionary API responded with status: ${response.status}`);
            }

            const data = await response.json();
            if (data && data.dictionnary) {
              // Update config for future requests
              config.backendUrl = config.prodBackendUrl;
              config.usingFallbackBackend = true;

              this.setState({
                savedWords: data.dictionnary,
                isLoading: false
              });
              return;
            }
          } catch (prodError) {
            // Continue to the general error handler below
          }
        }

        console.error("Failed to fetch saved words");
        this.setState({
          error: "Failed to load your vocabulary words.",
          isLoading: false
        });
      }
    } catch (error) {
      this.setState({
        error: "Failed to load your vocabulary words.",
        isLoading: false
      });
    }
  };

  // Load saved words from localStorage for guest users
  loadLocalSavedWords = () => {
    try {
      const savedWords = JSON.parse(localStorage.getItem('saved_vocabulary') || '[]');
      this.setState({ savedWords });
    } catch (error) {
      console.error("Error loading saved words from localStorage");
      this.setState({ savedWords: [] });
    }
  };

  // Check if a word already exists in the vocabulary
  isWordInVocabulary = (wordToCheck) => {
    return this.state.savedWords.some(
      existingWord => existingWord.word.toLowerCase() === wordToCheck.toLowerCase()
    );
  };

  // Save a word to the notepad
  saveWordToNotepad = async (word, definition, partOfSpeech, pronunciation) => {
    const isLoggedIn = Boolean(localStorage.getItem('jstoken'));

    if (isLoggedIn) {
      try {
        // Get backend URL with fallback mechanism
        const backendUrl = await getBackendUrl();

        // For logged-in users, save to server
        const response = await fetch(`${backendUrl}/dictionnary`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('jstoken')
          },
          body: JSON.stringify({
            word,
            definition,
            part_of_speech: partOfSpeech,
            pronunciation,
            session_name: localStorage.getItem("session") || "Vocabulary"
          })
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        await this.fetchSavedWords();
        return true;
      } catch (error) {
        console.error("Error saving word to notepad");
        return false;
      }
    } else {
      // For guest users, save to localStorage
      try {
        const newWord = {
          word,
          definition,
          part_of_speech: partOfSpeech,
          pronunciation,
          date: new Date().toISOString(),
          learned: false
        };

        const savedWords = JSON.parse(localStorage.getItem('saved_vocabulary') || '[]');
        savedWords.push(newWord);
        localStorage.setItem('saved_vocabulary', JSON.stringify(savedWords));

        this.setState(prevState => ({
          savedWords: [...prevState.savedWords, newWord]
        }));

        return true;
      } catch (error) {
        console.error("Error saving word to localStorage");
        return false;
      }
    }
  };

  // Mark a word as learned or not learned
  toggleWordLearned = async (wordId) => {
    console.log("Toggling learned status for word ID:", wordId);
    // Check if the user is logged in
    const isLoggedIn = Boolean(localStorage.getItem('jstoken'));

    if (isLoggedIn) {
      try {
        // Get backend URL with fallback mechanism
        const backendUrl = await getBackendUrl();

        const response = await fetch(`${backendUrl}/toggle-learnedle-learned/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem('jstoken')
          },
          body: JSON.stringify({ word_id: wordId })
        });
        console.log("Response from toggle learned request:", response);


        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        await this.fetchSavedWords();
        return true;
      } catch (error) {
        console.error("Error toggling word learned status");
        return false;
      }
    } else {
      // For guest users, update in localStorage
      try {
        const savedWords = JSON.parse(localStorage.getItem('saved_vocabulary') || '[]');
        const updatedWords = savedWords.map(word => {
          if (word.word === wordId) {
            return { ...word, learned: !word.learned };
          }
          return word;
        });

        localStorage.setItem('saved_vocabulary', JSON.stringify(updatedWords));
        this.setState({ savedWords: updatedWords });
        return true;
      } catch (error) {
        console.error("Error updating word in localStorage");
        return false;
      }
    }
  };

  // Delete a word from the vocabulary
  deleteWord = async (wordId) => {
    console.log("Deleting word with ID:", wordId);
    const isLoggedIn = Boolean(localStorage.getItem('jstoken'));

    if (isLoggedIn) {
      try {
        // Get backend URL with fallback mechanism
        const backendUrl = await getBackendUrl();

        const response = await fetch(`${backendUrl}/dictionnary/${wordId}`, {
          method: "DELETE",
          headers: {
            "Authorization": localStorage.getItem('jstoken')
          }
        });
        console.log("Response from delete request:", response);

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        await this.fetchSavedWords();
        return true;
      } catch (error) {
        console.error("Error deleting word", error);
        return false;
      }
    } else {
      // For guest users, delete from localStorage
      try {
        const savedWords = JSON.parse(localStorage.getItem('saved_vocabulary') || '[]');
        const updatedWords = savedWords.filter(word =>
          word.id !== wordId && word.word !== wordId
        );

        localStorage.setItem('saved_vocabulary', JSON.stringify(updatedWords));
        this.setState({ savedWords: updatedWords });
        return true;
      } catch (error) {
        console.error("Error deleting word from localStorage", error);
        return false;
      }
    }
  };

  // Create flashcards from selected vocabulary
  createFlashcards = (words) => {
    // Store selected words for flashcards in localStorage
    localStorage.setItem('flashcard_words', JSON.stringify(words));
  };

  // Make the dictionary lookup function available in our context
  fetchWordMeaning = (word) => {
    // Use the DictionaryContext's fetchWordMeaning and then set our current word
    // This will be called from within the DictionaryContext consumer
    this.setState({ currentWord: word });
  };

  render() {
    return (
      <DictionaryContext.Consumer>
        {(dictionaryContext) => (
          <VocabularyContext.Provider
            value={{
              ...this.state, fetchWordMeaning: (word) => {
                dictionaryContext.fetchWordMeaning(word);
                this.setState({ currentWord: word });
              },
              saveWordToNotepad: this.saveWordToNotepad,
              fetchSavedWords: this.fetchSavedWords,
              toggleWordLearned: this.toggleWordLearned,
              createFlashcards: this.createFlashcards,
              deleteWord: this.deleteWord,
              isWordInVocabulary: this.isWordInVocabulary,
              dictionaryContext
            }}
          >
            {this.props.children}
          </VocabularyContext.Provider>
        )}
      </DictionaryContext.Consumer>
    );
  }
}

export default VocabularyContextProvider;