import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * Custom hook for tense operations
 * Demonstrates how to use the API client for tense management
 */
export const useTenses = () => {
  const [tenses, setTenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTense, setCurrentTense] = useState(null);

  // Fetch all tenses
  const fetchTenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.tenses.getAll();
      setTenses(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load tenses');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single tense by ID
  const fetchTenseById = useCallback(async (tenseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.tenses.getById(tenseId);
      setCurrentTense(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load tense details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new tense (admin only)
  const createTense = useCallback(async (tenseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.tenses.create(tenseData);
      // Refresh the tenses list after creation
      fetchTenses();
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create tense');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTenses]);

  // Update an existing tense (admin only)
  const updateTense = useCallback(async (tenseId, tenseData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.tenses.update(tenseId, tenseData);
      
      // Update the tense in the local state
      setTenses(prevTenses => {
        return prevTenses.map(tense => {
          if (tense.tense_id === tenseId) {
            return { ...tense, ...tenseData };
          }
          return tense;
        });
      });
      
      // Update current tense if it's the one being edited
      if (currentTense && currentTense.tense_id === tenseId) {
        setCurrentTense({ ...currentTense, ...tenseData });
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update tense');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentTense]);

  // Delete a tense (admin only)
  const deleteTense = useCallback(async (tenseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.tenses.delete(tenseId);
      
      // Remove the tense from the local state
      setTenses(prevTenses => prevTenses.filter(tense => tense.tense_id !== tenseId));
      
      // Clear current tense if it's the one being deleted
      if (currentTense && currentTense.tense_id === tenseId) {
        setCurrentTense(null);
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to delete tense');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentTense]);

  return {
    tenses,
    currentTense,
    loading,
    error,
    fetchTenses,
    fetchTenseById,
    createTense,
    updateTense,
    deleteTense
  };
};

export default useTenses;