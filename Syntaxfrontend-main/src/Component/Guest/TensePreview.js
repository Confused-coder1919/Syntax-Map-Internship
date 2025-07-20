import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GuestLayout from './GuestLayout';
import { LockClosedIcon, BookOpenIcon, EyeIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

// Import SVG component for tense map if available in the project
import TenseMapSVG from '../SVGs/TenseMapSVG';

const TensePreview = () => {
  const [selectedTense, setSelectedTense] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Sample tense data (in a real app, this would come from the API)
  const tenses = [
    {
      id: 1,
      name: 'Present Simple',
      description: 'Used for habits, facts, general truths, and scheduled events',
      form: 'Subject + base verb (+ s/es for third person singular)',
      examples: [
        { type: 'Affirmative', sentence: 'She works in a bank.' },
        { type: 'Negative', sentence: 'They do not (don\'t) play tennis.' },
        { type: 'Interrogative', sentence: 'Do you speak English?' }
      ],
      useCases: [
        'Facts and general truths: Water boils at 100°C.',
        'Habits and routines: I usually go to bed at 10 PM.',
        'Fixed arrangements: The train leaves at 6 PM tomorrow.'
      ],
      locked: false
    },
    {
      id: 2,
      name: 'Present Continuous',
      description: 'Used for actions happening now or temporary situations',
      form: 'Subject + am/is/are + verb-ing',
      examples: [
        { type: 'Affirmative', sentence: 'I am studying for my exam.' },
        { type: 'Negative', sentence: 'She is not (isn\'t) working today.' },
        { type: 'Interrogative', sentence: 'Are they waiting for us?' }
      ],
      useCases: [
        'Actions happening now: Look! It is raining.',
        'Temporary situations: I\'m staying with friends until I find an apartment.',
        'Future arrangements: We\'re having dinner with friends tonight.'
      ],
      locked: false
    },
    {
      id: 3,
      name: 'Present Perfect',
      description: 'Used for past actions with present relevance or unfinished time periods',
      form: 'Subject + have/has + past participle',
      examples: [
        { type: 'Affirmative', sentence: 'I have visited Paris three times.' },
        { type: 'Negative', sentence: 'She has not (hasn\'t) finished her homework.' },
        { type: 'Interrogative', sentence: 'Have you ever seen a ghost?' }
      ],
      useCases: [
        'Experiences: I have traveled to many countries.',
        'Recent actions: She has just arrived.',
        'Unfinished time periods: I haven\'t eaten anything today.'
      ],
      locked: true
    },
    {
      id: 4,
      name: 'Past Simple',
      description: 'Used for completed actions in the past',
      form: 'Subject + past tense verb',
      examples: [
        { type: 'Affirmative', sentence: 'She visited her grandparents last weekend.' },
        { type: 'Negative', sentence: 'I did not (didn\'t) see the movie.' },
        { type: 'Interrogative', sentence: 'Did they arrive on time?' }
      ],
      useCases: [
        'Completed past actions: I graduated in 2015.',
        'Series of completed actions: I got up, had breakfast and went to work.',
        'States in the past: She was happy in her old job.'
      ],
      locked: false
    },
    {
      id: 5,
      name: 'Future Simple',
      description: 'Used for future predictions, spontaneous decisions, and promises',
      form: 'Subject + will + base verb',
      examples: [
        { type: 'Affirmative', sentence: 'The weather will be nice tomorrow.' },
        { type: 'Negative', sentence: 'She will not (won\'t) attend the meeting.' },
        { type: 'Interrogative', sentence: 'Will you help me with this?' }
      ],
      useCases: [
        'Predictions: I think it will rain later.',
        'Spontaneous decisions: I\'ll have the chicken, please.',
        'Promises: I\'ll call you when I arrive.'
      ],
      locked: true
    }
  ];

  const handleTenseSelection = (tense) => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setSelectedTense(tense);
      setLoading(false);
    }, 500);
  };

  return (
    <GuestLayout title="Tense Preview">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left sidebar with tense list */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tenses.map((tense) => (
                <li key={tense.id}>
                  <button
                    onClick={() => handleTenseSelection(tense)}
                    className={`w-full px-4 py-4 flex items-center hover:bg-gray-50 focus:outline-none ${
                      selectedTense?.id === tense.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className={`text-sm font-medium ${selectedTense?.id === tense.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                          {tense.name}
                        </p>
                        {tense.locked && (
                          <LockClosedIcon className="ml-2 h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 truncate">{tense.description}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <EyeIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Limited Preview</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    As a guest, you can access 3 out of 12 tenses. Sign up for access to all tenses, quizzes, and progress tracking.
                  </p>
                  <Link
                    to="/register"
                    className="block mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                  >
                    Create an account →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right content area */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900">English Tense Map</h3>
            <div className="mt-2 p-4 border border-gray-200 rounded-lg bg-white">
              {/* SVG Tense Map - we include it here and it could be clickable in a real implementation */}
              <div className="w-full h-64 flex items-center justify-center">
                <TenseMapSVG />
              </div>
              <div className="mt-4 text-sm text-gray-500 text-center">
                Interactive map showing relationships between English tenses
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700"></div>
            </div>
          ) : selectedTense ? (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedTense.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {selectedTense.description}
                  </p>
                </div>
                {selectedTense.locked && (
                  <div className="bg-gray-100 rounded-md px-3 py-2 flex items-center">
                    <LockClosedIcon className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-xs font-medium text-gray-500">Full access with account</span>
                  </div>
                )}
              </div>
              
              {!selectedTense.locked ? (
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Form</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {selectedTense.form}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Examples</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="space-y-2">
                          {selectedTense.examples.map((example, index) => (
                            <li key={index}>
                              <span className="font-medium text-indigo-600">{example.type}: </span>
                              {example.sentence}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Use Cases</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                          {selectedTense.useCases.map((useCase, index) => (
                            <li key={index} className="pl-3 pr-4 py-3 flex items-center text-sm">
                              {useCase}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="p-12 flex flex-col items-center">
                  <div className="rounded-full bg-gray-100 p-4">
                    <LockClosedIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Content Locked</h3>
                  <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
                    This tense is only available to registered users. Create a free account to access all tenses, examples, and practice exercises.
                  </p>
                  <Link
                    to="/register"
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Sign Up to Unlock
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Select a tense
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a tense from the list to see its details.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </GuestLayout>
  );
};

export default TensePreview;