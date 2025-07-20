import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../Contexts/AuthContext';
import { API_BASE_URL } from '../../config';

const ProgressTracker = () => {
  const [progressData, setProgressData] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    // Only fetch progress if user is logged in
    if (currentUser) {
      fetchUserProgress();
      fetchUserAchievements();
    } else {
      setLoading(false);
      setProgressData([]);
      setAchievements([]);
    }
  }, [currentUser]);

  const fetchUserProgress = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/progress`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (response.data && response.data.success) {
        setProgressData(response.data.progress || []);
      } else {
        setError('Failed to load progress data');
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError('Error loading progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAchievements = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/api/achievements`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (response.data && response.data.success) {
        setAchievements(response.data.achievements || []);
      } else {
        console.error('Failed to load achievements');
      }
    } catch (err) {
      console.error('Error fetching achievements:', err);
    }
  };

  // Helper function to get color based on completion percentage
  const getProgressColor = (percentage) => {
    if (percentage < 33) return 'bg-red-500';
    if (percentage < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (!currentUser) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress Tracker</h2>
        <p className="text-gray-500">Please log in to view your progress.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Learning Progress</h2>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && progressData.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          No progress data available. Start learning tenses to track your progress!
        </p>
      )}

      {progressData.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Tenses Progress</h3>
            
            {progressData.map(item => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">{item.tense_name}</h4>
                  <span className="text-sm text-gray-600">
                    {item.completion_percentage}% Complete
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getProgressColor(item.completion_percentage)}`}
                    style={{ width: `${item.completion_percentage}%` }}
                  ></div>
                </div>
                
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Quiz Score:</span> {item.quiz_avg_score}/10
                  </div>
                  <div>
                    <span className="font-medium">Examples:</span> {item.examples_correct}/{item.examples_submitted}
                  </div>
                  <div>
                    <span className="font-medium">Level:</span> {item.difficulty_level}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {achievements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Your Achievements</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map(achievement => (
                  <div key={achievement.id} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-start">
                      <div className="bg-yellow-100 rounded-full p-2">
                        <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-800">{achievement.achievement_name}</h4>
                        <p className="text-sm text-gray-600">{achievement.achievement_description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Achieved on {new Date(achievement.achieved_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Overall Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Tenses Completed</p>
                <p className="text-xl font-bold text-blue-600">
                  {progressData.filter(p => p.is_completed).length}/{progressData.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Average Completion</p>
                <p className="text-xl font-bold text-blue-600">
                  {Math.round(progressData.reduce((sum, item) => sum + item.completion_percentage, 0) / progressData.length)}%
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Achievements</p>
                <p className="text-xl font-bold text-blue-600">
                  {achievements.length}
                </p>
              </div>
              <div className="bg-white p-3 rounded shadow-sm">
                <p className="text-sm text-gray-500">Avg. Quiz Score</p>
                <p className="text-xl font-bold text-blue-600">
                  {(progressData.reduce((sum, item) => sum + item.quiz_avg_score, 0) / progressData.length).toFixed(1)}/10
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;