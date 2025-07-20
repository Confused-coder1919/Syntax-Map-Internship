import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpenIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  SpeakerWaveIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Section, Card, Button } from "../UI";
import SpeechFeature from "../SpeechFeature";
import { API_BASE_URL, getBackendUrl } from "../../config";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";

const PageCourse = (props) => {
  const [tenseData, setTenseData] = useState({
    tense_id: "",
    title: "",
    content: "",
    grammer_references: "",
    description: "",
    examples: [],
    usage_notes: "",
  });

  const [formData, setFormData] = useState({
    sentence: "",
    sentence_type: "",
    img: {},
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { title } = useParams();
  const [showReferences, setShowReferences] = useState(false);
  const [quizScore, setQuizScore] = useState({
    total_questions: 0,
    correct_answers: 0,
    highestscore: 0,
  });

  // Create a ref for the speech feature
  const speechFeatureRef = React.useRef();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // New state variables for course stats
  const [courseStats, setCourseStats] = useState({
    completionRate: 0,
    avgScore: 0,
    studyTime: 0,
    totalExamples: 0,
  });

  // Add a new state for tab navigation
  const [activeTab, setActiveTab] = useState("content");

  // Create a ref for scrolling to sections
  const contentRef = useRef(null);
  const examplesRef = useRef(null);

  useEffect(() => {
    // Fetch course data
    fetchtenseData();
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, [props.location.pathname]);

  useEffect(() => {
    if (tenseData.tense_id) {
      fetchQuizScore();
      fetchCourseStats();
    }
  }, [tenseData?.tense_id]);

  const fetchQuizScore = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/quiz-performance/stats/bytenseid/${tenseData?.tense_id}`,
        {
          headers: {
            Authorization: `${localStorage.getItem("jstoken")}`,
          },
        }
      );

      const performances = await res.data?.performances;
      const bestPerformance = performances.reduce((best, current) => {
        if (current.correct_answers > best.correct_answers) {
          return current;
        } else if (
          current.correct_answers === best.correct_answers &&
          current.avg_time_per_question < best.avg_time_per_question
        ) {
          // If scores are equal, choose the faster one
          return current;
        }
        return best;
      });
      setQuizScore({
        correct_answers: bestPerformance.correct_answers,
        total_questions: bestPerformance.total_questions,
        highestscore:
          (bestPerformance.correct_answers / bestPerformance.total_questions) *
            100 || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchtenseData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    const url = await getBackendUrl();

    fetch(`${url}/tense`) //replace course with tenses
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load tenses");
        }
        setIsLoading(false);
        return res.json();
      })
      .then((res) => {
        const normalizedTitle = title?.toLowerCase().replace(/-/g, " ").trim();

        const matchedTenses = res.tenses.filter((t) => {
          const normalizedTenseName = t.tense_name.toLowerCase().trim();
          return normalizedTenseName === normalizedTitle;
        });

        if (matchedTenses.length > 0) {
          const matched = matchedTenses[0];

          setTenseData({
            tense_id: matched.tense_id,
            title: matched.tense_name,
            content: matched.grammar_rules,
            grammer_references: matched.example_structure,
            description: matched.description,
            usage_notes: matched.usage_notes,
          });

          setIsLoading(false);
          fetchExamples(matched?.tense_id);
        } else {
          setErrorMessage("No matching tense found in the title.");
        }
      })

      .catch((err) => {
        console.error("Error fetching course:", err);
        setErrorMessage("Failed to load course. Please try again later.");
        setIsLoading(false);
      });
  };

  const fetchExamples = async (tenseId) => {
    if (!tenseId) return;

    if (localStorage.getItem("jstoken")) {
      const url = await getBackendUrl();
      fetch(`${url}/user/examples`, {
        headers: {
          Authorization: localStorage.getItem("jstoken"),
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to load examples");
          }
          return res.json();
        })
        .then((res) => {
          if (res && res.examplesByTense) {
            const examples = res.examplesByTense[tenseId];
            setTenseData((prev) => ({ ...prev, examples }));
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching examples:", err);
          setIsLoading(false);
        });
    } else {
      try {
        const jsonExemple = JSON.parse(
          localStorage.getItem("upload") || '{"upload":[]}'
        );
        const examples = jsonExemple.upload
          .filter((item) => item.course_id === tenseId)
          .map((item) => item.sentence);

        setTenseData((prev) => ({ ...prev, examples }));
        setIsLoading(false);
      } catch (err) {
        console.error("Error parsing local examples:", err);
        setIsLoading(false);
      }
    }
  };

  const fetchCourseStats = async () => {
    // Simulate fetching course stats from the server
    try {
      const res = await axios.get(
        `${API_BASE_URL}/tense/${tenseData?.tense_id}/stats`,
        {
          headers: {
            Authorization: localStorage.getItem("jstoken"),
          },
        }
      );
      const stats= res.data.stats
       setCourseStats({
        completionRate: stats.completion_percentage || 0,
        avgScore: stats.average_score || 0,
        studyTime: Math.floor(1 + Math.random() * 2),
        totalExamples: stats.examples.total || 0,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleTextInput = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.sentence.trim()) {
      setErrorMessage("Please enter an example sentence.");
      return;
    }

    if (localStorage.getItem("jstoken")) {
      const url = await getBackendUrl();
      fetch(`${url}/user/examples`, {
        method: "POST",
        body: JSON.stringify({
          sentence: formData.sentence,
          sentence_type: formData.sentence_type,
          tense_id: tenseData.tense_id,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
          Authorization: localStorage.getItem("jstoken"),
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to upload example");
          }
          return res.json();
        })
        .then(() => {
          setFormData({ sentence: "", img: {} });
          setShowUploadForm(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
          fetchExamples(tenseData.tense_id);
        })
        .catch((err) => {
          console.error("Error uploading example:", err);
          setErrorMessage("Failed to upload example. Please try again.");
        });
    } else {
      try {
        const jsonExemple = JSON.parse(
          localStorage.getItem("upload") || '{"upload":[]}'
        );

        if (jsonExemple.upload.length < 3) {
          const data = {
            user_name: "guest",
            sentence: formData.sentence,
            img: null,
            tense_id: tenseData.tense_id,
          };

          jsonExemple.upload.push(data);
          localStorage.setItem("upload", JSON.stringify(jsonExemple));

          setFormData({ sentence: "", img: {} });
          setShowUploadForm(false);
          setUploadSuccess(true);
          setTimeout(() => setUploadSuccess(false), 3000);
          fetchExamples(tenseData.tense_id);
        } else {
          setErrorMessage(
            "You've reached the maximum number of examples as a guest. Please log in to add more."
          );
        }
      } catch (err) {
        console.error("Error saving local example:", err);
        setErrorMessage("Failed to save example locally. Please try again.");
      }
    }
  };

  const speakExamples = () => {
    if (speechFeatureRef.current && tenseData.examples?.length > 0) {
      const mapped = tenseData.examples.map((eg) => {
        return eg.example_text;
      });
      speechFeatureRef.current.speak(mapped.join(". "));
    }
  };

  const scrollToSection = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Improved function to speak course content
  const speakContent = () => {
    if (speechFeatureRef.current) {
      speechFeatureRef.current.speak(tenseData.content);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center p-8">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            Loading Tense
          </h2>
          <p className="text-slate-500">
            Please wait while we prepare your learning materials...
          </p>
        </div>
      </div>
    );
  }

  if (!tenseData.tense_id) {
    return (
      <div className="min-h-screen">
        <div className="pt-28 pb-20 max-w-4xl mt-20 mx-auto bg-gradient-to-r from-orange-600 to-red-600 text-white text-center">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex justify-center mb-6">
              <ExclamationCircleIcon className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Tense Data Found</h2>
            <p className="text-lg text-orange-100">
              We couldn’t find any tense information.
            </p>
            <p className="text-sm mt-2 text-orange-200">
              Please try again with a different topic or check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SpeechFeature ref={speechFeatureRef} />

      {/* Success Message */}
      {uploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          <p>Example added successfully!</p>
        </motion.div>
      )}

      {/* Course Header */}
      <Section className="pt-20 pb-12 bg-gradient-to-r from-orange-600 to-red-600">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {tenseData?.title.toUpperCase()}
            </h1>
            <div className="w-20 h-1 bg-white mx-auto mb-4"></div>
            <p className="text-orange-100 max-w-2xl mx-auto mb-8">
              Master your language skills with comprehensive tense materials and
              personalized examples
            </p>

            {/* Navigation Tabs */}
            <div className="flex justify-center mt-8 space-x-2 md:space-x-4">
              <button
                onClick={() => {
                  setActiveTab("content");
                  setTimeout(() => scrollToSection(contentRef), 100);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "content"
                    ? "bg-white text-orange-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <BookOpenIcon className="w-5 h-5 inline mr-1" /> Tense Content
              </button>

              <button
                onClick={() => {
                  setActiveTab("examples");
                  setTimeout(() => scrollToSection(examplesRef), 100);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "examples"
                    ? "bg-white text-orange-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <DocumentTextIcon className="w-5 h-5 inline mr-1" /> Your
                Examples
              </button>

              <Link
                to={{
                  pathname: `/quiz/${tenseData.tense_id}`,
                  state: { tensee_id: tenseData.tense_id },
                }}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white/20 text-white hover:bg-white hover:text-orange-600"
              >
                <PencilSquareIcon className="w-5 h-5 inline mr-1" /> Take Quiz
              </Link>
            </div>
          </div>

          {/* Course Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mt-10"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
              <AcademicCapIcon className="w-8 h-8 mx-auto mb-2" />
              <h4 className="text-xs uppercase tracking-wider font-semibold">
                Completion
              </h4>
              <p className="text-2xl font-bold">
                {courseStats.completionRate}%
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
              <ChartBarIcon className="w-8 h-8 mx-auto mb-2" />
              <h4 className="text-xs uppercase tracking-wider font-semibold">
                Avg. Score
              </h4>
              <p className="text-2xl font-bold">{courseStats.avgScore}%</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
              <ClockIcon className="w-8 h-8 mx-auto mb-2" />
              <h4 className="text-xs uppercase tracking-wider font-semibold">
                Study Time
              </h4>
              <p className="text-2xl font-bold">{courseStats.studyTime}h</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center text-white">
              <DocumentTextIcon className="w-8 h-8 mx-auto mb-2" />
              <h4 className="text-xs uppercase tracking-wider font-semibold">
                Examples
              </h4>
              <p className="text-2xl font-bold">
                {courseStats.totalExamples || 0}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Course Content Section */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Card className="overflow-hidden shadow-lg border border-slate-200">
              <div className="bg-slate-800 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2" /> Tense Content
                </h2>
              </div>
              <div className="p-6 md:p-8">
                <div className="prose max-w-none">
                  {/* Description Section */}
                  <h2 className="text-xl font-semibold text-gray-800">
                    Description
                  </h2>
                  <p>{tenseData.description}</p>

                  <h2 className="text-xl font-semibold text-gray-800 mt-6">
                    Usage Notes
                  </h2>
                  <p>{tenseData.usage_notes}</p>

                  <h2 className="text-xl font-semibold text-gray-800 mt-6">
                    Detailed Explanation
                  </h2>
                  <div className="prose max-w-none">
                    {tenseData?.content.split("\n").map((part, index) => {
                      const trimmed = part.trim().toLowerCase();

                      const isHeading = [
                        "affirmative",
                        "negative",
                        "interrogative",
                      ].some((keyword) => trimmed.startsWith(keyword));

                      return isHeading ? (
                        <h3
                          key={index}
                          className="text-lg font-semibold text-orange-600 mt-6"
                        >
                          {part}
                        </h3>
                      ) : (
                        <p
                          key={index}
                          className="mb-4 text-gray-700 leading-relaxed"
                        >
                          {part}
                        </p>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4 items-center justify-between">
                  <Link
                    to={{
                      pathname: `/quiz/${tenseData.tense_id}`,
                      state: { course_id: tenseData.course_id },
                    }}
                    className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-medium transition-all duration-200 shadow-md"
                  >
                    Take the Quiz <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>

                  <button
                    onClick={speakContent}
                    className="inline-flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    <SpeakerWaveIcon className="w-5 h-5 mr-2" /> Listen
                  </button>
                </div>
              </div>
            </Card>

            {/* Related Materials */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className={`p-5 transition-shadow duration-200 border ${
                  showReferences
                    ? "border-orange-300 shadow-md"
                    : "border-slate-200 hover:shadow-lg"
                }`}
              >
                <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-orange-500" />
                  Grammar References
                </h3>

                <p className="text-sm text-gray-600 mb-3">
                  Access comprehensive grammar guides and examples related to
                  this course.
                </p>

                <button
                  onClick={() => setShowReferences(!showReferences)}
                  className={`text-sm font-medium inline-flex items-center transition-colors duration-200 ${
                    showReferences
                      ? "text-orange-700"
                      : "text-orange-600 hover:text-orange-700"
                  }`}
                >
                  {showReferences ? "Hide References" : "View References"}
                  <ArrowRightIcon
                    className={`w-4 h-4 ml-1 transform transition-transform duration-200 ${
                      showReferences ? "rotate-90" : ""
                    }`}
                  />
                </button>

                {showReferences && (
                  <div className="mt-4 border-t pt-3 text-sm text-gray-700 whitespace-pre-line">
                    {tenseData.grammer_references}
                  </div>
                )}
              </Card>

              <Card className="p-5 hover:shadow-lg transition-shadow duration-200 border border-slate-200">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                  <PencilSquareIcon className="w-5 h-5 mr-2 text-orange-500" />
                  Practice Exercises
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Additional exercises to help reinforce the concepts from this
                  course.
                </p>
                <Link
                  to={`/tense/${tenseData?.tense_id}/practice`}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium inline-flex items-center"
                >
                  Start Practice <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Link>
              </Card>
            </div>
          </motion.div>

          {/* Examples Section */}
          <motion.div
            ref={examplesRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Examples Card */}
              <div className="md:col-span-2">
                <Card className="shadow-lg border border-slate-200 h-full">
                  <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                      Your Examples
                    </h2>
                    {tenseData.examples && tenseData?.examples.length > 0 && (
                      <button
                        onClick={speakExamples}
                        className="p-1.5 text-gray-200 hover:text-white hover:bg-slate-700 rounded-full transition-colors duration-200"
                        title="Listen to your examples"
                      >
                        <SpeakerWaveIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="p-6 h-full flex flex-col">
                    {tenseData.examples && tenseData.examples.length > 0 ? (
                      <motion.ul
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-3 flex-grow"
                      >
                        {tenseData.examples.map((example, index) => (
                          <motion.li
                            key={index}
                            variants={itemVariants}
                            className="p-3 border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex">
                                <div className="bg-orange-100 text-orange-700 rounded-full flex-shrink-0 w-6 h-6 flex items-center justify-center mr-2 mt-0.5">
                                  {index + 1}
                                </div>
                                <p className="text-gray-800">
                                  {example.example_text}
                                </p>
                              </div>
                              <span
                                className={`capitalize  text-sm rounded-md py-1 px-2 ${
                                  example.sentence_type === "affirmative"
                                    ? "bg-green-200 text-green-800"
                                    : example.sentence_type === "negative"
                                    ? "bg-red-200 text-red-800"
                                    : "bg-blue-200 text-blue-800"
                                }`}
                              >
                                {example.sentence_type}
                              </span>
                            </div>
                          </motion.li>
                        ))}
                      </motion.ul>
                    ) : (
                      <div className="text-center py-8 text-gray-500 flex-grow flex flex-col justify-center">
                        <DocumentTextIcon className="w-12 h-12 mx-auto opacity-30 mb-3" />
                        <p>No examples added yet.</p>
                        <p className="text-sm">
                          Add your own examples to enhance your learning!
                        </p>
                      </div>
                    )}

                    {!showUploadForm && (
                      <button
                        onClick={() => setShowUploadForm(true)}
                        className="mt-6 w-full inline-flex items-center justify-center bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                      >
                        <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Your
                        Example
                      </button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Upload Form or Progress Card */}
              <div>
                {showUploadForm ? (
                  <Card className="shadow-lg overflow-hidden border border-slate-200 h-full">
                    <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-white">
                        Add Example
                      </h2>
                      <button
                        onClick={() => setShowUploadForm(false)}
                        className="p-1.5 text-gray-300 hover:text-white hover:bg-slate-700 rounded-full transition-colors duration-200"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="p-6">
                      <form onSubmit={handleSubmit}>
                        {errorMessage && (
                          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {errorMessage}
                          </div>
                        )}

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Example Sentence
                          </label>
                          <textarea
                            value={formData.sentence}
                            onChange={handleTextInput}
                            name="sentence"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            rows="3"
                            placeholder="Type your example sentence here..."
                          ></textarea>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">
                              Type
                            </label>
                            <select
                              value={formData.sentence_type || "affirmative"}
                              name="sentence_type"
                              onChange={handleTextInput}
                              className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                            >
                              <option value="affirmative">Affirmative</option>
                              <option value="negative">Negative</option>
                              <option value="interrogative">
                                Interrogative
                              </option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-10">
                          <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                          >
                            Submit Example{" "}
                            <PencilSquareIcon className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Card>
                ) : (
                  <Card className="shadow-lg border border-slate-200 overflow-hidden h-full">
                    <div className="bg-slate-800 px-6 py-4">
                      <h2 className="text-xl font-bold text-white">
                        Your Progress
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="mb-6">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">
                            Quiz Score
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {quizScore.highestscore}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-orange-500 h-2.5 rounded-full"
                            style={{ width: `${quizScore.highestscore}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">
                          Next Steps
                        </h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <div className="bg-orange-100 p-1 rounded-full mr-2 mt-0.5">
                              <CheckCircleIcon className="w-4 h-4 text-orange-700" />
                            </div>
                            <p className="text-sm text-gray-600">
                              Complete the quiz for this course
                            </p>
                          </li>
                          <li className="flex items-start">
                            <div className="bg-orange-100 p-1 rounded-full mr-2 mt-0.5">
                              <CheckCircleIcon className="w-4 h-4 text-orange-700" />
                            </div>
                            <p className="text-sm text-gray-600">
                              Add at least 3 practice examples
                            </p>
                          </li>
                          <li className="flex items-start">
                            <div className="bg-orange-100 p-1 rounded-full mr-2 mt-0.5">
                              <CheckCircleIcon className="w-4 h-4 text-orange-700" />
                            </div>
                            <p className="text-sm text-gray-600">
                              Review your mistakes from previous quizzes
                            </p>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PageCourse;
