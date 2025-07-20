import React, { useContext, useState, useEffect } from "react";
import { Link, useHistory, useLocation } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContext";

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const history = useHistory();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRole = localStorage.getItem("user_role");

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toggleUserMenu();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  // Check if link matches current path for active styling
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header
      className={`sticky top-0 w-full z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "bg-white shadow-sm py-2"
          : "bg-gradient-to-r from-orange-500 to-red-600 text-white py-2"
      }`}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-white rounded-full p-1.5 shadow-sm">
                <img
                  src="/logo192.png"
                  alt="SyntaxMap Logo"
                  className="h-6 w-6"
                />
              </div>
              <div className="flex flex-col">
                <span
                  className={`text-lg font-extrabold tracking-tight leading-none ${
                    scrolled
                      ? "bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                      : "text-white drop-shadow-sm"
                  }`}
                >
                  SyntaxMap
                </span>
                <span
                  className={`text-xs font-medium ${
                    scrolled ? "text-gray-600" : "text-orange-100"
                  }`}
                >
                  Master Grammar with Confidence
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - More compact */}
          <nav className="hidden lg:flex items-center">
            <div className="flex space-x-3">
              {[
                { title: "Home", path: "/" },
                { title: "Quiz", path: "/quiz" },
                { title: "Tense Map", path: "/tensemap" },
                { title: "Notepad", path: "/notepad" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 text-sm relative group ${
                    isActive(item.path)
                      ? scrolled
                        ? "font-semibold text-orange-600"
                        : "font-semibold text-white"
                      : scrolled
                      ? "text-gray-700 hover:text-orange-500"
                      : "text-white hover:text-orange-100"
                  }`}
                >
                  {item.title}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 transform origin-left transition-transform duration-300 ease-out ${
                      isActive(item.path)
                        ? scrolled
                          ? "bg-orange-500 scale-x-100"
                          : "bg-white scale-x-100"
                        : scrolled
                        ? "bg-orange-400 scale-x-0 group-hover:scale-x-100"
                        : "bg-white scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User Authentication */}
          <div className="flex items-center space-x-2">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className={`flex items-center space-x-1 px-2 py-1 text-sm font-medium ${
                    scrolled
                      ? "text-gray-700 hover:text-orange-500"
                      : "text-white hover:text-orange-100"
                  }`}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span>{currentUser.user_name || "User"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform duration-200 ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* User dropdown menu with animation */}
                <div
                  className={`absolute right-0 mt-1 w-55 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-in-out transform origin-top-right z-50 ${
                    userMenuOpen
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95 pointer-events-none"
                  }`}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  {/* User menu items */}
                  <div className="py-1" role="none">
                    <div className="px-4 py-2 border-b border-gray-100">
                      {/* <p className="text-sm font-medium text-gray-900">{currentUser.user_name}</p> */}
                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.user_email_address || "No email"}
                      </p>
                    </div>
                    <Link
                      to={
                        userRole == 1
                          ? "admincontrolpanel"
                          : userRole == 2
                          ? "/professor"
                          : userRole == 3
                          ? "/dashboard"
                          : "/guest"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-150"
                      role="menuitem"
                    >
                      <div
                        className="flex items-center"
                        onClick={toggleUserMenu}
                      >
                        <svg
                          className="mr-2 h-4 w-4 text-orange-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          ></path>
                        </svg>
                        Dashboard
                      </div>
                    </Link>
                    {/* More menu items */}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 border-t border-gray-100"
                      role="menuitem"
                    >
                      <div className="flex items-center">
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        Logout
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login_register"
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                    scrolled
                      ? "bg-orange-500 text-white"
                      : "bg-white text-orange-500"
                  }`}
                >
                  Sign In
                </Link>
              </>
            )}

            <Link
              to={currentUser && currentUser?.user_role ===1 ? "/admincontrolpanel" : currentUser?.user_role === 2 ? "/professor" : currentUser?.user_role === 3 ? "/dashboard" : "/login_register"}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm ${
                scrolled
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 transform transition-transform duration-300 hover:-translate-y-0.5"
                  : "bg-white text-orange-600 hover:bg-orange-50 transform transition-transform duration-300 hover:-translate-y-0.5"
              }`}
            >
              <span>{currentUser ? "Dashboard"  : "Get started"}</span>
              <svg
                className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className={`p-1 rounded-md focus:outline-none ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileMenuOpen ? (
                <svg
                  className="block h-5 w-5"
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
              ) : (
                <svg
                  className="block h-5 w-5"
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
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu, animated slide-in */}
        <div
          className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className={`px-2 pt-2 pb-3 space-y-1 border-t ${
              scrolled ? "border-gray-200" : "border-orange-400"
            } mt-3`}
          >
            {[
              { title: "Home", path: "/" },
              { title: "Quiz", path: "/quiz" },
              { title: "Tense Map", path: "/tensemap" },
              { title: "Notepad", path: "/notepad" },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2.5 rounded-md text-base relative ${
                  isActive(item.path)
                    ? scrolled
                      ? "bg-orange-50 text-orange-700 font-medium border-l-4 border-orange-500"
                      : "bg-white bg-opacity-20 text-white font-medium border-l-4 border-white"
                    : scrolled
                    ? "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                    : "text-white hover:bg-white hover:bg-opacity-10"
                }`}
              >
                {item.title}
              </Link>
            ))}

            {!currentUser && (
              <div className="pt-4 pb-2 border-t border-orange-400 flex flex-col space-y-2 sm:hidden">
                <Link
                  to="/login"
                  className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-all duration-200 ${
                    scrolled
                      ? "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                      : "text-white hover:bg-white hover:bg-opacity-10"
                  }`}
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`flex items-center px-3 py-2.5 rounded-md text-base font-medium transition-all duration-200 ${
                    scrolled
                      ? "bg-orange-500 text-white"
                      : "bg-white text-orange-500"
                  }`}
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    ></path>
                  </svg>
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-12"></div>
    </header>
  );
};

export default Header;
