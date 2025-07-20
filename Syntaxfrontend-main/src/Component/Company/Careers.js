import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BriefcaseIcon, 
  GlobeIcon, 
  HeartIcon, 
  AcademicCapIcon, 
  LightBulbIcon,
  ChipIcon
} from "@heroicons/react/outline";

const Careers = () => {
  // State to track selected department filter
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
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

  // Benefits data
  const benefits = [
    {
      icon: <GlobeIcon className="h-8 w-8 text-orange-500" />,
      title: "Remote-First Culture",
      description: "Work from anywhere in the world with our fully distributed team and flexible hours."
    },
    {
      icon: <HeartIcon className="h-8 w-8 text-orange-500" />,
      title: "Comprehensive Healthcare",
      description: "Full medical, dental, and vision coverage for you and your dependents."
    },
    {
      icon: <AcademicCapIcon className="h-8 w-8 text-orange-500" />,
      title: "Learning & Development",
      description: "Annual learning stipend and dedicated time for professional growth."
    },
    {
      icon: <LightBulbIcon className="h-8 w-8 text-orange-500" />,
      title: "Innovation Time",
      description: "10% of your time dedicated to exploring new ideas and personal projects."
    },
    {
      icon: <BriefcaseIcon className="h-8 w-8 text-orange-500" />,
      title: "Unlimited PTO",
      description: "Take the time you need to rest, recharge, and maintain work-life balance."
    },
    {
      icon: <ChipIcon className="h-8 w-8 text-orange-500" />,
      title: "Top-Tier Equipment",
      description: "We provide all the tech tools you need to do your best work."
    }
  ];

  // Job openings data
  const jobOpenings = [
    {
      id: 1,
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "We're looking for an experienced full-stack developer to help build and maintain our core learning platform. You'll work with React, Node.js, and PostgreSQL to create intuitive, responsive, and accessible user experiences."
    },
    {
      id: 2,
      title: "UX/UI Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Join our design team to create beautiful, user-centered interfaces for our language learning platform. You'll work closely with product managers and engineers to bring language learning visualizations to life."
    },
    {
      id: 3,
      title: "Content Linguist (Spanish)",
      department: "Content",
      location: "Remote",
      type: "Full-time",
      description: "Help us expand our Spanish language curriculum with accurate, engaging content. You'll work with our educational team to create visual grammar maps, interactive exercises, and learning pathways."
    },
    {
      id: 4,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Join our infrastructure team to build and maintain our cloud-based platform. You'll work with AWS, Docker, and CI/CD pipelines to ensure our platform is secure, scalable, and reliable."
    },
    {
      id: 5,
      title: "Product Manager",
      department: "Product",
      location: "Remote",
      type: "Full-time",
      description: "Lead the development of new features and products from conception to launch. You'll work with all teams to ensure we're building the right things for our users."
    },
    {
      id: 6,
      title: "Data Scientist",
      department: "Data",
      location: "Remote",
      type: "Full-time",
      description: "Use machine learning and data analysis to improve our learning algorithms and user experience. You'll work with large datasets to extract insights that drive product decisions."
    },
    {
      id: 7,
      title: "Content Linguist (French)",
      department: "Content",
      location: "Remote",
      type: "Contract",
      description: "Create accurate, engaging French language content for our platform. You'll develop grammar explanations, examples, and exercises that make learning intuitive and effective."
    },
    {
      id: 8,
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help our educational institution clients succeed with SyntaxMap. You'll onboard new clients, provide training, and ensure they get the most value from our platform."
    }
  ];

  // Department options for filter
  const departments = [
    { value: "all", label: "All Departments" },
    { value: "Engineering", label: "Engineering" },
    { value: "Design", label: "Design" },
    { value: "Content", label: "Content" },
    { value: "Product", label: "Product" },
    { value: "Data", label: "Data" },
    { value: "Customer Success", label: "Customer Success" }
  ];

  // Filter jobs by department
  const filteredJobs = selectedDepartment === "all" 
    ? jobOpenings 
    : jobOpenings.filter(job => job.department === selectedDepartment);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us revolutionize language education through innovative technology and visual learning
          </p>
        </motion.div>

        {/* Why Work With Us */}
        <motion.div
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Work With Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Our Culture */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="lg:flex lg:items-center">
              <div className="lg:w-1/2 mb-8 lg:mb-0">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Culture</h2>
                <p className="text-gray-600 mb-4">
                  At SyntaxMap, we believe in creating an environment where everyone can do their best work. Our culture is built on five core principles:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2">•</span>
                    <span className="text-gray-600"><strong>Innovation:</strong> We encourage creative thinking and bold ideas.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2">•</span>
                    <span className="text-gray-600"><strong>Inclusion:</strong> We celebrate diverse perspectives and backgrounds.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2">•</span>
                    <span className="text-gray-600"><strong>Impact:</strong> We focus on making a meaningful difference in education.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2">•</span>
                    <span className="text-gray-600"><strong>Growth:</strong> We invest in continuous learning and development.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-500 font-bold mr-2">•</span>
                    <span className="text-gray-600"><strong>Balance:</strong> We value well-being and sustainable work practices.</span>
                  </li>
                </ul>
              </div>
              <div className="lg:w-1/2 lg:pl-12">
                <img 
                  src="/images/team-culture.jpg" 
                  alt="SyntaxMap team collaboration" 
                  className="rounded-lg shadow-md w-full h-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Open Positions */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Open Positions</h2>
          
          {/* Department Filter */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex flex-wrap gap-2 justify-center">
              {departments.map((dept) => (
                <button
                  key={dept.value}
                  onClick={() => setSelectedDepartment(dept.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedDepartment === dept.value
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {dept.label}
                </button>
              ))}
            </div>
          </div>

          {/* Job Listings */}
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                      <div className="flex items-center">
                        <span className="inline-block bg-orange-100 rounded-full px-3 py-1 text-xs font-medium text-orange-800">
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-center text-gray-500 text-sm mb-1">
                        <BriefcaseIcon className="h-4 w-4 mr-1" />
                        <span className="mr-3">{job.department}</span>
                        <GlobeIcon className="h-4 w-4 mr-1" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 line-clamp-4">
                      {job.description}
                    </p>
                    <div className="flex">
                      <a 
                        href={`/careers/job/${job.id}`} 
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        View Details & Apply
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <p className="text-gray-600">No open positions in this department at the moment. Please check back later!</p>
            </div>
          )}
        </motion.div>

        {/* Application Process */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Application Process</h2>
          <div className="bg-white rounded-xl shadow-sm p-8">
            <ol className="relative border-l border-gray-200 ml-6">
              <li className="mb-10 ml-8">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="font-bold text-orange-600">1</span>
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Application Review</h3>
                <p className="text-gray-600">
                  After you submit your application, our talent team will review your qualifications and experience to determine if there's a potential match with the role.
                </p>
              </li>
              <li className="mb-10 ml-8">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="font-bold text-orange-600">2</span>
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Initial Conversation</h3>
                <p className="text-gray-600">
                  If your background aligns with what we're looking for, we'll schedule an initial video call to discuss your experience, interest in SyntaxMap, and answer any questions you might have.
                </p>
              </li>
              <li className="mb-10 ml-8">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="font-bold text-orange-600">3</span>
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Skills Assessment</h3>
                <p className="text-gray-600">
                  Depending on the role, we may ask you to complete a take-home assignment or technical exercise that reflects the type of work you'd be doing. We value your time and keep these assessments reasonable in scope.
                </p>
              </li>
              <li className="mb-10 ml-8">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="font-bold text-orange-600">4</span>
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Team Interviews</h3>
                <p className="text-gray-600">
                  You'll meet with several team members to discuss your experience in more depth, dive into how you approach problems, and get a better sense of what it would be like to work together.
                </p>
              </li>
              <li className="ml-8">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full -left-4 ring-4 ring-white">
                  <span className="font-bold text-orange-600">5</span>
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Offer & Welcome</h3>
                <p className="text-gray-600">
                  If there's a strong mutual fit, we'll extend an offer and work with you to ensure a smooth onboarding experience as you join our team.
                </p>
              </li>
            </ol>
          </div>
        </motion.div>

        {/* No Open Roles CTA */}
        <motion.div 
          className="bg-gray-900 rounded-xl text-white p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-4">Don't See The Right Role?</h2>
              <p className="text-gray-300 mb-6 md:mb-0">
                We're always on the lookout for talented individuals who are passionate about revolutionizing language education. Submit your resume for future opportunities!
              </p>
            </div>
            <div className="md:w-1/3 text-center md:text-right">
              <a 
                href="/careers/general-application" 
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Submit General Application
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Careers;