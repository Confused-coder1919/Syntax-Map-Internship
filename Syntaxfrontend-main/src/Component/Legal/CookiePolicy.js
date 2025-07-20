import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const CookiePolicy = () => {
  // Last updated date
  const lastUpdated = "May 1, 2025";

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdated}
          </p>
        </motion.div>

        <motion.div 
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 mb-4">
              This Cookie Policy explains how SyntaxMap ("we", "us", or "our") uses cookies, web beacons, pixels, and similar technologies (collectively referred to as "cookies") on our website and learning platform (the "Platform").
            </p>
            <p className="text-gray-600">
              By using our Platform, you consent to the use of cookies in accordance with this policy. If you do not accept the use of cookies, please disable them as described in this policy or refrain from using our Platform.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you browse websites. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how the site is being used.
            </p>
            <p className="text-gray-600">
              Other similar technologies such as web beacons, clear GIFs, pixel tags, and local storage also store and retrieve data on devices. In this policy, we refer to all of these technologies as "cookies."
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Types of Cookies We Use</h2>
            <p className="text-gray-600 mb-4">
              We use different types of cookies for different purposes:
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Essential Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies are necessary for the Platform to function properly and cannot be switched off in our systems. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences, logging in, or filling in forms. These cookies do not store any personally identifiable information.
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>Authentication cookies that maintain your logged-in status</li>
              <li>Security cookies that help detect and prevent security risks</li>
              <li>Session cookies that enable core site functionality</li>
              <li>Load balancing cookies to ensure the site's stability</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Preference Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies enable the Platform to remember choices you make and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages.
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>Language preference cookies</li>
              <li>Customization cookies that remember your settings</li>
              <li>Interface customization cookies</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Analytical Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies help us understand how visitors interact with our Platform by collecting and reporting information anonymously. They allow us to recognize and count the number of visitors and to see how visitors move around our Platform when they are using it.
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-600 space-y-2">
              <li>Google Analytics cookies</li>
              <li>Mixpanel cookies for feature usage analytics</li>
              <li>Hotjar cookies for heatmaps and session recordings</li>
              <li>First-party analytics cookies to track user engagement</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Marketing Cookies</h3>
            <p className="text-gray-600 mb-4">
              These cookies may be set through our Platform by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other websites.
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Facebook Pixel for conversion tracking</li>
              <li>Google Ads conversion tracking cookies</li>
              <li>LinkedIn Insight Tag</li>
              <li>Retargeting cookies</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How Long Do Cookies Stay on Your Device?</h2>
            <p className="text-gray-600 mb-4">
              Cookies can be classified according to how long they remain on your device:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li><strong>Session Cookies:</strong> These cookies are temporary and are deleted from your device when you close your web browser.</li>
              <li><strong>Persistent Cookies:</strong> These cookies remain on your device for a specified period or until you delete them manually.</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Management</h2>
            <p className="text-gray-600 mb-4">
              You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can impact your user experience and may make parts of our Platform less functional.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Browser Settings</h3>
            <p className="text-gray-600 mb-4">
              Most web browsers allow some control of cookies through browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800">www.aboutcookies.org</a> or <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800">www.allaboutcookies.org</a>.
            </p>
            <p className="text-gray-600 mb-6">
              To opt out of being tracked by Google Analytics across all websites, visit <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-800">https://tools.google.com/dlpage/gaoptout</a>.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Our Cookie Consent Tool</h3>
            <p className="text-gray-600 mb-4">
              When you first visit our Platform, you will be shown a cookie banner that allows you to accept or decline non-essential cookies. You can change your preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors duration-200">
                Manage Cookie Preferences
              </button>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Do Not Track Signals</h3>
            <p className="text-gray-600">
              Some browsers have a "Do Not Track" feature that allows you to tell websites that you do not want to have your online activities tracked. At this time, we do not respond to browser "Do Not Track" signals, but we do provide you the option to opt out of interest-based advertising as described above.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600 mb-4">
              We may allow third parties to place cookies on your device through our Platform to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Help us understand how our Platform is being used</li>
              <li>Help us understand how effective our marketing campaigns are</li>
              <li>Provide you with social media features</li>
              <li>Serve you relevant advertising on other websites</li>
            </ul>
            <p className="text-gray-600">
              These third parties may collect information about your online activities over time and across different websites. They may not respond to "Do Not Track" signals from your browser. We do not control these third-party cookies and recommend that you check the privacy policies of these third parties to understand how they use your information.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies Used on Our Platform</h2>
            <p className="text-gray-600 mb-4">
              Here is a detailed list of some of the key cookies used on our Platform:
            </p>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_sm_session</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SyntaxMap</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Used to maintain user sessions</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Session</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Essential</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_sm_auth</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SyntaxMap</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Authentication token</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">30 days</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Essential</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_sm_preferences</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">SyntaxMap</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Stores user preferences</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1 year</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Preference</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_ga</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Used to distinguish users</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 years</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Analytical</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_gid</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Google Analytics</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Used to distinguish users</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24 hours</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Analytical</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">_fbp</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Facebook</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Used by Facebook for advertising purposes</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3 months</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Marketing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Our Cookie Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last Updated" date at the top of this policy.
            </p>
            <p className="text-gray-600">
              You are advised to review this Cookie Policy periodically for any changes. Changes to this Cookie Policy are effective when they are posted on this page.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about our Cookie Policy, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 font-medium">SyntaxMap, Inc.</p>
              <p className="text-gray-600">123 Learning Avenue</p>
              <p className="text-gray-600">San Francisco, CA 94105</p>
              <p className="text-gray-600">Email: privacy@syntaxmap.com</p>
              <p className="text-gray-600">Phone: (555) 123-4567</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-500 text-sm">
            By using our Platform, you consent to the use of cookies in accordance with this policy.
          </p>
          <div className="mt-4">
            <Link to="/privacy-policy" className="text-orange-600 hover:text-orange-800 text-sm mr-4">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-orange-600 hover:text-orange-800 text-sm">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;