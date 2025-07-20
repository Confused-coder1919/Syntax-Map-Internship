import React from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon as SearchIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  EnvelopeIcon as MailIcon,
} from "@heroicons/react/24/outline";

import { Link } from "react-router-dom";

const HelpCenter = () => {
  // Animation variants
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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Help categories
  const helpCategories = [
    {
      title: "Getting Started",
      description: "New to SyntaxMap? Learn the basics here.",
      icon: <DocumentTextIcon className="h-8 w-8 text-orange-500" />,
      link: "#getting-started",
      topics: ["Creating your account", "Navigating the dashboard", "Understanding tense maps"]
    },
    {
      title: "Features & Tools",
      description: "Discover all the learning tools available to you.",
      icon: <QuestionMarkCircleIcon className="h-8 w-8 text-blue-500" />,
      link: "#features",
      topics: ["Interactive quizzes", "Notepad feature", "Progress tracking"]
    },
    {
      title: "Troubleshooting",
      description: "Solutions to common issues and questions.",
      icon: <DocumentTextIcon className="h-8 w-8 text-emerald-500" />,
      link: "#troubleshooting",
      topics: ["Login problems", "Quiz submission errors", "Loading issues"]
    },
    {
      title: "Contact Support",
      description: "Can't find what you need? Contact our support team.",
      icon: <MailIcon className="h-8 w-8 text-purple-500" />,
      link: "/contact",
      topics: ["Email support", "Live chat", "Bug reports"]
    }
  ];

  // Common questions
  const commonQuestions = [
    {
      question: "How do I reset my password?",
      answer: "Go to the login page and click on 'Forgot password?'. Enter your email address and follow the instructions sent to your inbox."
    },
    {
      question: "How do tense maps work?",
      answer: "Tense maps are interactive visualizations that show the relationships between different verb tenses. Click on any tense to see examples, explanations, and usage guidelines."
    },
    {
      question: "Can I track my learning progress?",
      answer: "Yes! SyntaxMap provides detailed progress tracking in your dashboard. You can see completed quizzes, mastery levels for different tenses, and suggested areas for improvement."
    },
    {
      question: "How do I report a technical issue?",
      answer: "Visit our Contact Us page and select 'Report a Problem' from the dropdown menu. Please provide as much detail as possible about the issue you're experiencing."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to your questions and learn how to make the most of SyntaxMap
          </p>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Search for help articles, topics, or questions..."
              />
              <button className="absolute inset-y-0 right-0 px-4 bg-orange-500 text-white font-medium rounded-r-lg hover:bg-orange-600 transition-colors duration-200">
                Search
              </button>
            </div>
          </div>
        </motion.div>

        {/* Help Categories */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {helpCategories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <div className="mb-4">{category.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{category.title}</h3>
              <p className="text-gray-600 mb-4">{category.description}</p>
              <ul className="space-y-2 mb-4">
                {category.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-orange-500 mr-2">•</span>
                    <span className="text-gray-700">{topic}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={category.link}
                className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium"
              >
                Learn more
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Common Questions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {commonQuestions.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-gray-200 pb-5"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              View All FAQs
            </Link>
          </div>
        </div>

        {/* Help Resources */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-xl text-white p-8 shadow-lg">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
              <p className="text-orange-50 mb-4 md:mb-0">
                Our support team is ready to assist you. Reach out to us and we'll get back to you as soon as possible.
              </p>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-3 border border-white rounded-md shadow-sm text-base font-medium text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;