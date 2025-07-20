import React, { createContext, Component } from 'react';

export const DictionaryContext = createContext();

class DictionaryContextProvider extends Component {
  state = {
    isOpen: false,
    word: '',
    definitions: [],
    examples: [],
    audioUrl: '',
    loading: false,
    error: null,
    recentSearches: [], // Store recent searches for quick access
    cachedWords: {}, // Cache word data to reduce API calls
  };

  // Initialize state with data from localStorage if available
  componentDidMount() {
    this.loadFromLocalStorage();
  }

  // Save recent searches and cache to localStorage
  saveToLocalStorage = () => {
    try {
      // Only save the 10 most recent searches to localStorage
      const recentSearches = this.state.recentSearches.slice(0, 10);
      localStorage.setItem('dictionary_recent_searches', JSON.stringify(recentSearches));
      
      // Only save a limited cache to prevent localStorage from getting too large
      const cachedKeys = Object.keys(this.state.cachedWords).slice(0, 20);
      const limitedCache = {};
      cachedKeys.forEach(key => {
        limitedCache[key] = this.state.cachedWords[key];
      });
      localStorage.setItem('dictionary_cache', JSON.stringify(limitedCache));
    } catch (error) {
      console.error('Error saving dictionary data to localStorage', error);
    }
  };

  // Load recent searches and cache from localStorage
  loadFromLocalStorage = () => {
    try {
      const recentSearches = JSON.parse(localStorage.getItem('dictionary_recent_searches') || '[]');
      const cachedWords = JSON.parse(localStorage.getItem('dictionary_cache') || '{}');
      this.setState({ recentSearches, cachedWords });
    } catch (error) {
      console.error('Error loading dictionary data from localStorage', error);
    }
  };

  setOpen = () => {
    this.setState({ isOpen: true });
  }

  setClose = () => {
    this.setState({ isOpen: false });
  }

  // Add recent search
  addRecentSearch = (word) => {
    // Remove this word from the list if it exists (to move it to the top)
    const recentSearches = this.state.recentSearches
      .filter(item => item.toLowerCase() !== word.toLowerCase());
    
    // Add to the beginning of the list
    recentSearches.unshift(word);
    
    // Keep only the 10 most recent
    const updatedSearches = recentSearches.slice(0, 10);
    this.setState({ recentSearches: updatedSearches }, this.saveToLocalStorage);
  };

  // Clear cache and recent searches
  clearDictionaryData = () => {
    this.setState({ 
      cachedWords: {},
      recentSearches: []
    }, () => {
      localStorage.removeItem('dictionary_recent_searches');
      localStorage.removeItem('dictionary_cache');
    });
  };

  fetchWordMeaning = async (word) => {
    if (!word) return;
    
    // Normalize the word for better cache hits (lowercase, trim)
    const normalizedWord = word.toLowerCase().trim();
    
    this.setState({ loading: true, word: normalizedWord, error: null });
    this.addRecentSearch(normalizedWord);
    
    // Check if we have this word cached
    if (this.state.cachedWords[normalizedWord]) {
      const cachedData = this.state.cachedWords[normalizedWord];
      this.setState({
        definitions: cachedData.definitions,
        examples: cachedData.examples,
        audioUrl: cachedData.audioUrl,
        loading: false,
        isOpen: true
      });
      return;
    }
    
    // No cache hit, fetch from API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(normalizedWord)}`, 
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? `No definitions found for "${normalizedWord}"`
          : `Error fetching definition: ${response.status}`
        );
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Get definitions
        const definitions = [];
        data[0].meanings.forEach(meaning => {
          meaning.definitions.forEach(def => {
            definitions.push({
              partOfSpeech: meaning.partOfSpeech,
              definition: def.definition
            });
          });
        });
        
        // Get examples
        const examples = [];
        data[0].meanings.forEach(meaning => {
          meaning.definitions.forEach(def => {
            if (def.example) {
              examples.push(def.example);
            }
          });
        });
        
        // Get audio URL
        let audioUrl = '';
        if (data[0].phonetics && data[0].phonetics.length > 0) {
          const phonetic = data[0].phonetics.find(p => p.audio && p.audio.trim() !== '');
          if (phonetic) {
            audioUrl = phonetic.audio;
          }
        }
        
        // Save to cache
        const cachedWords = {
          ...this.state.cachedWords,
          [normalizedWord]: {
            definitions,
            examples,
            audioUrl,
            timestamp: Date.now()
          }
        };
        
        this.setState({
          definitions,
          examples,
          audioUrl,
          loading: false,
          isOpen: true,
          cachedWords
        }, this.saveToLocalStorage);
      }
    } catch (error) {
      // Handle timeout errors separately
      const errorMessage = error.name === 'AbortError' 
        ? 'Request timed out. Please try again.'
        : error.message;
        
      this.setState({ 
        error: errorMessage, 
        loading: false,
        definitions: [],
        examples: [],
        audioUrl: ''
      });
    }
  };

  render() {
    return (
      <DictionaryContext.Provider 
        value={{
          ...this.state, 
          setOpen: this.setOpen, 
          setClose: this.setClose,
          fetchWordMeaning: this.fetchWordMeaning,
          clearDictionaryData: this.clearDictionaryData
        }}
      >
        {this.props.children}
      </DictionaryContext.Provider>
    );
  }
}

export default DictionaryContextProvider;