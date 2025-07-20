import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as SearchIcon } from "@heroicons/react/24/outline";


const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openQuestions, setOpenQuestions] = useState({});

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // FAQ categories
  const categories = [
    { id: "all", name: "All Questions" },
    { id: "account", name: "Account & Billing" },
    { id: "features", name: "Features & Usage" },
    { id: "technical", name: "Technical Support" },
    { id: "learning", name: "Learning Progress" },
    { id: "privacy", name: "Privacy & Security" },
  ];

  // FAQ questions
  const questions = [
    {
      id: 1,
      category: "account",
      question: "How do I create an account?",
      answer: "Creating an account is easy! Click the 'Sign Up' button in the top right corner of our homepage. You can create an account using your email address or sign up with Google or Apple. After confirming your email, you'll be able to access all our features."
    },
    {
      id: 2,
      category: "account",
      question: "What are the different subscription plans?",
      answer: "SyntaxMap offers three subscription tiers: Free, Premium ($9.99/month), and Education ($4.99/month for students). The Free plan gives you access to basic grammar maps and limited exercises. Premium includes all language features, unlimited practice exercises, progress tracking, and personalized learning paths. The Education plan has the same features as Premium but at a discounted rate for verified students."
    },
    {
      id: 3,
      category: "account",
      question: "How do I change my password?",
      answer: "To change your password, log into your account and go to Settings > Security. Click on 'Change Password' and follow the prompts. You'll need to enter your current password once and your new password twice to confirm."
    },
    {
      id: 4,
      category: "account",
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. Go to Settings > Subscription and click 'Cancel Subscription'. Your account will remain active until the end of your current billing period, after which it will revert to the free plan. We don't offer partial refunds for unused subscription time."
    },
    {
      id: 5,
      category: "features",
      question: "What makes SyntaxMap different from other language learning apps?",
      answer: "SyntaxMap focuses specifically on making grammar visual and intuitive. Unlike many language apps that teach phrases by repetition, we use interactive visual maps to show how different tenses and grammatical features connect to each other. This approach helps learners understand the underlying structure of language, making it easier to form correct sentences intuitively."
    },
    {
      id: 6,
      category: "features",
      question: "Which languages are supported?",
      answer: "Currently, SyntaxMap focuses on English grammar, with comprehensive coverage of all tenses, conditionals, and grammatical structures. We're actively developing Spanish, French, and German modules, which should be available by the end of 2025. Our roadmap includes expanding to 8 languages by 2027."
    },
    {
      id: 7,
      category: "features",
      question: "How do I track my progress?",
      answer: "Premium users can access detailed progress tracking through the Dashboard. You can view your learning streak, mastery level for different grammar concepts, accuracy rates, and personalized recommendations for improvement. The system automatically identifies areas where you struggle and suggests targeted exercises."
    },
    {
      id: 8,
      category: "technical",
      question: "Can I use SyntaxMap offline?",
      answer: "Yes, our mobile apps for iOS and Android support offline mode. You can download specific grammar modules and practice exercises to use without an internet connection. Your progress will sync with our servers the next time you're online."
    },
    {
      id: 9,
      category: "technical",
      question: "Which browsers and devices are supported?",
      answer: "SyntaxMap works on all modern browsers including Chrome, Firefox, Safari, and Edge. We have native apps for iOS and Android devices. The platform is responsive and works on desktops, laptops, tablets, and smartphones. For optimal experience, we recommend using the latest version of your browser or our mobile apps."
    },
    {
      id: 10,
      category: "technical",
      question: "What should I do if I encounter a bug?",
      answer: "If you encounter any issues, please report them through Settings > Report a Bug or email our support team at support@syntaxmap.com. Include details about what you were doing when the issue occurred, your device, browser, and any error messages you received. Screenshots are also helpful. Our team typically addresses critical bugs within 24-48 hours."
    },
    {
      id: 11,
      category: "learning",
      question: "How much time should I spend practicing each day?",
      answer: "We recommend at least 15-20 minutes of practice daily for steady progress. Consistency is more important than session length – regular short sessions are more effective than occasional long ones. Our system is designed to optimize learning in short bursts, with each exercise session targeting specific grammar concepts."
    },
    {
      id: 12,
      category: "learning",
      question: "Can I reset my progress for a specific module?",
      answer: "Yes, you can reset progress for individual grammar modules. Go to the module you want to reset, click the three dots in the top right corner, and select 'Reset Progress'. This will clear your completion status and mastery level for that module only, allowing you to start fresh."
    },
    {
      id: 13,
      category: "learning",
      question: "Do you offer certificates for completed courses?",
      answer: "Yes, Premium users receive completion certificates for each major grammar section they master. These certificates can be downloaded as PDFs and include details about the specific grammar concepts you've mastered. While not formally accredited, many students include these certificates in language learning portfolios."
    },
    {
      id: 14,
      category: "privacy",
      question: "How is my personal information protected?",
      answer: "We take data privacy seriously. All personal information is encrypted both in transit and at rest. We only collect data necessary to provide our service and improve your learning experience. You can review our full Privacy Policy for detailed information about how we collect, use, and protect your data."
    },
    {
      id: 15,
      category: "privacy",
      question: "Can I delete my account and all associated data?",
      answer: "Yes, you have the right to delete your account and associated data. Go to Settings > Privacy & Data > Delete My Account. After confirming, all your personal information will be permanently deleted from our systems within 30 days, in accordance with data protection regulations. This action cannot be undone."
    },
    {
      id: 16,
      category: "privacy",
      question: "Do you share my learning data with third parties?",
      answer: "We never sell your personal data to third parties. For users who access SyntaxMap through an educational institution, we may share progress data with authorized representatives of that institution. Our analytics tools use anonymized, aggregated data to improve our service. You can adjust data sharing preferences in Settings > Privacy & Data."
    },
  ];

  // Filter questions based on search query and active category
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch = searchQuery === "" ||
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = activeCategory === "all" || question.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Group questions by category for display when no search is active
  const groupedQuestions = {};
  categories.forEach(category => {
    if (category.id !== "all") {
      groupedQuestions[category.id] = questions.filter(q => q.category === category.id);
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8" >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to the most common questions about SyntaxMap. Can't find what you're looking for?
            <Link to="/contact" className="text-orange-600 hover:text-orange-800 ml-1">Contact our support team</Link>.
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
              placeholder="Search for questions or keywords..."
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className=" mb-8 overflow-x-auto" >
          <div className="flex space-x-4 py-2 px-1" style={{alignItems: "center", justifyContent: "center"}}>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${activeCategory === category.id
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          {/* When search is active or specific category is selected */}
          {(searchQuery || activeCategory !== "all") ? (
            <motion.div
              className="space-y-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((faq) => (
                  <motion.div
                    key={faq.id}
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => toggleQuestion(faq.id)}
                      className="flex justify-between items-center w-full px-6 py-4 text-left"
                    >
                      <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                      <ChevronDownIcon
                        className={`h-5 w-5 text-orange-500 transition-transform duration-200 ${openQuestions[faq.id] ? 'transform rotate-180' : ''}`}
                      />
                    </button>
                    {openQuestions[faq.id] && (
                      <div className="px-6 pb-4">
                        <div className="prose prose-orange max-w-none">
                          <p>{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <p className="text-xl text-gray-600">No questions found for "{searchQuery}"</p>
                  <p className="mt-2 text-gray-500">Try different keywords or browse by category</p>
                </div>
              )}
            </motion.div>
          ) : (
            // When no search or specific category is active, show grouped by category
            <div>
              {Object.entries(groupedQuestions).map(([categoryId, categoryQuestions]) => (
                <div key={categoryId} className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {categories.find(c => c.id === categoryId).name}
                  </h2>
                  <motion.div
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {categoryQuestions.map((faq) => (
                      <motion.div
                        key={faq.id}
                        variants={itemVariants}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(faq.id)}
                          className="flex justify-between items-center w-full px-6 py-4 text-left"
                        >
                          <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-orange-500 transition-transform duration-200 ${openQuestions[faq.id] ? 'transform rotate-180' : ''}`}
                          />
                        </button>
                        {openQuestions[faq.id] && (
                          <div className="px-6 pb-4">
                            <div className="prose prose-orange max-w-none">
                              <p>{faq.answer}</p>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              ))}
            </div>
          )}

          {/* Still Need Help Section */}
          <div className="mt-16 text-center bg-gradient-to-r from-orange-500 to-red-600 rounded-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg opacity-90 mb-6 max-w-xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you with any questions or issues.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/contact"
                className="px-6 py-3 bg-white text-orange-600 rounded-md hover:bg-orange-50 transition-colors duration-200"
              >
                Contact Support
              </Link>
              <Link
                to="/help-center"
                className="px-6 py-3 border border-white text-white rounded-md hover:bg-white/10 transition-colors duration-200"
              >
                Browse Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;