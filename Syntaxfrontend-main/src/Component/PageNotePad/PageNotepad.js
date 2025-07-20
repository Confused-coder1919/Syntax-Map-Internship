import React from "react";
import { motion } from "framer-motion";
import Notepad from "./Notepad";
import FalseQuestion from "./FalseQuestion";
import MyExamples from "./MyExamples";
import MyVocabulary from "./MyVocabulary";
import Flashcards from "./Flashcards";
import TenseMapTab from "./TenseMapTab"; 
import LearningGoals from "./LearningGoals";
import {API_BASE_URL} from "../../config";
import { 
  DocumentTextIcon, 
  ChartBarIcon,
  BookmarkIcon as BookmarkOutlineIcon,
  SpeakerWaveIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  BookOpenIcon as BookOpenOutlineIcon,
  RectangleStackIcon,
  AcademicCapIcon,
  LightBulbIcon,
  FlagIcon
} from "@heroicons/react/24/outline";

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

class PageNotepad extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            words:[],
            wrongQuestionId:[],
            wrongQuestionText:[],
            notes:[],
            isLoading: true,
            error: null,
            isLoggedIn: Boolean(localStorage.getItem('jstoken')) && localStorage.getItem('user_role') < 4,
            activeTab: 'notes'
        };
    }
      
    componentDidUpdate(){
    }

    componentDidMount() {
        console.log("componentDidMount");
        this.fetchAllData();
    }

    fetchAllData = () => {
        // Reset loading state
        this.setState({ isLoading: true, error: null });
        
        // Only fetch user-specific data if logged in
        if (this.state.isLoggedIn) {
            // Use Promise.all to handle all fetch requests together
            Promise.all([
                this.fetchWords(),
                this.fetchNotes(),
                this.fetchWrongQuestions()
            ])
            .then(() => {
                this.setState({ isLoading: false });
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                this.setState({ 
                    isLoading: false, 
                    error: "Failed to load some data. Please refresh the page." 
                });
            });
        } else {
            // For guest users, we don't need to fetch user-specific data
            this.setState({ isLoading: false });
        }
    }
    
    fetchWords = () => {
        return new Promise((resolve, reject) => {
            // Fetch words
            fetch(`${API_BASE_URL}/dictionnary/user/`, {
                headers: {"Authorization": localStorage.getItem('jstoken')}
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Dictionary API responded with status: ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res) {
                    console.log("Dictionary data:", res);
                    let tmp = [];
                    for (var i = 0; i < res.dictionnary.length; i++) {
                        tmp.push(res.dictionnary[i]);
                    }
                    this.setState({words: tmp});
                    resolve();
                } else {
                    throw new Error("Empty response from dictionary API");
                }
            })
            .catch(err => {
                console.error("Failed to fetch words:", err);
                reject(err);
            });
        });
    }
    
    fetchNotes = () => {
        return new Promise((resolve, reject) => {
            // Use the working userupload/user endpoint instead of notepad/user/
            fetch(`${API_BASE_URL}/userupload/user`, {
                headers: {"Authorization": localStorage.getItem('jstoken')}
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Notes API responded with status: ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res && res.userUploads) {
                    console.log("Notes data:", res);
                    let tmp = [];
                    for (var i = 0; i < res.userUploads.length; i++) {
                        tmp.push({
                            note_id: res.userUploads[i].id || res.userUploads[i].upload_id,
                            note: res.userUploads[i].sentence,
                            user_id: res.userUploads[i].user_id,
                            session_name: res.userUploads[i].session_name || "My Notes",
                            date: res.userUploads[i].created_at || new Date().toISOString()
                        });
                    }
                    this.setState({notes: tmp});
                    resolve();
                } else {
                    this.setState({notes: []});
                    resolve();
                }
            })
            .catch(err => {
                console.error("Failed to fetch notes:", err);
                // Don't reject promise, just resolve with empty data to avoid breaking the UI
                this.setState({notes: []});
                resolve();
            });
        });
    }
    
    fetchWrongQuestions = () => {
        return new Promise((resolve, reject) => {
            // Fetch wrong questions
            fetch(`${API_BASE_URL}/mistakeQuestion/user`, {
                headers: {"Authorization": localStorage.getItem('jstoken')}
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Mistake questions API responded with status: ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res) {
                    console.log("Mistake questions data:", res);
                    let tmp = [];
                    let question_ids = "";
                    
                    for (var i = 0; i < res.mistakeQuestions.length; i++) {
                        tmp.push(res.mistakeQuestions[i]);
                        question_ids = question_ids + res.mistakeQuestions[i].questions_wrong_id.join();
                        if (i !== res.mistakeQuestions.length - 1 && res.mistakeQuestions[i].questions_wrong_id.length > 0)
                            question_ids = question_ids + ",";
                    }
                    
                    if (question_ids[question_ids.length - 1] === ",")
                        question_ids = question_ids.slice(0, -1);
                    
                    this.setState({wrongQuestionId: tmp});
                    
                    // Only fetch question details if we have question IDs
                    if (question_ids && question_ids.length > 0) {
                        return this.fetchQuestionDetails(question_ids);
                    }
                    resolve();
                } else {
                    throw new Error("Empty response from mistake questions API");
                }
            })
            .then(() => resolve())
            .catch(err => {
                console.error("Failed to fetch wrong questions:", err);
                reject(err);
            });
        });
    }
    
    fetchQuestionDetails = (question_ids) => {
        return new Promise((resolve, reject) => {
            fetch(`${API_BASE_URL}/questions/notepad`, {
                method: "POST",
                body: JSON.stringify({
                    question_ids: question_ids
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                    "Authorization": localStorage.getItem('jstoken')
                }
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Question details API responded with status: ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                console.log("Question details:", res);
                let tmp = [];
                for (var i = 0; i < res.questions.length; i++) {
                    tmp.push(res.questions[i]);
                }
                this.setState({wrongQuestionText: tmp});
                resolve();
            })
            .catch(err => {
                console.error("Failed to fetch question details:", err);
                reject(err);
            });
        });
    }

    handleNote = e => {
        console.log(e.target.value);
    }

    updateNote = e => {
        e.preventDefault();
        const noteId = e.target[0].value;
        const sessionName = e.target[1].value;
        const noteText = e.target[2].value;
        
        console.log("Updating note:", noteId, sessionName, noteText);
        
        fetch(`${API_BASE_URL}/userupload/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify({
                sentence: noteText,
                session_name: sessionName
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                "Authorization": localStorage.getItem('jstoken')
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`API responded with status: ${res.status}`);
            }
            return res.json();
        })
        .then(res => {
            console.log("Note update response:", res);
            // Show success notification
            alert("Note updated successfully!");
            // Refresh notes to get the latest data
            this.fetchNotes();
        })
        .catch(err => {
            console.error("Error updating note:", err);
            alert("Error updating note. Please try again.");
        });
    }

    // Speech synthesis for text reading
    speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    }

    setActiveTab = (tab) => {
        this.setState({ activeTab: tab });
    }

    render() {
        const { isLoading, error, isLoggedIn, activeTab } = this.state;
        
        return (
            <div className="bg-gray-50 min-h-screen">
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Loading state */}
                    {isLoading && (
                        <div className="text-center py-10">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                            <p className="mt-2 text-gray-500">Loading your notes and learning data...</p>
                        </div>
                    )}
                    
                    {/* Error state */}
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Content (only show when not loading) */}
                    {!isLoading && (
                        <>
                            {/* Guest mode information banner */}
                            {!isLoggedIn && (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                You're using SyntaxMap in guest mode. Your notes are saved in this browser only and will be lost if you clear your browser data.
                                                <a href="/login_register" className="ml-1 font-medium text-yellow-700 underline hover:text-yellow-600">
                                                    Login or register
                                                </a> to save your data securely in the cloud.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Tab Navigation */}
                            <div className="mb-6 border-b border-gray-200 overflow-x-auto">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    <button
                                        onClick={() => this.setActiveTab('notes')}
                                        className={`${
                                            activeTab === 'notes'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        aria-current={activeTab === 'notes' ? 'page' : undefined}
                                    >
                                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                                        Notes
                                    </button>
                                    <button
                                        onClick={() => this.setActiveTab('mistakes')}
                                        className={`${
                                            activeTab === 'mistakes'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        aria-current={activeTab === 'mistakes' ? 'page' : undefined}
                                    >
                                        <PencilIcon className="h-5 w-5 mr-2" />
                                        Mistakes
                                    </button>
                                    <button
                                        onClick={() => this.setActiveTab('examples')}
                                        className={`${
                                            activeTab === 'examples'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        aria-current={activeTab === 'examples' ? 'page' : undefined}
                                    >
                                        <BookOpenOutlineIcon className="h-5 w-5 mr-2" />
                                        My Examples
                                    </button>
                                    <button
                                        onClick={() => this.setActiveTab('vocabulary')}
                                        className={`${
                                            activeTab === 'vocabulary'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        aria-current={activeTab === 'vocabulary' ? 'page' : undefined}
                                    >
                                        <RectangleStackIcon className="h-5 w-5 mr-2" />
                                        My Vocabulary
                                    </button>
                                    <button
                                        onClick={() => this.setActiveTab('flashcards')}
                                        className={`${
                                            activeTab === 'flashcards'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        aria-current={activeTab === 'flashcards' ? 'page' : undefined}
                                    >
                                        <LightBulbIcon className="h-5 w-5 mr-2" />
                                        Flashcards
                                    </button>
                                    <button
                                        onClick={() => this.setActiveTab('tenseMap')}
                                        className={`${
                                            activeTab === 'tenseMap'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        aria-current={activeTab === 'tenseMap' ? 'page' : undefined}
                                    >
                                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                                        Tense Map
                                    </button>
                                    <button
                                        onClick={() => this.setActiveTab('learningGoals')}
                                        className={`${
                                            activeTab === 'learningGoals'
                                                ? 'border-orange-500 text-orange-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        aria-current={activeTab === 'learningGoals' ? 'page' : undefined}
                                    >
                                        <FlagIcon className="h-5 w-5 mr-2" />
                                        Learning Goals
                                    </button>
                                </nav>
                            </div>
                            
                            {/* Tab Content */}
                            <div className="mt-6">
                                {activeTab === 'notes' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="mb-10"
                                    >
                                        <Notepad 
                                            backendUrl={API_BASE_URL}
                                            refreshNotes={this.fetchNotes}
                                        />
                                    </motion.div>
                                )}
                                
                                {activeTab === 'mistakes' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <FalseQuestion />
                                    </motion.div>
                                )}
                                
                                {activeTab === 'examples' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <MyExamples />
                                    </motion.div>
                                )}
                                
                                {activeTab === 'vocabulary' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <MyVocabulary />
                                    </motion.div>
                                )}
                                
                                {activeTab === 'flashcards' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Flashcards />
                                    </motion.div>
                                )}
                                
                                {activeTab === 'tenseMap' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <TenseMapTab />
                                    </motion.div>
                                )}
                                
                                {activeTab === 'learningGoals' && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} 
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <LearningGoals />
                                    </motion.div>
                                )}
                                
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }
}

export default PageNotepad