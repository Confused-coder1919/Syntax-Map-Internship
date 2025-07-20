import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowPathIcon,
  CheckCircleIcon, 
  PlusIcon,
  TrashIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const GoalTracker = ({ goals = [] }) => {
  const [studentGoals, setStudentGoals] = useState(goals);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    dueDate: '',
    progress: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.dueDate) return;
    
    try {
      setIsSubmitting(true);
      // Replace with actual API endpoint
      // const response = await axios.post('/api/student/goals', newGoal);
      // const createdGoal = response.data;
      
      // Mock API response for development
      const createdGoal = {
        id: Date.now(),
        name: newGoal.name,
        dueDate: newGoal.dueDate,
        progress: 0
      };
      
      setStudentGoals([...studentGoals, createdGoal]);
      setNewGoal({ name: '', dueDate: '', progress: 0 });
      setShowAddGoal(false);
    } catch (err) {
      console.error('Error adding goal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteGoal = async (goalId) => {
    try {
      // Replace with actual API endpoint
      // await axios.delete(`/api/student/goals/${goalId}`);
      
      setStudentGoals(studentGoals.filter(goal => goal.id !== goalId));
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };
  
  const handleUpdateProgress = async (goalId, newProgress) => {
    try {
      // Replace with actual API endpoint
      // await axios.patch(`/api/student/goals/${goalId}`, { progress: newProgress });
      
      setStudentGoals(studentGoals.map(goal => 
        goal.id === goalId ? { ...goal, progress: newProgress } : goal
      ));
    } catch (err) {
      console.error('Error updating goal progress:', err);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };
  
  if (!studentGoals.length && !showAddGoal) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 mb-4">No goals set yet. Start by adding a learning goal.</p>
        <button
          onClick={() => setShowAddGoal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center mx-auto"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Goal
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Goals List */}
      {studentGoals.length > 0 && (
        <motion.div className="space-y-3 mb-4" variants={containerVariants}>
          {studentGoals.map((goal) => {
            const daysRemaining = getDaysRemaining(goal.dueDate);
            const isOverdue = daysRemaining < 0;
            const isCompleted = goal.progress === 100;
            
            return (
              <motion.div 
                key={goal.id}
                variants={itemVariants}
                className={`bg-white border rounded-lg p-4 ${
                  isOverdue && !isCompleted ? 'border-red-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{goal.name}</h4>
                    <div className="flex items-center mt-1 text-sm">
                      <ClockIcon className={`h-4 w-4 ${
                        isOverdue && !isCompleted ? 'text-red-500' : 'text-gray-500'
                      } mr-1`} />
                      <span className={`${
                        isOverdue && !isCompleted ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {isOverdue 
                          ? `Overdue by ${Math.abs(daysRemaining)} days` 
                          : `${daysRemaining} days left`
                        } (Due: {formatDate(goal.dueDate)})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Delete goal"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{goal.progress}% complete</span>
                    {isCompleted && (
                      <span className="text-xs font-medium text-green-600 flex items-center">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        isCompleted ? 'bg-green-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
                
                {!isCompleted && (
                  <div className="mt-2 flex space-x-1">
                    {[25, 50, 75, 100].map(progress => (
                      <button
                        key={progress}
                        onClick={() => handleUpdateProgress(goal.id, progress)}
                        className={`text-xs px-2 py-1 rounded ${
                          goal.progress >= progress 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {progress}%
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
      
      {/* Add Goal Form */}
      {showAddGoal ? (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-50 border border-gray-200 rounded-lg p-4"
        >
          <h4 className="text-sm font-medium text-gray-800 mb-3">Add New Goal</h4>
          <form onSubmit={handleAddGoal}>
            <div className="mb-3">
              <label htmlFor="goalName" className="block text-xs text-gray-700 mb-1">
                Goal Description
              </label>
              <input
                type="text"
                id="goalName"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Master Present Perfect Tense"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="goalDueDate" className="block text-xs text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="goalDueDate"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]} // Today or later
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-70 flex items-center space-x-1"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Goal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add New Goal
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default GoalTracker;