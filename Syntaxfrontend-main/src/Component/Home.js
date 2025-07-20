import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapIcon, 
  PencilSquareIcon, 
  AcademicCapIcon, 
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  LightBulbIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import { ChartBarIcon } from "@heroicons/react/24/solid";
import logo from "../img/LC-1.jpg";
import { Section, Button, Card } from "./UI";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(4); // Default to guest (4)
  const [userName, setUserName] = useState("");
  // Removed unused currentYear variable
  const currentDate = "May 5, 2025"; // Updated current date
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("jstoken");
    setIsLoggedIn(!!token);
    
    // Get user role (1=admin, 2=teacher, 3=student, 4=guest)
    const role = parseInt(localStorage.getItem("user_role")) || 4;
    setUserRole(role);
    
    // Get user name if logged in
    if (token) {
      const name = localStorage.getItem("user_name");
      setUserName(name || "");
    }
  }, []);

  // Check if user is admin or teacher
  const isAdminOrTeacher = userRole === 1 || userRole === 2;
  const isStudent = userRole === 3;

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
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Feature items data
  const features = [
    {
      title: "Interactive Tense Maps",
      description: "Visualize and understand verb tenses with our interactive maps. See how they relate to each other and when to use them.",
      icon: <MapIcon className="w-6 h-6" />,
      color: "bg-gradient-to-br from-orange-400 to-red-500",
      link: "/tensemap",
      linkText: "Explore Tense Maps"
    },
    {
      title: "Practice with Quizzes",
      description: "Test your knowledge with our comprehensive quizzes. Track your progress and identify areas for improvement.",
      icon: <DocumentTextIcon className="w-6 h-6" />,
      color: "bg-gradient-to-br from-blue-400 to-indigo-500",
      link: "/quiz",
      linkText: "Take a Quiz"
    },
    {
      title: "Personal Notepad",
      description: "Keep track of your learning journey with our notepad feature. Save important grammar rules and examples.",
      icon: <PencilSquareIcon className="w-6 h-6" />,
      color: "bg-gradient-to-br from-emerald-400 to-green-500",
      link: "/notepad",
      linkText: "Open Notepad"
    }
  ];

  // Benefits items data
  const benefits = [
    { text: "Master English grammar with visual learning", icon: <CheckCircleIcon className="w-5 h-5 text-emerald-500" /> },
    { text: "Track your progress with detailed analytics", icon: <ChartBarIcon className="w-5 h-5 text-emerald-500" /> },
    { text: "Learn at your own pace, anytime, anywhere", icon: <ClockIcon className="w-5 h-5 text-emerald-500" /> },
    { text: "Get instant feedback on your practice", icon: <ChatBubbleLeftRightIcon className="w-5 h-5 text-emerald-500" /> },
    { text: "Access our new AI grammar assistant", icon: <LightBulbIcon className="w-5 h-5 text-emerald-500" /> }
  ];
  
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <Section className="pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center">
            <motion.div 
              className="w-full lg:w-1/2 px-4 mb-12 lg:mb-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {isLoggedIn && (
                <div className="mb-6 bg-orange-100 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold text-orange-800">
                    Welcome back, {userName || "Learner"}!
                  </h2>
                  <p className="text-orange-700">Today is {currentDate}</p>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">Master English</span> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">Grammar</span>
                <span className="block mt-2 text-3xl md:text-4xl lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">with Confidence</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8 max-w-xl">
                Your interactive platform for mastering English grammar and syntax.
                Visualize tenses, practice with quizzes, and track your progress.
              </p>
              
              <div className="mb-8 space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                  >
                    <span className="mr-3">{benefit.icon}</span>
                    <span className="text-gray-700">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
              
              {!isLoggedIn ? (
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="px-8 py-3 text-base font-medium"
                    to="/login_register"
                  >
                    Get Started <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-base font-medium"
                    to="/tensemap"
                  >
                    Explore Maps <MapIcon className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="primary" 
                  size="lg"
                  className="px-8 py-3 text-base font-medium"
                  to={isStudent ? "/dashboard" : "/professor"}
                >
                  Go to Dashboard <ChevronRightIcon className="w-5 h-5 ml-2" />
                </Button>
              )}
            </motion.div>
            
            <motion.div 
              className="w-full lg:w-1/2 px-4 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <img 
                  src={logo} 
                  alt="SyntaxMap Logo" 
                  className="relative h-64 md:h-80 rounded-full shadow-2xl border-4 border-white object-cover" 
                />
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* Features Section */}
      <Section className="py-20 bg-white" variant="white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Features that <span className="text-orange-600">Accelerate</span> Your Learning
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform provides powerful tools and resources to help you master English grammar 
              efficiently and effectively.
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card 
                  className="h-full hover:shadow-xl transition-shadow duration-300"
                  hoverEffect="lift"
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className={`${feature.color} text-white p-3 rounded-lg w-14 h-14 flex items-center justify-center mb-5 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 flex-grow">{feature.description}</p>
                    <Link 
                      to={feature.link} 
                      className="mt-auto inline-flex items-center text-orange-600 hover:text-orange-800 font-medium"
                    >
                      {feature.linkText}
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* Teacher Resources Section (conditional) */}
      {/* {isLoggedIn && isAdminOrTeacher && (
        <Section className="py-20 bg-gray-50" variant="gray">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Teacher <span className="text-orange-600">Resources</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Powerful tools designed specifically for educators to manage courses, 
                track student progress, and create engaging learning experiences.
              </p>
            </div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {teacherResources.map((resource, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Link to={resource.link} className="block h-full">
                    <Card 
                      className="h-full hover:shadow-xl transition-shadow duration-300 hover:border-orange-300"
                      hoverEffect="lift"
                    >
                      <div className="p-6 flex flex-col h-full">
                        <div className="text-orange-600 mb-4">
                          {resource.icon}
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-gray-900">{resource.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 flex-grow">{resource.description}</p>
                        <span className="mt-auto inline-flex items-center text-orange-600 text-sm font-medium">
                          Learn more
                          <ChevronRightIcon className="w-4 h-4 ml-1" />
                        </span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </Section>
      )} */}

      {/* Call to Action Section */}
      <Section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:py-16 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center">
              <div className="md:w-2/3 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to improve your English grammar?
                </h2>
                <p className="text-white text-opacity-90 text-lg mb-0 max-w-2xl">
                  Join thousands of students who have already enhanced their language skills with SyntaxMap.
                </p>
              </div>
              <div className="md:w-1/3 text-center md:text-right">
                <Button 
                  variant="white" 
                  size="lg"
                  className="px-8 py-3 font-medium"
                  to={isLoggedIn ? (isStudent ? "/dashboard" : "/professor") : "/login_register"}
                >
                  {isLoggedIn ? "Go to Dashboard" : "Get Started Today"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Home;