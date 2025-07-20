import React from "react";
import { motion } from "framer-motion";
import { 
  LightBulbIcon, 
  SparklesIcon, 
  UserGroupIcon, 
  GlobeAltIcon 
} from "@heroicons/react/outline";

const AboutUs = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
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

  // Team members data
  const teamMembers = [
    {
      name: "Emily Chen",
      role: "Founder & CEO",
      bio: "Former linguistics professor with a passion for making language learning accessible to everyone.",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      name: "Michael Rodriguez",
      role: "Chief Technology Officer",
      bio: "Tech innovator with 15 years of experience in educational software and AI-powered learning systems.",
      image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      name: "Sarah Johnson",
      role: "Chief Learning Officer",
      bio: "Educational psychologist specializing in language acquisition and innovative teaching methodologies.",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    },
    {
      name: "David Kim",
      role: "Head of Product",
      bio: "Product designer with expertise in creating intuitive and engaging user experiences for education.",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
    }
  ];

  // Company values
  const companyValues = [
    {
      title: "Innovation",
      description: "We constantly push the boundaries of what's possible in language education, using cutting-edge technology to create better learning experiences.",
      icon: <SparklesIcon className="h-8 w-8 text-orange-500" />
    },
    {
      title: "Accessibility",
      description: "We believe quality language education should be available to everyone, regardless of background, location, or financial resources.",
      icon: <GlobeAltIcon className="h-8 w-8 text-blue-500" />
    },
    {
      title: "Scientific Approach",
      description: "All our learning methods are grounded in linguistic research and cognitive science to ensure effective knowledge retention.",
      icon: <LightBulbIcon className="h-8 w-8 text-emerald-500" />
    },
    {
      title: "Community",
      description: "We foster a supportive community of learners and educators who help each other grow and succeed in language mastery.",
      icon: <UserGroupIcon className="h-8 w-8 text-purple-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About SyntaxMap</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transforming language learning through visualization and interactive technology
          </p>
        </motion.div>

        {/* Our Story */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2 pr-0 lg:pr-12 mb-8 lg:mb-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-gray-600 mb-4">
                SyntaxMap began in 2020 when our founder, Emily Chen, a linguistics professor, noticed that students consistently struggled with visualizing grammar concepts, particularly verb tenses and their relationships.
              </p>
              <p className="text-gray-600 mb-4">
                Recognizing this gap in language education, Emily teamed up with technologists and educators to create a platform that would transform abstract grammar concepts into interactive visual maps that students could explore and understand intuitively.
              </p>
              <p className="text-gray-600">
                Today, SyntaxMap has grown into a comprehensive language learning platform used by students, teachers, and language enthusiasts worldwide. Our mission remains the same: to make grammar learning visual, interactive, and accessible to everyone.
              </p>
            </div>
            <div className="lg:w-1/2">
              <img 
                src="/images/about-us.jpg" 
                alt="Team working together" 
                className="rounded-lg shadow-md w-full h-auto object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Our Mission and Vision */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-orange-50">
                To revolutionize language learning by transforming abstract grammar concepts into intuitive visual experiences that accelerate comprehension and retention for learners worldwide.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-md p-8">
              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-blue-50">
                A world where language barriers are diminished through effective, accessible, and engaging educational technology that empowers people to communicate confidently across cultures.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Our Values */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {companyValues.map((value, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Team */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover object-center"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
                  <p className="text-orange-600 mb-3">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Join Our Team CTA */}
        <motion.div 
          className="bg-gray-900 rounded-xl text-white p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
              <p className="text-gray-300 mb-6 md:mb-0">
                We're always looking for passionate individuals who want to make a difference in the world of language education. Check out our open positions and become part of our mission.
              </p>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
              <a 
                href="/careers" 
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                View Open Positions
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;