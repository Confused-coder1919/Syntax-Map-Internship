import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  HomeIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon, 
  PuzzlePieceIcon, 
  ClipboardDocumentCheckIcon,
  QuestionMarkCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { getStoredRole } from "../../authority";
import { motion } from "framer-motion";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
    
    // Check user role
    const role = getStoredRole();
    if (role === 1) {
      setUserRole("Administrator");
    } else if (role === 2) {
      setUserRole("Teacher");
    } else {
      setUserRole("User");
    }
    
    // Get user name from localStorage - we need to check directly for user_name
    const storedUserName = localStorage.getItem("user_name");
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // Fallback: Get from token data if available
      const token = localStorage.getItem("jstoken");
      if (token) {
        try {
          // Try to extract user info from token
          const tokenData = token.split(".")[1];
          if (tokenData) {
            const decoded = JSON.parse(atob(tokenData));
            if (decoded.user_name) {
              setUserName(decoded.user_name);
            } else if (decoded.sub) {
              // If we have email in sub, use it
              setUserName(decoded.sub);
            } else {
              setUserName("Admin User");
            }
          } else {
            setUserName("Admin User");
          }
        } catch (error) {
          console.error("Error parsing token data:", error);
          setUserName("Admin User");
        }
      } else {
        setUserName("Admin User");
      }
    }
    
    // Mock notifications (in a real app, this would fetch from an API)
    setNotifications([
      { 
        id: 1, 
        title: "New Role Request", 
        message: "Jane Wilson requested to become a Teacher", 
        time: "10 min ago", 
        read: false 
      },
      { 
        id: 2, 
        title: "System Update", 
        message: "SyntaxMap has been updated to version 2.5.0", 
        time: "1 hour ago", 
        read: true 
      },
      { 
        id: 3, 
        title: "Quiz Completed", 
        message: "15 students completed the Present Continuous quiz", 
        time: "3 hours ago", 
        read: true 
      }
    ]);
    
  }, [location.pathname]);

  const navigation = [
    { 
      name: "Dashboard", 
      href: "/admincontrolpanel", 
      icon: HomeIcon, 
      current: location.pathname === "/admincontrolpanel" 
    },
    { 
      name: "Tense Management", 
      href: "/admintensemap", 
      icon: DocumentTextIcon, 
      current: location.pathname === "/admintensemap" 
    },
    { 
      name: "Quiz Builder", 
      href: "/quizbuilder", 
      icon: PuzzlePieceIcon, 
      current: location.pathname === "/quizbuilder" 
    },
    { 
      name: "User Management", 
      href: "/adminusers", 
      icon: UsersIcon, 
      current: location.pathname === "/adminusers" 
    },
    { 
      name: "Role Requests", 
      href: "/adminrolerequests", 
      icon: ClipboardDocumentCheckIcon, 
      current: location.pathname === "/adminrolerequests" 
    },
    { 
      name: "Analytics", 
      href: "/adminanalytics", 
      icon: ChartBarIcon, 
      current: location.pathname === "/adminanalytics" 
    }
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("jstoken");
      localStorage.removeItem("user_data");
      window.location.href = "/";
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div className="min-h-screen bg-gray-100" style={{ display: "flex",frexwrap:"wrap" }}>
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          <motion.div
            className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
              isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={toggleMobileMenu}
            initial={false}
            animate={{ opacity: isMobileMenuOpen ? 1 : 0 }}
          />

          <motion.div
            className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition ease-in-out duration-300 transform ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`}
            initial={false}
            animate={{ x: isMobileMenuOpen ? 0 : "-100%" }}
          >
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Close sidebar</span>
                <svg
                  className="h-6 w-6 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <h1 className="text-xl font-bold text-indigo-600">
                  SyntaxMap Admin
                </h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      item.current
                        ? "bg-indigo-100 text-indigo-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-4 h-6 w-6 ${
                        item.current
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <button
                onClick={handleLogout}
                className="flex-shrink-0 group block"
              >
                <div className="flex items-center">
                  <div>
                    <UserCircleIcon className="inline-block h-10 w-10 rounded-full text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                      {userName}
                    </p>
                    <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                      Logout
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
          
          <div className="flex-shrink-0 w-14">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-indigo-600">SyntaxMap Admin</h1>
            </div>
            <nav
              className="mt-5 flex-1 flex flex-col overflow-y-auto"
              aria-label="Sidebar"
            >
              <div className="px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      item.current
                        ? "bg-indigo-100 text-indigo-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-6 w-6 ${
                        item.current
                          ? "text-indigo-600"
                          : "text-gray-400 group-hover:text-gray-500"
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="mt-auto pt-10">
                <div className="px-2 space-y-1">
                  <button
                    onClick={handleLogout}
                    className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left"
                  >
                    <ArrowLeftOnRectangleIcon
                      className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Logout
                  </button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center lg:hidden">
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  >
                    <span className="sr-only">Open sidebar</span>
                    <svg
                      className="h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:flex lg:items-center lg:ml-6 lg:space-x-4">
                  <Link
                    to="/"
                    className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100"
                  >
                    View Public Site
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 relative">
                </div>

                <div className="ml-4 flex items-center md:ml-6">
                  <div className="hidden md:block">
                    <span className="text-sm font-medium text-gray-500 mr-2">
                      {userRole}:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {userName}
                    </span>
                  </div>
                  <div className="ml-3 relative">
                    <div className="flex items-center">
                      <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto focus:outline-none" >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;