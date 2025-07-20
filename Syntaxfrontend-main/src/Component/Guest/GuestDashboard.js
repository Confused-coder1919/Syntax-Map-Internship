import React from 'react';
import { Link } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { ClockIcon, BookOpenIcon, AcademicCapIcon, LightBulbIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const GuestDashboard = () => {
  // Sample tense categories for preview
  const tenseSamples = [
    { id: 1, name: 'Present Simple', description: 'Used for habits, facts, and general truths' },
    { id: 2, name: 'Past Simple', description: 'Used for completed actions in the past' },
    { id: 3, name: 'Future Simple', description: 'Used for predictions and spontaneous decisions' },
  ];

  return (
    <GuestLayout title="Welcome to SyntaxMap">
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Explore English Tenses</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
            SyntaxMap helps you master English grammar through interactive maps, 
            detailed explanations, and personalized quizzes. This guest preview 
            shows some of our features.
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-lg font-medium text-gray-900">Interactive Tense Map</dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Explore our interactive visualization of English tenses, with clear explanations and examples.
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/guest/tenses" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                  Explore tenses
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-lg font-medium text-gray-900">Practice Quizzes</dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Test your knowledge with our customizable quizzes for each tense and track your results.
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/guest/quizzes" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                  Try a quiz
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LightBulbIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-lg font-medium text-gray-900">Learning Progress</dt>
                    <dd className="mt-2 text-base text-gray-500">
                      See how progress tracking works with visual indicators and performance analytics.
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/guest/progress" className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center">
                  View progress demo
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick tense preview */}
        <div className="mt-10">
          <h3 className="text-lg font-medium text-gray-900">Popular Tenses</h3>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {tenseSamples.map((tense) => (
              <div 
                key={tense.id} 
                className="bg-white px-4 py-5 border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-base font-medium text-indigo-600">{tense.name}</div>
                <div className="mt-2 text-sm text-gray-500">{tense.description}</div>
                <div className="mt-3">
                  <Link to={`/guest/tenses/${tense.id}`} className="text-sm text-indigo-600 hover:text-indigo-500">
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

export default GuestDashboard;