import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  PencilIcon,
  FlagIcon,
  ClockIcon,
  ChartBarIcon,
  AcademicCapIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../config";
import toast from "react-hot-toast";

const LearningGoals = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [newGoalType, setNewGoalType] = useState("vocabulary");
  const [newGoalTarget, setNewGoalTarget] = useState(10);
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    vocabularyCount: 0,
    learnedTenses: 0,
    quizzesTaken: 0,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("jstoken")) &&
      localStorage.getItem("user_role") == 3
  );
  const [editingGoalId, setEditingGoalId] = useState(null);

  // Load goals from API or localStorage
  useEffect(() => {
    fetchGoals();
  }, [isLoggedIn]);

  // Set default deadline to 2 weeks from now
  useEffect(() => {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    setNewGoalDeadline(twoWeeksFromNow.toISOString().slice(0, 10));
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isLoggedIn) {
        // Fetch from API for logged-in users
        const response = await fetch(`${API_BASE_URL}/dashboard/goals`, {
          headers: { Authorization: localStorage.getItem("jstoken") },
        });

        if (!response.ok) {
          // If the endpoint doesn't exist yet, use localStorage as fallback
          if (response.status === 404) {
            const storedGoals = localStorage.getItem("learning_goals");
            if (storedGoals) {
              setGoals(JSON.parse(storedGoals));
            } else {
              setGoals([]);
            }
          } else {
            throw new Error(`API responded with status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          if (data && data.goals) {
            setGoals(data.goals);
          } else {
            setGoals([]);
          }
        }
      } else if (localStorage.getItem("user_role") == 4) {
        // For guest users, load from localStorage
        const storedGoals = localStorage.getItem("learning_goals");
        if (storedGoals) {
          setGoals(JSON.parse(storedGoals));
        } else {
          setGoals([]);
        }
      }
    } catch (err) {
      console.error("Error fetching goals:", err);
      setError("Failed to load learning goals. Please try again later.");

      // Try to load from localStorage as fallback
      const storedGoals = localStorage.getItem("learning_goals");
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();

    if (!newGoal.trim()) {
      toast.error("Please enter a goal description");
      return;
    }

    try {
      const newGoalData = {
        id: Date.now().toString(),
        description: newGoal,
        type: newGoalType,
        target: parseInt(newGoalTarget, 10),
        deadline: newGoalDeadline,
        progress: 0,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      if (isLoggedIn) {
        // Save to API for logged-in users
        try {
          const response = await fetch(`${API_BASE_URL}/dashboard/goals`, {
            method: "POST",
            body: JSON.stringify(newGoalData),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
              Authorization: localStorage.getItem("jstoken"),
            },
          });

          if (!response.ok) {
            // If API fails, fall back to localStorage
            const updatedGoals = [...goals, newGoalData];
            setGoals(updatedGoals);
            localStorage.setItem(
              "learning_goals",
              JSON.stringify(updatedGoals)
            );
          } else {
            const data = await response.json();
            // If API returns the updated goal with server-generated ID, use that
            if (data && data.goal) {
              setGoals((prevGoals) => [...prevGoals, data.goal]);
            } else {
              setGoals((prevGoals) => [...prevGoals, newGoalData]);
            }
          }
        } catch (error) {
          // If API fails, fall back to localStorage
          const updatedGoals = [...goals, newGoalData];
          setGoals(updatedGoals);
          localStorage.setItem("learning_goals", JSON.stringify(updatedGoals));
        }
      } else if (localStorage.getItem("user_role") == 4) {
        // For guest users, save to localStorage
        const updatedGoals = [...goals, newGoalData];
        setGoals(updatedGoals);
        localStorage.setItem("learning_goals", JSON.stringify(updatedGoals));
      }

      // Reset form
      setNewGoal("");
      setNewGoalType("vocabulary");
      setNewGoalTarget(10);

      // Set new deadline to 2 weeks from now
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      setNewGoalDeadline(twoWeeksFromNow.toISOString().slice(0, 10));

      toast.success("Learning goal added!");
      setNewGoal("");
      setNewGoalType("");
      setNewGoalTarget("");
      setNewGoalDeadline("");
    } catch (err) {
      console.error("Error adding goal:", err);
      toast.error("Failed to add goal. Please try again.");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      if (isLoggedIn) {
        // Delete from API for logged-in users
        try {
          const response = await fetch(
            `${API_BASE_URL}/dashboard/goals/${goalId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: localStorage.getItem("jstoken"),
              },
            }
          );

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
        } catch (error) {
          console.error(
            "API call failed, falling back to localStorage:",
            error
          );
        }
      }

      // Always update local state and localStorage for consistency
      const updatedGoals = goals.filter((goal) => goal.id !== goalId);
      setGoals(updatedGoals);
      localStorage.setItem("learning_goals", JSON.stringify(updatedGoals));

      toast.success("Goal deleted");
    } catch (err) {
      console.error("Error deleting goal:", err);
      toast.error("Failed to delete goal");
    }
  };

  const handleToggleComplete = async (goalId) => {
    try {
      const goalToUpdate = goals.find((goal) => goal.id === goalId);
      if (!goalToUpdate) return;

      const updatedGoal = {
        ...goalToUpdate,
        completed: !goalToUpdate.completed,
      };

      if (isLoggedIn) {
        // Update on API for logged-in users
        try {
          const response = await fetch(
            `${API_BASE_URL}/dashboard/goals/${goalId}`,
            {
              method: "PUT",
              body: JSON.stringify(updatedGoal),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: localStorage.getItem("jstoken"),
              },
            }
          );

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
        } catch (error) {
          console.error(
            "API call failed, falling back to localStorage:",
            error
          );
        }
      }

      // Always update local state and localStorage for consistency
      const updatedGoals = goals.map((goal) =>
        goal.id === goalId ? updatedGoal : goal
      );

      setGoals(updatedGoals);
      localStorage.setItem("learning_goals", JSON.stringify(updatedGoals));

      toast.success(
        updatedGoal.completed
          ? "Goal marked as completed!"
          : "Goal marked as in-progress"
      );
    } catch (err) {
      console.error("Error updating goal:", err);
      toast.error("Failed to update goal");
    }
  };

  const startEditingGoal = (goal) => {
    setEditingGoalId(goal.id);
    setNewGoal(goal.description);
    setNewGoalType(goal.type);
    setNewGoalTarget(goal.target);
    setNewGoalDeadline(goal.deadline);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();

    if (!newGoal.trim() || !editingGoalId) {
      return;
    }

    try {
      const updatedGoalData = {
        description: newGoal,
        type: newGoalType,
        target: parseInt(newGoalTarget, 10),
        deadline: newGoalDeadline,
      };

      if (isLoggedIn) {
        // Update on API for logged-in users
        try {
          const response = await fetch(
            `${API_BASE_URL}/dashboard/goals/${editingGoalId}`,
            {
              method: "PUT",
              body: JSON.stringify(updatedGoalData),
              headers: {
                "Content-type": "application/json; charset=UTF-8",
                Authorization: localStorage.getItem("jstoken"),
              },
            }
          );

          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
        } catch (error) {
          console.error(
            "API call failed, falling back to localStorage:",
            error
          );
        }
      }

      // Always update local state and localStorage for consistency
      const updatedGoals = goals.map((goal) =>
        goal.id === editingGoalId ? { ...goal, ...updatedGoalData } : goal
      );

      setGoals(updatedGoals);
      localStorage.setItem("learning_goals", JSON.stringify(updatedGoals));

      // Reset form
      setNewGoal("");
      setNewGoalType("vocabulary");
      setNewGoalTarget(10);
      setEditingGoalId(null);

      // Set new deadline to 2 weeks from now
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      setNewGoalDeadline(twoWeeksFromNow.toISOString().slice(0, 10));
      setNewGoal("");
      setNewGoalType("");
      setNewGoalTarget("");
      setNewGoalDeadline("");

      toast.success("Goal updated!");
    } catch (err) {
      console.error("Error updating goal:", err);
      toast.error("Failed to update goal. Please try again.");
    }
  };

  const cancelEditing = () => {
    setEditingGoalId(null);
    setNewGoal("");
    setNewGoalType("vocabulary");
    setNewGoalTarget(10);

    // Reset deadline to 2 weeks from now
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    setNewGoalDeadline(twoWeeksFromNow.toISOString().slice(0, 10));
  };

  // Calculate progress for each goal based on current stats
  const calculateProgress = (goal) => {
    switch (goal.type) {
      case "vocabulary":
        return Math.min(
          100,
          Math.round((stats.vocabularyCount / goal.target) * 100)
        );
      case "tenses":
        return Math.min(
          100,
          Math.round((stats.learnedTenses / goal.target) * 100)
        );
      case "quizzes":
        return Math.min(
          100,
          Math.round((stats.quizzesTaken / goal.target) * 100)
        );
      default:
        return 0;
    }
  };

  // If there's an error
  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
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

  return (
    <div className="p-6">
      {/* Add New Goal Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FlagIcon className="h-5 w-5 mr-2 text-orange-600" />
          {editingGoalId ? "Edit Learning Goal" : "Set a New Learning Goal"}
        </h3>

        <form
          onSubmit={editingGoalId ? handleUpdateGoal : handleAddGoal}
          className="space-y-4  mx-auto p-4 border rounded-md"
        >
          <div>
            <label
              htmlFor="goalDescription"
              className="block text-sm font-medium text-gray-700"
            >
              Goal Description
            </label>
            <input
              type="text"
              id="goalDescription"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              placeholder="e.g., Learn 50 new vocabulary words"
              required
            />
          </div>

          <div>
            <label
              htmlFor="goalType"
              className="block text-sm font-medium text-gray-700"
            >
              Goal Type
            </label>
            <select
              id="goalType"
              value={newGoalType}
              onChange={(e) => setNewGoalType(e.target.value)}
              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm border-gray-300 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="vocabulary">Vocabulary</option>
              <option value="tenses">Tenses</option>
              <option value="quizzes">Quizzes</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="goalTarget"
              className="block text-sm font-medium text-gray-700"
            >
              Target Number
            </label>
            <input
              type="number"
              id="goalTarget"
              value={newGoalTarget}
              onChange={(e) => setNewGoalTarget(e.target.value)}
              min="1"
              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="goalDeadline"
              className="block text-sm font-medium text-gray-700"
            >
              Deadline
            </label>
            <input
              type="date"
              id="goalDeadline"
              value={newGoalDeadline}
              onChange={(e) => setNewGoalDeadline(e.target.value)}
              className="mt-1 block w-full border rounded-md px-3 py-2 text-sm border-gray-300 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            {editingGoalId && (
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 rounded-md text-sm text-white bg-orange-600 hover:bg-orange-700"
            >
              {editingGoalId ? "Update Goal" : "Add Goal"}
            </button>
          </div>
        </form>
      </div>

      {/* Goals List */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FlagIcon className="h-5 w-5 mr-2 text-orange-600" />
          Your Learning Goals
        </h3>

        {goals.length === 0 ? (
          <div className="bg-gray-50 p-6 text-center rounded-lg">
            <FlagIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <h3 className="text-gray-500 font-medium">No goals set yet</h3>
            <p className="text-gray-400 text-sm mt-1">
              Set your first learning goal above to track your progress!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              // Calculate days remaining
              const today = new Date();
              const deadline = new Date(goal.deadline);
              const daysRemaining = Math.ceil(
                (deadline - today) / (1000 * 60 * 60 * 24)
              );

              // Calculate progress based on type
              const progress = goal.completed ? 100 : calculateProgress(goal);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white p-4 rounded-lg shadow border-l-4 ${
                    goal.completed
                      ? "border-green-500"
                      : daysRemaining < 0
                      ? "border-red-500"
                      : daysRemaining < 3
                      ? "border-yellow-500"
                      : "border-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div
                      className={`font-medium text-lg ${
                        goal.completed
                          ? "line-through text-gray-500"
                          : "text-gray-800"
                      }`}
                    >
                      {goal.description}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleComplete(goal.id)}
                        className={`p-1.5 rounded-full ${
                          goal.completed
                            ? "bg-green-100 text-green-600 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title={
                          goal.completed
                            ? "Mark as in-progress"
                            : "Mark as completed"
                        }
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => startEditingGoal(goal)}
                        className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                        title="Edit goal"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        title="Delete goal"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center">
                      <FlagIcon className="h-4 w-4 mr-1" />
                      <span className="capitalize">{goal.type}</span>
                    </div>

                    <div className="flex items-center">
                      <TargetIcon className="h-4 w-4 mr-1" />
                      <span>Target: {goal.target}</span>
                    </div>

                    <div
                      className={`flex items-center ${
                        daysRemaining < 0
                          ? "text-red-500 font-medium"
                          : daysRemaining < 3
                          ? "text-yellow-500 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {daysRemaining < 0
                        ? `Overdue by ${Math.abs(daysRemaining)} day${
                            Math.abs(daysRemaining) !== 1 ? "s" : ""
                          }`
                        : `${daysRemaining} day${
                            daysRemaining !== 1 ? "s" : ""
                          } left`}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className={`h-2 rounded-full ${
                        goal.completed
                          ? "bg-green-500"
                          : progress >= 100
                          ? "bg-green-500"
                          : progress >= 60
                          ? "bg-blue-500"
                          : progress >= 25
                          ? "bg-yellow-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Add missing icon component
const TargetIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <circle cx="12" cy="12" r="6" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" strokeWidth="2" />
  </svg>
);

// Add missing clipboard icon
const ClipboardCheckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
    />
  </svg>
);

export default LearningGoals;
