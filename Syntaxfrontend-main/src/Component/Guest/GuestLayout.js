import React from 'react';
import { Link } from 'react-router-dom';
import { LockClosedIcon, QuestionMarkCircleIcon, BookOpenIcon, AcademicCapIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const GuestLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">      {/* Guest header bar with upgrade prompt */}
      <div className="bg-indigo-600 text-white p-2 text-center text-sm">
        <span>You are currently in Guest mode with limited access. </span>
      </div>

      {/* Main content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <Link 
            to="/guest/request-role" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <LockClosedIcon className="mr-2 h-4 w-4" />
            Request Role Upgrade
          </Link>
        </div>

        {/* Guest navigation */}        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6">
            <Link
              to="/guest"
              className="inline-flex items-center px-1 pt-1 pb-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <AcademicCapIcon className="mr-1 h-5 w-5" />
              Home
            </Link>
            <Link
              to="/guest/tenses"
              className="inline-flex items-center px-1 pt-1 pb-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <BookOpenIcon className="mr-1 h-5 w-5" />
              Tense Preview
            </Link>
            <Link
              to="/guest/quizzes"
              className="inline-flex items-center px-1 pt-1 pb-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <QuestionMarkCircleIcon className="mr-1 h-5 w-5" />
              Quiz Preview
            </Link>
            <Link
              to="/guest/progress"
              className="inline-flex items-center px-1 pt-1 pb-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <ChartBarIcon className="mr-1 h-5 w-5" />
              Progress Preview
            </Link>
            <Link
              to="/guest/request-role"
              className="inline-flex items-center px-1 pt-1 pb-2 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <LockClosedIcon className="mr-1 h-5 w-5" />
              Request Role
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <div className="bg-white shadow rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GuestLayout;