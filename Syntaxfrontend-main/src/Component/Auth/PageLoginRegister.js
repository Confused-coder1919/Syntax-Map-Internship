import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import Login from "./Login/Login.js";
import Register from "./Register/Register.js";
import logo from "../../img/LC-1.jpg";
import { 
  ArrowRightIcon, 
  UserPlusIcon, 
  KeyIcon,
  ArrowLeftIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

const PageLoginRegister = (props) => {
  const [formLogIn, setFormLogIn] = useState(true);
  
  useEffect(() => {
    // Prepare animations (removed loading state as it wasn't being used)
    const timer = setTimeout(() => {
      // Animation ready
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const changeForm = () => {
    setFormLogIn(!formLogIn);
  };
  
  const pageVariants = {
    initial: { opacity: 0 },
    in: { 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    out: { 
      opacity: 0,
      transition: { 
        duration: 0.4, 
        ease: "easeIn" 
      }
    }
  };
  
  const formVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.98 
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.98,
      transition: { 
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };
  
  const slideVariants = {
    login: { 
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    },
    register: { 
      x: "100%",
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const logoVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: {
        type: "spring",
        damping: 10,
        stiffness: 100
      }
    }
  };

  // Generate random floating sparkles for background
  const sparkles = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: Math.random() * 20 + 10
  }));

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden relative"
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute opacity-30"
            style={{ 
              left: sparkle.left, 
              top: sparkle.top, 
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.1, 0.3, 0.1], 
              scale: [0, 1, 0],
              rotate: [0, 180]
            }}
            transition={{ 
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut"
            }}
          >
            <SparklesIcon 
              className="text-indigo-600" 
              style={{ width: `${sparkle.size}px`, height: `${sparkle.size}px` }} 
            />
          </motion.div>
        ))}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-500"></div>
      </div>

      {/* Header with logo and tagline */}
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md mb-8"
        variants={itemVariants}
      >
        <motion.img 
          src={logo} 
          className="mx-auto h-20 w-20 rounded-full shadow-md object-cover border-2 border-white" 
          alt="SyntaxMap Logo" 
          variants={logoVariants}
        />
        <motion.h2 
          className="mt-6 text-center text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500"
          variants={itemVariants}
        >
          SyntaxMap
        </motion.h2>
        <motion.p 
          className="mt-2 text-center text-lg text-gray-600"
          variants={itemVariants}
        >
          {formLogIn ? "Welcome back to your learning journey" : "Begin your language learning adventure"}
        </motion.p>
      </motion.div>

      {/* Main container with tabs and form content */}
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-4xl relative mb-8"
        variants={itemVariants}
      >
        {/* Mobile tab navigation for small screens */}
        <motion.div 
          className="md:hidden mx-auto w-full max-w-md px-4 mb-4"
          variants={itemVariants}
        >
          <div className="bg-white rounded-lg shadow-sm p-1 flex">
            <button
              onClick={() => setFormLogIn(true)}
              className={`w-1/2 py-3 px-4 text-sm font-medium rounded-md flex items-center justify-center transition-all duration-200 ${
                formLogIn 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <KeyIcon className="w-4 h-4 mr-2" />
              Login
            </button>
            <button
              onClick={() => setFormLogIn(false)}
              className={`w-1/2 py-3 px-4 text-sm font-medium rounded-md flex items-center justify-center transition-all duration-200 ${
                !formLogIn 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Register
            </button>
          </div>
        </motion.div>

        {/* Desktop version with split design (hidden on small screens) */}
        <motion.div 
          className="hidden md:block bg-white rounded-xl overflow-hidden shadow-xl" 
          style={{ height: "600px" }}
          variants={itemVariants}
          whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative h-full flex">
            {/* Animated background slide */}
            <motion.div 
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 rounded-l-xl"
              animate={formLogIn ? "login" : "register"}
              variants={slideVariants}
            >
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <radialGradient id="squares" cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#squares)" />
                    {Array.from({ length: 8 }).map((_, i) => (
                      <rect 
                        key={i}
                        x={Math.random() * 90} 
                        y={Math.random() * 90} 
                        width="10" 
                        height="10" 
                        rx="2"
                        fill="white"
                        opacity={Math.random() * 0.1 + 0.1} 
                      />
                    ))}
                  </svg>
                </div>
              </div>
              
              <div className="h-full w-full flex items-center justify-center p-8 relative z-10">
                <motion.div 
                  className="text-white text-center max-w-xs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {formLogIn ? (
                    <>
                      <motion.h3 
                        className="text-2xl font-bold mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        New to SyntaxMap?
                      </motion.h3>
                      <motion.p 
                        className="mb-6 text-indigo-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        Create an account and start your language learning journey today.
                      </motion.p>
                      <motion.button
                        onClick={changeForm}
                        className="group px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full border border-white border-opacity-40 transition-all duration-300 flex items-center justify-center mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        Register
                        <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.h3 
                        className="text-2xl font-bold mb-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        Already a member?
                      </motion.h3>
                      <motion.p 
                        className="mb-6 text-indigo-100"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                      >
                        Sign in to continue where you left off on your learning path.
                      </motion.p>
                      <motion.button
                        onClick={changeForm}
                        className="group px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full border border-white border-opacity-40 transition-all duration-300 flex items-center justify-center mx-auto"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                        Login
                      </motion.button>
                    </>
                  )}
                </motion.div>
              </div>
            </motion.div>

            {/* Form container - adjusted based on active tab */}
            <div className={`w-1/2 ${formLogIn ? "ml-auto" : "mr-auto"}`}>
              <div className="p-10 h-full flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={formLogIn ? "login" : "register"}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="w-full"
                  >
                    {formLogIn ? (
                      <Login changeForm={changeForm} />
                    ) : (
                      <Register changeForm={changeForm} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Mobile forms - visible only on small screens */}
        <motion.div 
          className="md:hidden px-4"
          variants={itemVariants}
        >
          <motion.div 
            className="bg-white rounded-lg shadow-lg overflow-hidden p-6"
            whileHover={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={formLogIn ? "login" : "register"}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {formLogIn ? (
                  <Login changeForm={changeForm} />
                ) : (
                  <Register changeForm={changeForm} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom links */}
      <motion.div 
        className="text-center mt-4"
        variants={itemVariants}
      >
        <Link to="/" className="text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200">
          Return to Home
        </Link>
        <span className="mx-2 text-gray-300">|</span>
        <Link to="/contact" className="text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors duration-200">
          Need Help?
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default PageLoginRegister;
