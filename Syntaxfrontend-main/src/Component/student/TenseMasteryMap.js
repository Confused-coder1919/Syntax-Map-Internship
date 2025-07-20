import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const TenseMasteryMap = () => {
  const [tenseData, setTenseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenseProgress = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await axios.get('/api/student/tense-progress');
        setTenseData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tense progress:', err);
        setLoading(false);
        
        // For development - mock data
        setTenseData([
          { 
            id: 'present-simple', 
            name: 'Present Simple', 
            category: 'present',
            mastery: 95, 
            quizzesTaken: 4,
            examples: 7
          },
          { 
            id: 'present-continuous', 
            name: 'Present Continuous', 
            category: 'present',
            mastery: 85, 
            quizzesTaken: 3,
            examples: 5
          },
          { 
            id: 'present-perfect', 
            name: 'Present Perfect', 
            category: 'present',
            mastery: 70, 
            quizzesTaken: 2,
            examples: 3
          },
          { 
            id: 'present-perfect-continuous', 
            name: 'Present Perfect Continuous', 
            category: 'present',
            mastery: 50, 
            quizzesTaken: 2,
            examples: 2
          },
          { 
            id: 'past-simple', 
            name: 'Past Simple', 
            category: 'past',
            mastery: 90, 
            quizzesTaken: 3,
            examples: 5
          },
          { 
            id: 'past-continuous', 
            name: 'Past Continuous', 
            category: 'past',
            mastery: 60, 
            quizzesTaken: 2,
            examples: 3
          },
          { 
            id: 'past-perfect', 
            name: 'Past Perfect', 
            category: 'past',
            mastery: 30, 
            quizzesTaken: 1,
            examples: 1
          },
          { 
            id: 'past-perfect-continuous', 
            name: 'Past Perfect Continuous', 
            category: 'past',
            mastery: 15, 
            quizzesTaken: 1,
            examples: 0
          },
          { 
            id: 'future-simple', 
            name: 'Future Simple', 
            category: 'future',
            mastery: 80, 
            quizzesTaken: 2,
            examples: 4
          },
          { 
            id: 'future-continuous', 
            name: 'Future Continuous', 
            category: 'future',
            mastery: 40, 
            quizzesTaken: 1,
            examples: 2
          },
          { 
            id: 'future-perfect', 
            name: 'Future Perfect', 
            category: 'future',
            mastery: 10, 
            quizzesTaken: 0,
            examples: 0
          },
          { 
            id: 'future-perfect-continuous', 
            name: 'Future Perfect Continuous', 
            category: 'future',
            mastery: 0, 
            quizzesTaken: 0,
            examples: 0
          }
        ]);
      }
    };
    
    fetchTenseProgress();
  }, []);

  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return 'bg-green-500';
    if (mastery >= 50) return 'bg-yellow-500';
    if (mastery >= 20) return 'bg-orange-400';
    if (mastery > 0) return 'bg-red-400';
    return 'bg-gray-300';
  };

  const categories = [
    { id: 'present', name: 'Present' },
    { id: 'past', name: 'Past' },
    { id: 'future', name: 'Future' }
  ];
  
  const forms = [
    { id: 'simple', name: 'Simple' },
    { id: 'continuous', name: 'Continuous' },
    { id: 'perfect', name: 'Perfect' },
    { id: 'perfect-continuous', name: 'Perfect Continuous' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse w-full max-w-2xl h-48 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        <div className="grid grid-cols-5 gap-2 text-xs font-medium">
          {/* Header Row */}
          <div className="col-span-1"></div>
          {forms.map((form) => (
            <div key={form.id} className="text-center py-2 font-semibold text-gray-600">
              {form.name}
            </div>
          ))}

          {/* Tense Rows */}
          {categories.map((category) => (
            <React.Fragment key={category.id}>
              {/* Category Header */}
              <div className="col-span-1 flex items-center font-bold text-gray-700 py-2">
                {category.name}
              </div>

              {/* Tense Cells */}
              {forms.map((form) => {
                const tenseId = `${category.id}-${form.id}`;
                const tense = tenseData.find(t => t.id === tenseId) || { 
                  id: tenseId, 
                  name: `${category.name} ${form.name}`, 
                  mastery: 0,
                  quizzesTaken: 0,
                  examples: 0
                };
                
                return (
                  <motion.div
                    key={tenseId}
                    className="p-1"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      to={`/tense/${tenseId}`}
                      className={`block relative rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 ${getMasteryColor(tense.mastery)} h-full`}
                    >
                      <div className="text-white text-center">
                        <div className="font-medium mb-2 line-clamp-2 h-10">
                          {tense.name}
                        </div>
                        <div className="text-xs opacity-90 mb-1">
                          Mastery: {tense.mastery}%
                        </div>
                        <div className="text-xs opacity-80 space-x-1">
                          <span>{tense.quizzesTaken} {tense.quizzesTaken === 1 ? 'quiz' : 'quizzes'}</span>
                          <span>•</span>
                          <span>{tense.examples} {tense.examples === 1 ? 'example' : 'examples'}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TenseMasteryMap;