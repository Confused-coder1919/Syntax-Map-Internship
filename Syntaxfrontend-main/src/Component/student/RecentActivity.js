import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  PencilSquareIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const RecentActivity = ({ activities = [] }) => {
  if (!activities.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activities to display. Start learning to see your progress here!
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz':
        return <ClipboardDocumentListIcon className="h-6 w-6 text-green-500" />;
      case 'tense':
        return <AcademicCapIcon className="h-6 w-6 text-blue-500" />;
      case 'vocab':
        return <DocumentTextIcon className="h-6 w-6 text-purple-500" />;
      case 'example':
        return <PencilSquareIcon className="h-6 w-6 text-amber-500" />;
      default:
        return <AcademicCapIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getActivityLink = (activity) => {
    switch (activity.type) {
      case 'quiz':
        return `/student/quizzes/${activity.id}`;
      case 'tense':
        return `/tense/${activity.id}`;
      case 'vocab':
        return `/student/notepad/vocabulary`;
      case 'example':
        return `/student/notepad/examples`;
      default:
        return '#';
    }
  };
  
  const getActivityContent = (activity) => {
    switch (activity.type) {
      case 'quiz':
        return (
          <>
            <div className="font-medium">{activity.name}</div>
            <div className="text-sm text-gray-600">
              Score: {activity.score}%
            </div>
          </>
        );
      case 'tense':
        return (
          <>
            <div className="font-medium">Studied {activity.name}</div>
            <div className="text-sm text-gray-600">
              {activity.completed ? 'Completed' : 'In progress'}
            </div>
          </>
        );
      case 'vocab':
      case 'example':
      default:
        return (
          <div className="font-medium">{activity.name}</div>
        );
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <motion.div
      className="space-y-3"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {activities.map((activity, index) => (
        <motion.div 
          key={activity.id || index}
          variants={itemVariants}
          className="flex space-x-4"
        >
          {/* Activity Icon */}
          <div className="flex-shrink-0">
            <div className="bg-gray-100 rounded-full p-2">
              {getActivityIcon(activity.type)}
            </div>
          </div>
          
          {/* Activity Content */}
          <div className="flex-1">
            <Link 
              to={getActivityLink(activity)}
              className="block p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              {getActivityContent(activity)}
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(activity.date)}
              </div>
            </Link>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default RecentActivity;