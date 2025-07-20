import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Section } from '../UI';
import { API_BASE_URL } from '../../config';

const StudentExampleReview = ({ pendingReviews = [], refreshReviews,students }) => {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [examplesByTense, setExamplesByTense] = useState({});
  const [examplesByUser, setExamplesByUser] = useState({});
  const [tenseNames, setTenseNames] = useState({});
  const [userNames, setUserNames] = useState({});
  const [activeView, setActiveView] = useState('all'); // 'all', 'byTense', 'byUser'

  // Get token from local storage
  const token = localStorage.getItem('jstoken');

  // Use pendingReviews if provided, otherwise fetch
  useEffect(() => {
    if (pendingReviews && pendingReviews.length > 0) {
      setExamples(pendingReviews?.filter(item => !item.teacher_reviewed));
      setLoading(false);
    } else {
      fetchUnreviewedExamples();
    }
    fetchTenseNames();
  }, [pendingReviews]); const fetchUnreviewedExamples = async () => {
    setLoading(true);
    try {
      // Use the API_BASE_URL from config
      const response = await fetch(`${API_BASE_URL}/teacher/shared-examples?teacher_reviewed=false`, {
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setExamples(data.examples);
        setExamplesByTense(data.examplesByTense || {});
        setExamplesByUser(data.examplesByUser || {});

        // Initialize feedback state for each example
        const initialFeedbacks = {};
        data.examples.forEach(example => {
          initialFeedbacks[example.example_id] = '';
        });
        setFeedbacks(initialFeedbacks);
      } else {
        throw new Error('Failed to fetch examples');
      }
    } catch (err) {
      setError('Failed to load student examples. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchTenseNames = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tense`, {
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();


      const tenseMap = {};
      data.tenses.forEach(tense => {
        tenseMap[tense.tense_id] = tense.tense_name;
      });
      setTenseNames(tenseMap);

    } catch (err) {
      console.error('Failed to load tense names:', err);
    }
  };

  const handleFeedbackChange = (exampleId, value) => {
    setFeedbacks(prev => ({
      ...prev,
      [exampleId]: value
    }));
  };

  const handleSubmitFeedback = async (example) => {
    try {
      const feedback = feedbacks[example.example_id];

      if (!feedback || feedback.trim() === '') {
        setError('Please provide feedback before submitting.');
        return;
      } const response = await fetch(
        `${API_BASE_URL}/tense/${example.tense_id}/example/${example.example_id}/review/`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
          },
          body: JSON.stringify({
            feedback
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      refreshReviews()

      if (data.success) {
        setSuccess(`Feedback for example "${example.example_text.substring(0, 20)}..." submitted successfully!`);

        // Remove the reviewed example from the list
        setExamples(examples.filter(e => e.example_id !== example.example_id));

        // Also remove from grouped examples
        if (examplesByTense[example.tense_id]) {
          setExamplesByTense(prev => ({
            ...prev,
            [example.tense_id]: prev[example.tense_id].filter(
              e => e.example_id !== example.example_id
            )
          }));
        }

        if (examplesByUser[example.user_id]) {
          setExamplesByUser(prev => ({
            ...prev,
            [example.user_id]: prev[example.user_id].filter(
              e => e.example_id !== example.example_id
            )
          }));
        }

        // Clear the feedback for this example
        setFeedbacks(prev => {
          const newFeedbacks = { ...prev };
          delete newFeedbacks[example.example_id];
          return newFeedbacks;
        });

        // Notify parent component

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (err) {
      setError('Failed to submit feedback: ' + err.message);
      console.error(err);

      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const filterStudentName = (userId) => {
    const student = students.find(student => student.user_id === userId);
    return student ? `${student.user_name}` : 'Unknown Student';
  };
  const renderExampleCard = (example) => {
    const difficultyLabels = ['Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'];
    const difficultyLevel = difficultyLabels[example.difficulty_level - 1] || 'Unknown';

    return (
      <Card key={example.example_id} className="mb-4 p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-blue-700">Student Example</h3>
            <p className="text-gray-800 bg-gray-100 p-4 rounded-lg font-medium">"{example.example_text}"</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-lg">
            <div>
              <p><strong className="text-gray-700">Tense:</strong> <span className="font-medium">{tenseNames[example.tense_id] || 'Unknown'}</span></p>
              <p><strong className="text-gray-700">Student:</strong> <span className="font-medium">{filterStudentName(example.user_id) || 'Unknown'}</span></p>
            </div>
            <div>
              <p>
                <strong className="text-gray-700">Difficulty:</strong>
                <span className={`font-medium ml-1 ${example.difficulty_level >= 4 ? 'text-red-600' :
                    example.difficulty_level >= 3 ? 'text-orange-500' :
                      example.difficulty_level >= 2 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                  {difficultyLevel}
                </span>
              </p>
              <p><strong className="text-gray-700">Type:</strong> <span className="font-medium capitalize">{example.sentence_type || 'Not specified'}</span></p>
              <p><strong className="text-gray-700">Submitted:</strong> <span className="font-medium">{new Date(example.created_at).toLocaleDateString()} at {new Date(example.created_at).toLocaleTimeString()}</span></p>
            </div>
          </div>

          <div className="mt-2">
            <h3 className="text-lg font-semibold text-blue-700 mb-2">Your Feedback</h3>
            <p className="text-sm text-gray-600 mb-2">Please provide constructive feedback for this student example. Your feedback will be shown to the student in their notepad example page.</p>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Provide feedback on grammar, structure, word choice, etc. Be specific and constructive..."
              value={feedbacks[example.example_id] || ''}
              onChange={(e) => handleFeedbackChange(example.example_id, e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => handleSubmitFeedback(example)}
              disabled={!feedbacks[example.example_id]}
              className="px-6 py-2 font-medium"
            >
              Submit Review
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const renderExamplesByView = () => {
    if (loading) {
      return <p className="text-center py-4">Loading examples...</p>;
    }

    if (examples.length === 0) {
      return <p className="text-center py-4">No examples pending for review.</p>;
    }
    return examples.map(example => renderExampleCard(example));
  };
  return (
    <Section title="Student Example Review Dashboard">
      {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess(null)}>{success}</Alert>}

      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Review Student Examples</h2>
        <p className="mb-4 text-gray-700">
          Below are examples submitted by students that require your review. Your feedback is important and will be displayed to the students in their notepad example page, helping them improve their language skills.
        </p>
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-sm text-blue-700">
            <strong>Teacher Tip:</strong> Provide specific, actionable feedback that addresses grammar, vocabulary, and sentence structure. Be encouraging while highlighting areas for improvement.
          </p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 border-b border-gray-200 pb-2 mb-4">
          <p>Showing unreviewed examples only</p>
          <p>{examples.length} example{examples.length !== 1 ? 's' : ''} pending review</p>
        </div>
      </div>

      <div>
        {renderExamplesByView()}
      </div>
    </Section>
  );
};

export default StudentExampleReview;