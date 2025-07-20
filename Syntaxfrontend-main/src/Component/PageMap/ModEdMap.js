import React from "react";
import ModEdMapSVG from "../SVGs/ModEdMapSVG.js";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    ArrowLeftIcon, 
    InformationCircleIcon, 
    MagnifyingGlassPlusIcon, 
    MagnifyingGlassMinusIcon,
    AcademicCapIcon,
    MapIcon,
    HomeIcon,
    ChevronRightIcon,
    BookOpenIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";

class ModEdMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hidden: false,
            isZoomed: false,
            helpVisible: false
        };
    }
      
    handleZoom = () => {
        this.setState(prevState => ({
            isZoomed: !prevState.isZoomed
        }));
    }

    toggleHelp = () => {
        this.setState(prevState => ({
            helpVisible: !prevState.helpVisible
        }));
    }

    componentDidMount() {
        // Fetch any necessary data when component mounts
        document.title = "Modal ED Forms | SyntaxMap";
    }

    render() {
        const { isZoomed, helpVisible } = this.state;
        
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
            hidden: { opacity: 0, y: 20 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.5,
                    ease: "easeOut"
                }
            }
        };
        
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Header Section with Gradient */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex items-center">
                            <AcademicCapIcon className="h-9 w-9 text-white mr-3" />
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Modal ED Forms</h1>
                        </div>
                        <p className="text-white text-opacity-90 mt-2 max-w-2xl">
                            Visual reference for modal verbs in past form structures and their usage in English grammar
                        </p>
                    </div>
                </div>
                
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                >
                    {/* Breadcrumb Navigation */}
                    <motion.nav 
                        className="flex mb-6" 
                        aria-label="Breadcrumb"
                        variants={itemVariants}
                    >
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
                                    <HomeIcon className="h-4 w-4" />
                                </Link>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                    <Link to="/maps" className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
                                        Maps
                                    </Link>
                                </div>
                            </li>
                            <li>
                                <div className="flex items-center">
                                    <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                                    <span className="ml-2 text-sm font-medium text-orange-600" aria-current="page">
                                        Modal ED Forms
                                    </span>
                                </div>
                            </li>
                        </ol>
                    </motion.nav>

                    {/* Main Content Card */}
                    <motion.div 
                        variants={itemVariants}
                        className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 mb-8"
                    >
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-gray-200">
                            <div className="flex flex-wrap items-center justify-between px-4 py-4">
                                <div className="flex items-center">
                                    <MapIcon className="h-5 w-5 text-orange-600 mr-2" />
                                    <h2 className="text-lg font-semibold text-gray-800">Interactive Grammar Diagram</h2>
                                </div>
                                <div className="flex space-x-2 mt-2 sm:mt-0">
                                    <button 
                                        onClick={this.toggleHelp}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-orange-700 bg-white border border-orange-200 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                    >
                                        <InformationCircleIcon className="h-4 w-4 mr-1.5" />
                                        How to Use
                                    </button>
                                    <button 
                                        onClick={this.handleZoom}
                                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-orange-700 bg-white border border-orange-200 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                    >
                                        {isZoomed ? (
                                            <>
                                                <MagnifyingGlassMinusIcon className="h-4 w-4 mr-1.5" />
                                                Zoom Out
                                            </>
                                        ) : (
                                            <>
                                                <MagnifyingGlassPlusIcon className="h-4 w-4 mr-1.5" />
                                                Zoom In
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        {helpVisible && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-yellow-50 px-5 py-4 border-b border-yellow-200"
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">How to use this diagram</h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>
                                                Click on any highlighted element in the diagram to explore that specific grammar form.
                                                Each color represents a different modal verb category.
                                            </p>
                                            <ul className="mt-2 list-disc list-inside space-y-1">
                                                <li>Blue elements: Primary modal forms</li>
                                                <li>Green elements: Conditional modal structures</li>
                                                <li>Purple elements: Past perfect modal forms</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className={`p-5 md:p-6 transition-all duration-300 ${isZoomed ? 'overflow-auto' : ''}`}>
                            <div className={`modEdMap w-full mx-auto transition-all duration-300 transform ${isZoomed ? 'scale-150 origin-top-left' : ''}`}>
                                <ModEdMapSVG />
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-3 border-t border-gray-100">
                            <div className="flex flex-wrap items-center justify-between text-sm text-gray-600">
                                <div className="flex items-center space-x-4">
                                    <span className="inline-flex items-center">
                                        <InformationCircleIcon className="h-4 w-4 mr-1.5 text-orange-500" />
                                        <span>Interactive elements available</span>
                                    </span>
                                    <span className="inline-flex items-center">
                                        <AcademicCapIcon className="h-4 w-4 mr-1.5 text-orange-500" />
                                        <span>Updated April 2025</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Related Resources Section */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-orange-500" />
                            Related Resources
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <motion.div 
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link 
                                    to="/tense-map" 
                                    className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
                                >
                                    <div className="flex items-start">
                                        <div className="bg-blue-100 rounded-md p-2 mr-3">
                                            <MapIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-md font-medium text-gray-800 mb-1">Tense Map</h4>
                                            <p className="text-sm text-gray-600">Explore the complete tense system in English</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link 
                                    to="/modal-map" 
                                    className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
                                >
                                    <div className="flex items-start">
                                        <div className="bg-green-100 rounded-md p-2 mr-3">
                                            <MapIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-md font-medium text-gray-800 mb-1">Modal Map</h4>
                                            <p className="text-sm text-gray-600">Understand modal verbs and their usage</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                            
                            <motion.div 
                                whileHover={{ y: -5 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Link 
                                    to="/dashboard" 
                                    className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4"
                                >
                                    <div className="flex items-start">
                                        <div className="bg-orange-100 rounded-md p-2 mr-3">
                                            <HomeIcon className="h-6 w-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-md font-medium text-gray-800 mb-1">Dashboard</h4>
                                            <p className="text-sm text-gray-600">Return to your learning dashboard</p>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>
                    
                    {/* Practice & Learning Resources */}
                    <motion.div variants={itemVariants} className="mb-10">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <BookOpenIcon className="h-5 w-5 mr-2 text-orange-500" />
                            Practice & Learning
                        </h3>
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
                            <p className="text-gray-700 mb-4">
                                Reinforce your understanding of modal verb forms with our interactive exercises and examples.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link 
                                    to="/quiz/modal-verbs" 
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                >
                                    Take a Practice Quiz
                                </Link>
                                <Link 
                                    to="/examples/modal-verbs" 
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                >
                                    View Example Sentences
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                    
                    {/* Navigation Button */}
                    <motion.div variants={itemVariants} className="flex justify-center">
                        <Link 
                            to="/dashboard" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        );
    }
}

export default ModEdMap;