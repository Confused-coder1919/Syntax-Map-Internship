import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import VocabularyLookupWrapper from '../VocabularyLookupWrapper';
import { useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    // Check if the user is logged in
    if (location.pathname == "/login_register" || location.pathname === "/") {
      return
    }
    else {
      const token = localStorage.getItem("jstoken");
      if (!token) {
        // User is logged in, you can perform actions here if needed
        history.push("/login_register"); // Redirect to the home page
      }
    }
  }, [location]);
  const footerLinks = {
    resources: [
      { name: 'Tense Map', path: '/tensemap' },
      { name: 'Quizzes', path: '/quiz' },
      { name: 'Notepad', path: '/notepad' },
    ],
    support: [
      { name: 'Help Center', path: '/help-center' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Feedback', path: '/feedback' }
    ],
    company: [
      { name: 'About Us', path: '/about' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Careers', path: '/careers' }
    ]
  };
  // Only wrap with vocabulary lookup for student (role 3) and guest (role 4) users
  const content = (localStorage.getItem("user_role") == 3 || localStorage.getItem("user_role") == 4) ? (
    <VocabularyLookupWrapper>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </VocabularyLookupWrapper>
  ) : (
    <main className="flex-grow container mx-auto px-4 py-8">
      {children}
    </main>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {content}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white" style={{ zIndex: "5" }}>
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 pt-12 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="mb-6">
              <Link to="/" className="flex items-center mb-4 group">
                <div className="bg-white p-1 rounded-full shadow-lg mr-2 transform group-hover:-translate-y-0.5 transition-transform duration-200">
                  <img
                    src="/logo192.png"
                    alt="SyntaxMap Logo"
                    className="h-8 w-8"
                  />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-orange-300 transition-colors duration-200">
                  SyntaxMap
                </span>
              </Link>
              <p className="text-gray-400 mb-4 text-sm">
                Your interactive platform for mastering English grammar and syntax.
                Learn faster with visual aids, targeted practice, and continuous progress tracking.
              </p>
              <div className="flex space-x-3 mt-4">
                {/* Social Media Icons */}
                {[
                  { icon: 'facebook', href: 'https://facebook.com', title: 'Follow us on Facebook' },
                  { icon: 'twitter', href: 'https://twitter.com', title: 'Follow us on Twitter' },
                  { icon: 'instagram', href: 'https://instagram.com', title: 'Follow us on Instagram' },
                  { icon: 'linkedin', href: 'https://linkedin.com', title: 'Connect with us on LinkedIn' }
                ].map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.title}
                    className="bg-gray-700 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <span className="sr-only">{social.title}</span>
                    {social.icon === 'facebook' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {social.icon === 'twitter' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                    )}
                    {social.icon === 'instagram' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {social.icon === 'linkedin' && (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Learning Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group"
                    >
                      <svg
                        className="h-4 w-4 mr-2 text-orange-500 transform transition-transform duration-200 group-hover:translate-x-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Support</h3>
              <ul className="space-y-2">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group"
                    >
                      <svg
                        className="h-4 w-4 mr-2 text-orange-500 transform transition-transform duration-200 group-hover:translate-x-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-orange-400 transition-colors duration-200 flex items-center group"
                    >
                      <svg
                        className="h-4 w-4 mr-2 text-orange-500 transform transition-transform duration-200 group-hover:translate-x-1"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="mt-10 pt-8 border-t border-gray-700">
            <div className="md:flex md:items-center md:justify-between">
              <div className="md:w-1/2 mb-6 md:mb-0">
                <h4 className="text-lg font-semibold text-white mb-2">Subscribe to Our Newsletter</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Stay updated with the latest grammar tips, lessons, and resources.
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-4 py-2 rounded-l-md bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 flex-grow"
                  />
                  <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-r-md transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* App Download Links - Fixed href attributes */}
              <div className="md:w-1/2 md:text-right">
                <h4 className="text-lg font-semibold text-white mb-2">Get our mobile app</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Learn on the go with our mobile application.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
                  <a
                    href="https://apps.apple.com/app/syntaxmap"
                    className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.928 19.97c-.088.06-.177.118-.266.175-1.405.879-2.25.536-3.361-.083-1.127-.628-2.152-.628-3.297-.013-1.104.595-1.674.717-2.398.628-.71-.088-1.34-.435-1.847-.923-2.566-2.504-2.757-7.362.465-10.707.89-.917 2.01-1.436 3.12-1.436 1.19 0 1.937.526 2.884.526.92 0 1.516-.526 2.884-.526 1.075 0 2.215.465 3.04 1.27-2.647 1.472-2.253 5.263.776 6.089zm-5.333-16.041c-2.475.228-4.071 2.283-3.9 4.743 1.103.036 2.084-.376 2.932-1.13.846-.748 1.405-1.777 1.346-3.055-.086-.249-.248-.498-.378-.558z" />
                    </svg>
                    <div>
                      <div className="text-xs">Download on the</div>
                      <div className="text-sm font-semibold">App Store</div>
                    </div>
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.syntaxmap"
                    className="inline-flex items-center bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4.312 3.877l7.536 4.384-1.752-3.046c-.072-.124-.152-.24-.248-.346-.944-1.042-2.604-1.114-3.648-.17s-1.114 2.604-.17 3.648l1.826 3.178-6.636 3.844c-.098.056-.188.122-.264.204-.944 1.04-.866 2.704.17 3.648s2.704.864 3.648-.172l6.584-7.248-4.336 7.522c-.072.124-.132.252-.174.388-.412 1.33.336 2.74 1.666 3.152s2.74-.336 3.15-1.666l.876-2.822.75-2.42c.056-.176.088-.36.1-.546l.216-5.158.292-.51c.072-.125.13-.254.176-.39.412-1.33-.336-2.742-1.666-3.152-.66-.204-1.344-.138-1.928.146-.113.056-.22.124-.318.202l-2.38 1.662-5.91-3.43c-.098-.056-.2-.104-.306-.142-1.332-.412-2.74.336-3.152 1.666s.334 2.74 1.666 3.152z" />
                    </svg>
                    <div>
                      <div className="text-xs">GET IT ON</div>
                      <div className="text-sm font-semibold">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 py-6">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} SyntaxMap. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;