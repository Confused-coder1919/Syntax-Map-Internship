import { useState, useCallback } from 'react';
import api from '../utils/api';

/**
 * Custom hook for notepad operations
 * Demonstrates how to use the API client for notepad features
 */
const useNotepad = () => {
  const [notes, setNotes] = useState([]);
  const [mistakeQuestions, setMistakeQuestions] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all user's notes
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.getNotes();
      setNotes(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load notes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new note
  const createNote = useCallback(async (noteData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.createNote(noteData);
      // Add the new note to the state
      setNotes(prevNotes => [...prevNotes, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create note');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing note
  const updateNote = useCallback(async (noteId, noteData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.updateNote(noteId, noteData);
      
      // Update the note in the local state
      setNotes(prevNotes => {
        return prevNotes.map(note => {
          if (note.note_id === noteId) {
            return { ...note, ...noteData };
          }
          return note;
        });
      });
      
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update note');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a note
  const deleteNote = useCallback(async (noteId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.deleteNote(noteId);
      
      // Remove the note from the local state
      setNotes(prevNotes => prevNotes.filter(note => note.note_id !== noteId));
      
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to delete note');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's mistake questions
  const fetchMistakeQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.getMistakeQuestions();
      setMistakeQuestions(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load mistake questions');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's vocabulary words
  const fetchVocabulary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.getVocabulary();
      setVocabulary(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load vocabulary');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new vocabulary word
  const addVocabularyWord = useCallback(async (word, sessionName) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.addVocabularyWord(word, sessionName);
      // Update vocabulary list
      setVocabulary(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to add vocabulary word');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark a vocabulary word as learned
  const markWordAsLearned = useCallback(async (wordId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.markWordAsLearned(wordId);
      
      // Update the word status in local state
      setVocabulary(prevWords => {
        return prevWords.map(word => {
          if (word.id === wordId || word.word_id === wordId) {
            return { ...word, learned: true };
          }
          return word;
        });
      });
      
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update vocabulary status');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's example sentences
  const fetchExamples = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.getExamples();
      setExamples(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load examples');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new example sentence
  const createExample = useCallback(async (exampleData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.notepad.createExample(exampleData);
      // Update examples list
      setExamples(prev => [...prev, data]);
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create example');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    notes,
    mistakeQuestions,
    vocabulary,
    examples,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    fetchMistakeQuestions,
    fetchVocabulary,
    addVocabularyWord,
    markWordAsLearned,
    fetchExamples,
    createExample
  };
};

export default useNotepad;