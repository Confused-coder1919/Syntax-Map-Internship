import React from 'react';
import { Link } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { LockClosedIcon, ChartBarIcon, TrophyIcon, BookmarkIcon } from '@heroicons/react/24/outline';

const ProgressPreview = () => {
  // Sample data for progress visualization
  const tenseProgress = [
    { id: 1, name: 'Present Simple', mastery: 80, status: 'active' },
    { id: 2, name: 'Present Continuous', mastery: 65, status: 'active' },
    { id: 3, name: 'Present Perfect', mastery: 0, status: 'locked' },
    { id: 4, name: 'Past Simple', mastery: 45, status: 'active' },
    { id: 5, name: 'Past Continuous', mastery: 0, status: 'locked' },
    { id: 6, name: 'Future Simple', mastery: 0, status: 'locked' }
  ];

  const quizHistory = [
    { id: 1, name: 'Present Simple Quiz', score: 4, total: 5, date: '2 days ago' },
    { id: 2, name: 'Past Simple Quiz', score: 3, total: 5, date: '5 days ago' }
  ];

  const achievements = [
    { id: 1, name: 'First Quiz Completed', icon: '🎯', unlocked: true },
    { id: 2, name: 'Perfect Score', icon: '🏆', unlocked: false },
    { id: 3, name: 'Learn 3 Tenses', icon: '📚', unlocked: false }
  ];

  // Helper function to get color based on mastery level
  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 60) return 'bg-emerald-400';
    if (mastery >= 40) return 'bg-yellow-400';
    if (mastery > 0) return 'bg-orange-400';
    return 'bg-gray-300';
  };

  return (
    <GuestLayout title="Progress Preview">
      <div className="space-y-8">
        {/* Introduction section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-900">Track Your Learning Journey</h2>
          <p className="mt-2 text-sm text-gray-500">
            See a preview of how SyntaxMap helps you track your learning progress.
            When you create an account, you'll be able to track your mastery of each tense,
            view your quiz history, and earn achievements as you learn.
          </p>
        </div>

        {/* Tense mastery section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900">Tense Mastery</h2>
            <span className="text-sm text-gray-500">Demo data</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {tenseProgress.map((tense) => (
              <div
                key={tense.id}
                className={`border rounded-lg p-4 ${tense.status === 'locked' ? 'border-gray-200' : 'border-gray-200 hover:border-indigo-200'}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900">{tense.name}</h3>
                  {tense.status === 'locked' && <LockClosedIcon className="h-4 w-4 text-gray-400" />}
                </div>
                <div className="mt-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Mastery</span>
                    <span className="ml-auto text-sm font-medium text-gray-700">{tense.mastery}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${tense.status === 'locked' ? 'bg-gray-300' : getMasteryColor(tense.mastery)} h-2 rounded-full`}
                      style={{ width: `${tense.mastery}%` }}
                    ></div>
                  </div>
                </div>
                {tense.status === 'locked' ? (
                  <div className="mt-3 text-xs text-center text-gray-500">
                    Create an account to unlock
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-right">
                    <Link to="/register" className="text-indigo-600 hover:text-indigo-800">
                      Practice to improve →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent quiz history */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium text-gray-900">Recent Quiz History</h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              Demo Data
            </span>
          </div>
          <div className="mt-6">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Quiz</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Score</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {quizHistory.map((quiz) => (
                    <tr key={quiz.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{quiz.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="flex items-center">
                          <span className={`inline-block h-2 w-2 rounded-full ${quiz.score / quiz.total >= 0.7 ? 'bg-green-400' : 'bg-orange-400'} mr-2`}></span>
                          <span>{quiz.score}/{quiz.total}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{quiz.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/guest/request-role"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Role request to save your quiz history →
              </Link>
            </div>
          </div>
        </div>

        {/* Progress chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-900">Learning Analytics</h2>
          <p className="mt-2 text-sm text-gray-500">
            Track your progress over time with detailed analytics and insights.
          </p>

          <div className="mt-6 h-64 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Progress Charts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create an account to view your learning progress over time
              </p>
              <Link
                to="/guest/request-role"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Role request to unlock charts
              </Link>
            </div>
          </div>
        </div>

        {/* Achievements section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-medium text-gray-900">Achievements</h2>
          <p className="mt-2 text-sm text-gray-500">
            Earn achievements as you make progress in your learning journey.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`border rounded-lg p-4 flex flex-col items-center ${achievement.unlocked ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 opacity-60'
                  }`}
              >
                <div className="text-3xl">{achievement.icon}</div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">{achievement.name}</h3>
                {achievement.unlocked ? (
                  <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Unlocked
                  </span>
                ) : (
                  <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <LockClosedIcon className="mr-1 h-3 w-3" />
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link
              to="/guest/request-role"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Role Request to earn real achievements →
            </Link>
          </div>
        </div>

        {/* Features comparison */}
        <div className="bg-indigo-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-medium text-white">Unlock Full Progress Tracking</h2>
          <p className="mt-2 text-indigo-200">
            Compare the features available to guest users versus registered users.
          </p>

          <div className="mt-6 bg-white rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Feature</th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Guest</th>
                  <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-indigo-600">Registered User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Save Quiz Results</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Access All Tenses</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Track Progress Over Time</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Earn Achievements</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Unlimited Quiz Attempts</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <XMarkIcon className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50"
            >
              Create Your Free Account
            </Link>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};

// Define the icons here to avoid any missing imports
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default ProgressPreview;