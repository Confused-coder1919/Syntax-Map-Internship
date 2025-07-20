import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../config';
import AdminLayout from './AdminLayout';

const API_URL = API_BASE_URL
const PageAdminTenseMap = () => {
  // State management
  const [tenses, setTenses] = useState([]);
  const [selectedTense, setSelectedTense] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    tense_name: '',
    tense_description: '',
    time_group: '',
    subcategory: '',
    grammar_rules: '',
    example_structure: '',
    usage_notes: '',
    difficulty_level: 1,
    examples: [],
    quizzes: []
  });
  const token = localStorage.getItem('jstoken') || ""

  // Fetch all tenses on component mount
  useEffect(() => {
    fetchTenses();
  }, []);

  // Fetch tenses from API
  const fetchTenses = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/tense/`);
      if (response.data.success) {
        setTenses(response.data.tenses);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch tenses',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (error) {
      console.error('Error fetching tenses:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error fetching tenses',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'difficulty_level' ? parseInt(value, 10) : value
    });
  };

  // Handle example changes
  const handleExampleChange = (index, field, value) => {
    const updatedExamples = [...formData.examples];
    updatedExamples[index] = {
      ...updatedExamples[index],
      [field]: value
    };
    setFormData({ ...formData, examples: updatedExamples });
  };

  // Add an empty example
  const addExample = () => {
    setFormData({
      ...formData,
      examples: [
        ...formData.examples,
        { example_text: '', sentence_type: 'affirmative' }
      ]
    });
  };

  // Remove an example
  const removeExample = (index) => {
    const updatedExamples = [...formData.examples];
    updatedExamples.splice(index, 1);
    setFormData({ ...formData, examples: updatedExamples });
  };

  // Handle quiz changes
  const handleQuizChange = (index, field, value) => {
    const updatedQuizzes = [...formData.quizzes];
    if (field === 'options') {
      // Parse options as array
      value = value.split(',').map(option => option.trim());
    }
    updatedQuizzes[index] = {
      ...updatedQuizzes[index],
      [field]: value
    };
    setFormData({ ...formData, quizzes: updatedQuizzes });
  };

  // Add an empty quiz
  const addQuiz = () => {
    setFormData({
      ...formData,
      quizzes: [
        ...formData.quizzes,
        { question: '', options: ['', '', '', ''], correct_answer: '', question_type: 'mcq' }
      ]
    });
  };

  // Remove a quiz
  const removeQuiz = (index) => {
    const updatedQuizzes = [...formData.quizzes];
    updatedQuizzes.splice(index, 1);
    setFormData({ ...formData, quizzes: updatedQuizzes });
  };

  // Handle tense selection
  const handleSelectTense = (tense) => {
    setSelectedTense(tense);
    setIsEditing(false);
    setIsCreating(false);
  };

  // Edit selected tense
  const handleEditTense = () => {
    if (!selectedTense) return;

    // Transform the existing tense data to match our form structure
    const tenseToEdit = {
      tense_name: selectedTense.tense_name,
      tense_description: selectedTense.description,
      subcategory: selectedTense.subcategory || '',
      grammar_rules: selectedTense.grammar_rules || '',
      example_structure: selectedTense.example_structure || '',
      usage_notes: selectedTense.usage_notes || '',
      difficulty_level: selectedTense.difficulty_level || 1,
      examples: selectedTense.examples.map(example => ({
        example_text: example.example_text,
        sentence_type: example.sentence_type || 'affirmative'
      })),
      quizzes: selectedTense.quizzes.map(quiz => ({
        question: quiz.question,
        options: Array.isArray(quiz.options) ? quiz.options : [],
        correct_answer: quiz.correct_answer,
        question_type: quiz.question_type || 'mcq'
      }))
    };

    setFormData(tenseToEdit);
    setIsEditing(true);
    setIsCreating(false);
  };

  // Create new tense
  const handleNewTense = () => {
    setFormData({
      tense_name: '',
      tense_description: '',
      time_group: '',
      subcategory: '',
      grammar_rules: '',
      example_structure: '',
      usage_notes: '',
      difficulty_level: 1,
      examples: [],
      quizzes: []
    });
    setSelectedTense(null);
    setIsEditing(false);
    setIsCreating(true);
  };

  // Submit form - handles both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare the payload
    const payload = {
      tense_name: formData.tense_name,
      tense_description: formData.tense_description,
      // time_group: formData.time_group,
      subcategory: formData.subcategory,
      grammar_rules: formData.grammar_rules,
      example_structure: formData.example_structure,
      usage_notes: formData.usage_notes,
      difficulty_level: formData.difficulty_level,
      examples: formData.examples,
      quizzes: formData.quizzes
    };

    try {
      let response;
      if (isCreating) {
        // Creating a new tense
        const response = await axios.post(
          `${API_URL}/tense/`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            }
          }
        );
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Tense created successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      } else if (isEditing) {
        // Updating an existing tense
        response = await axios.put(`${API_URL}/tense/${selectedTense.tense_id}`, payload,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': token
            }
          }
        );
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Tense updated successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }

      // Refresh tenses list
      fetchTenses();
      setIsEditing(false);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving tense:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save tense',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete tense
  const handleDeleteTense = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed || !selectedTense) return;

    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/tense/${selectedTense.tense_id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Tense deleted successfully',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      setSelectedTense(null);
      fetchTenses();
    } catch (error) {
      console.error('Error deleting tense:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete tense',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing/creating
  const handleCancel = () => {
    setIsEditing(false);
    setIsCreating(false);
  };

  return (
    <AdminLayout title="Admin Tense Management">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Tense Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left panel - Tense List */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Tenses</h2>
              <button
                onClick={handleNewTense}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                New Tense
              </button>
            </div>

            {isLoading && <p className="text-center py-4">Loading...</p>}

            <div className="max-h-[100vh] overflow-y-auto">
              {tenses.map(tense => (
                <div
                  key={tense.tense_id}
                  className={`p-3 mb-2 border rounded cursor-pointer hover:bg-gray-50 ${selectedTense?.tense_id === tense.tense_id ? 'bg-blue-50 border-blue-300' : ''}`}
                  onClick={() => handleSelectTense(tense)}
                >
                  <div className="font-medium">{tense.tense_name}</div>
                  <div className="text-sm text-gray-600 truncate">{tense.description}</div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{tense.time_group} {tense.subcategory}</span>
                    <span className="text-xs bg-blue-100 px-2 py-0.5 rounded">Level {tense.difficulty_level}</span>
                  </div>
                </div>
              ))}

              {!isLoading && tenses.length === 0 && (
                <p className="text-center py-4 text-gray-500">No tenses found</p>
              )}
            </div>
          </div>

          {/* Middle panel - Tense Details */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">Tense Details</h2>

            {selectedTense ? (
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedTense.tense_name}</h3>
                <p className="mb-3">{selectedTense.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-xs text-gray-500">Time Group</span>
                    <p>{selectedTense.time_group || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-xs text-gray-500">Subcategory</span>
                    <p>{selectedTense.subcategory || 'Not specified'}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-xs text-gray-500">Difficulty</span>
                    <p>Level {selectedTense.difficulty_level}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-xs text-gray-500">Status</span>
                    <p>{selectedTense.active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>

                {selectedTense.grammar_rules && (
                  <div className="mb-4">
                    <h4 className="font-semibold">Grammar Rules</h4>
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-2 rounded border">{selectedTense.grammar_rules}</pre>
                  </div>
                )}

                {selectedTense.example_structure && (
                  <div className="mb-4">
                    <h4 className="font-semibold">Example Structure</h4>
                    <p className="text-sm bg-gray-50 p-2 rounded border">{selectedTense.example_structure}</p>
                  </div>
                )}

                {selectedTense.usage_notes && (
                  <div className="mb-4">
                    <h4 className="font-semibold">Usage Notes</h4>
                    <p className="text-sm bg-gray-50 p-2 rounded border">{selectedTense.usage_notes}</p>
                  </div>
                )}

                <div className="flex space-x-2 mt-6">
                  <button
                    onClick={handleEditTense}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteTense}
                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : !isCreating && !isEditing ? (
              <p className="text-center py-10 text-gray-500">Select a tense to view details or create a new one</p>
            ) : null}
          </div>

          {/* Right panel - Edit/Create Form */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">
              {isCreating ? 'Create New Tense' : isEditing ? 'Edit Tense' : 'Form'}
            </h2>

            {(isEditing || isCreating) && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tense Name*</label>
                  <input
                    type="text"
                    name="tense_name"
                    value={formData.tense_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description*</label>
                  <textarea
                    name="tense_description"
                    value={formData.tense_description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    rows="3"
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subcategory</label>
                    <input
                      type="text"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                  <select
                    name="difficulty_level"
                    value={formData.difficulty_level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value={1}>1 - Beginner</option>
                    <option value={2}>2 - Elementary</option>
                    <option value={3}>3 - Intermediate</option>
                    <option value={4}>4 - Advanced</option>
                    <option value={5}>5 - Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Grammar Rules (Markdown supported)</label>
                  <textarea
                    name="grammar_rules"
                    value={formData.grammar_rules}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    rows="5"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Example Structure</label>
                  <input
                    type="text"
                    name="example_structure"
                    value={formData.example_structure}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Usage Notes</label>
                  <textarea
                    name="usage_notes"
                    value={formData.usage_notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    rows="3"
                  ></textarea>
                </div>

                {/* Examples Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Examples</label>
                    <button
                      type="button"
                      onClick={addExample}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Example
                    </button>
                  </div>

                  {formData.examples.length > 0 ? (
                    formData.examples.map((example, index) => (
                      <div key={index} className="p-3 mb-2 border rounded bg-gray-50">
                        <div className="mb-2">
                          <label className="block text-xs text-gray-600 mb-1">Example Text*</label>
                          <input
                            type="text"
                            value={example.example_text}
                            onChange={(e) => handleExampleChange(index, 'example_text', e.target.value)}
                            className="w-full px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Type</label>
                            <select
                              value={example.sentence_type || 'affirmative'}
                              onChange={(e) => handleExampleChange(index, 'sentence_type', e.target.value)}
                              className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            >
                              <option value="affirmative">Affirmative</option>
                              <option value="negative">Negative</option>
                              <option value="interrogative">Interrogative</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeExample(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No examples added</p>
                  )}
                </div>

                {/* Quizzes Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium">Quizzes</label>
                    <button
                      type="button"
                      onClick={addQuiz}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Add Quiz
                    </button>
                  </div>

                  {formData.quizzes.length > 0 ? (
                    formData.quizzes.map((quiz, index) => (
                      <div key={index} className="p-3 mb-2 border rounded bg-gray-50">
                        <div className="mb-2">
                          <label className="block text-xs text-gray-600 mb-1">Question*</label>
                          <input
                            type="text"
                            value={quiz.question}
                            onChange={(e) => handleQuizChange(index, 'question', e.target.value)}
                            className="w-full px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                          />
                        </div>

                        <div className="mb-2">
                          <label className="block text-xs text-gray-600 mb-1">Options (comma separated)*</label>
                          <input
                            type="text"
                            value={Array.isArray(quiz.options) ? quiz.options.join(', ') : ''}
                            onChange={(e) => handleQuizChange(index, 'options', e.target.value)}
                            placeholder="Option 1, Option 2, Option 3, Option 4"
                            className="w-full px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                          />
                        </div>

                        <div className="mb-2">
                          <label className="block text-xs text-gray-600 mb-1">Correct Answer*</label>
                          <input
                            type="text"
                            value={quiz.correct_answer}
                            onChange={(e) => handleQuizChange(index, 'correct_answer', e.target.value)}
                            className="w-full px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            required
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Type</label>
                            <select
                              value={quiz.question_type || 'mcq'}
                              onChange={(e) => handleQuizChange(index, 'question_type', e.target.value)}
                              className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            >
                              <option value="mcq">Multiple Choice</option>
                              <option value="fill-blank">Fill in the blank</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeQuiz(index)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No quizzes added</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PageAdminTenseMap;