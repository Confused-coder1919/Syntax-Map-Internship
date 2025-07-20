import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { useParams } from "react-router-dom";

const TensePractice = () => {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { tenseId } = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/quiz`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        const data = await res.json();
        const filtered = data?.data?.find((quiz) => quiz.tense_id === tenseId);
        setQuestions(filtered?.questions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [tenseId]);

  const handleOptionChange = (questionKey, selectedOption) => {
    setUserAnswers((prev) => ({ ...prev, [questionKey]: selectedOption }));
  };

  const checkAnswer = (questionKey) => {
    setShowFeedback((prev) => ({ ...prev, [questionKey]: true }));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Tense Practice</h2>

      {loading && <p>Loading questions...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && questions.length === 0 && (
        <p>No questions available.</p>
      )}

      {!loading && !error && questions.length > 0 && (
        <div className="space-y-6">
          {questions.map((q, index) => {
            const questionKey = q.id || index;
            const isChecked = showFeedback[questionKey];
            const selected = userAnswers[questionKey];

            return (
              <div
                key={q.id}
                className="border border-gray-200 p-4 rounded-md shadow-sm"
              >
                <p className="font-medium text-gray-800 mb-2">
                  {index + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((option, i) => (
                    <label
                      key={i}
                      className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700"
                    >
                      <input
                        type="radio"
                        name={`question-${questionKey}`}
                        value={option}
                        checked={selected === option}
                        onChange={() => handleOptionChange(questionKey, option)}
                      />

                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-orange-500 text-white p-1 rounded text-sm mt-2"
                    onClick={() => checkAnswer(questionKey)}
                  >
                    Check Answer
                  </button>
                </div>

                {isChecked && (
                  <div className="mt-2 text-sm">
                    {selected === q.correct_answer ? (
                      <span className="text-green-600 font-medium">
                        ✅ Correct
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        ❌ Incorrect. Correct answer:{" "}
                        <span className="underline">{q.correct_answer}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TensePractice;
