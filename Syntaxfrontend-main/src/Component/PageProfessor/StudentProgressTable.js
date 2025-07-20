import React, { useState, useEffect } from "react";
import { Button, Alert, Skeleton } from "../UI";
import { API_BASE_URL } from "../../config";

const StudentProgressTable = () => {
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    userId: "",
    tenseId: "",
    startDate: "",
    endDate: "",
  });
  // Fetch students list
  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/students`,{
        headers: {
          "Authorization": localStorage.getItem("jstoken"),
        },
      });
      const data = await response.json();
      setStudents(data.students);
    } catch (err) {
      setError("Failed to fetch students list");
      console.error(err);
    }
  };

  // Fetch progress data for a specific student
  const fetchProgress = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/student/${userId}/progress`,{
        headers: {
          "Authorization": localStorage.getItem("jstoken"),
        },
      });
      
      const data = await response.json();
      setProgress(data.progress);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      setError("Failed to fetch progress data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (filters.userId) {
      fetchProgress(filters.userId);
    }
  }, [filters.userId]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter progress data based on current filters
  const filteredProgress = progress?.filter(item => {
    const dateInRange = (!filters.startDate || new Date(item.created_at) >= new Date(filters.startDate)) &&
                       (!filters.endDate || new Date(item.created_at) <= new Date(filters.endDate));
    const matchesTense = !filters.tenseId || item.tense_id === filters.tenseId;
    return dateInRange && matchesTense;
  });
  

  // Export progress report as CSV
  const exportReport = () => {
    const headers = [
      "Tense Name",
      "Completion %",
      "Quiz Avg Score",
      "Quiz Count",
      "Examples Submitted",
      "Examples Correct",
      "Is Completed",
      "Last Updated"
    ];

    const csvContent = [
      headers.join(","),
      ...filteredProgress.map(item => [
        item.tense_name,
        item.completion_percentage,
        item.quiz_avg_score,
        item.quiz_count,
        item.examples_submitted,
        item.examples_correct,
        item.is_completed,
        new Date(item.updated_at).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `student-progress-${filters.userId}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Student Progress Tracker</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          name="userId"
          value={filters.userId}
          onChange={handleFilterChange}
          className="border rounded p-2"
        >
          <option value="">Select Student</option>
          {students.map(student => (
            <option key={student.user_id} value={student.user_id}>
              {student.user_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="border rounded p-2"
          placeholder="Start Date"
        />

        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="border rounded p-2"
          placeholder="End Date"
        />

        <Button onClick={exportReport} disabled={!filteredProgress?.length}>
          Export Report
        </Button>
      </div>

      {error && <Alert type="error" message={error} className="mb-4" />}

      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded">
            <h3 className="font-semibold">Overall Completion</h3>
            <p className="text-2xl">{stats.overall_completion}%</p>
          </div>
          <div className="bg-green-50 p-4 rounded">
            <h3 className="font-semibold">Average Quiz Score</h3>
            <p className="text-2xl">{stats.quiz_avg_score}%</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded">
            <h3 className="font-semibold">Examples Accuracy</h3>
            <p className="text-2xl">{stats.accuracy_percentage}%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <h3 className="font-semibold">Tenses Started</h3>
            <p className="text-2xl">{stats.tenses_started}</p>
          </div>
        </div>
      )}

      {/* Progress Table */}
      {loading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Tense Name</th>
                <th className="p-4 text-left">Completion</th>
                <th className="p-4 text-left">Quiz Average</th>
                <th className="p-4 text-left">Examples</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredProgress?.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-4">{item.tense_name}</td>
                  <td className="p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${item.completion_percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{item.completion_percentage}%</span>
                  </td>
                  <td className="p-4">
                    {item.quiz_avg_score.toFixed(1)}% ({item.quiz_count} quizzes)
                  </td>
                  <td className="p-4">
                    {item.examples_correct}/{item.examples_submitted}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.is_completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.is_completed ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="p-4">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentProgressTable;












