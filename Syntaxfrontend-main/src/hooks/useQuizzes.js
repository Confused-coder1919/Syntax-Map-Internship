import { useState, useCallback } from 'react';
import api from '../utils/api';

/**
 * Custom hook for quiz operations
 * Demonstrates how to use the API client for quiz management and taking quizzes
 */
const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all quizzes
  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.quizzes.getAll();
      setQuizzes(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get quizzes for a specific tense
  const fetchQuizzesByTense = useCallback(async (tenseId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.quizzes.getByTense(tenseId);
      setQuizzes(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load tense quizzes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single quiz by ID
  const fetchQuizById = useCallback(async (quizId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.quizzes.getById(quizId);
      setCurrentQuiz(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to load quiz details');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new quiz (admin/teacher only)
  const createQuiz = useCallback(async (quizData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.quizzes.create(quizData);
      // Refresh the quizzes list after creation
      fetchQuizzes();
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchQuizzes]);

  // Update an existing quiz (admin/teacher only)
  const updateQuiz = useCallback(async (quizId, quizData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.quizzes.update(quizId, quizData);
      
      // Update the quiz in the local state
      setQuizzes(prevQuizzes => {
        return prevQuizzes.map(quiz => {
          if (quiz.quiz_id === quizId) {
            return { ...quiz, ...quizData };
          }
          return quiz;
        });
      });
      
      // Update current quiz if it's the one being edited
      if (currentQuiz && currentQuiz.quiz_id === quizId) {
        setCurrentQuiz({ ...currentQuiz, ...quizData });
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to update quiz');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentQuiz]);

  // Delete a quiz (admin/teacher only)
  const deleteQuiz = useCallback(async (quizId) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.quizzes.delete(quizId);
      
      // Remove the quiz from the local state
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.quiz_id !== quizId));
      
      // Clear current quiz if it's the one being deleted
      if (currentQuiz && currentQuiz.quiz_id === quizId) {
        setCurrentQuiz(null);
      }
      
      return { success: true, data };
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [currentQuiz]);

  // Submit quiz answers and get results
  const submitQuizAnswers = useCallback(async (quizId, answers) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await api.quizzes.submitAnswers(quizId, answers);
      setQuizResults(results);
      return results;
    } catch (err) {
      setError(err.message || 'Failed to submit quiz answers');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear the current quiz results
  const clearQuizResults = useCallback(() => {
    setQuizResults(null);
  }, []);

  return {
    quizzes,
    currentQuiz,
    quizResults,
    loading,
    error,
    fetchQuizzes,
    fetchQuizzesByTense,
    fetchQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitQuizAnswers,
    clearQuizResults
  };
};

export default useQuizzes;