import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
              At SyntaxMap, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our language learning platform.
            </p>
            <p className="text-gray-600">
              Please read this Privacy Policy carefully. By accessing or using our platform, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our platform.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-600 mb-4">
              We collect personal information that you voluntarily provide to us when you register on our platform, express interest in obtaining information about us or our products, or otherwise contact us. The personal information we collect may include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Name and contact information (email address, phone number)</li>
              <li>Account credentials (username and password)</li>
              <li>Profile information (educational background, language proficiency)</li>
              <li>Payment information (processed through secure third-party payment processors)</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Data</h3>
            <p className="text-gray-600 mb-4">
              We automatically collect certain information when you visit, use, or navigate our platform. This information may include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Device and browser information (IP address, browser type, device type)</li>
              <li>Usage patterns (pages visited, time spent on pages, learning activity)</li>
              <li>Performance data (quiz results, completion rates, areas of difficulty)</li>
              <li>Log data (access times, features used, clicks and other interactions)</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>To provide and maintain our platform</li>
              <li>To personalize your learning experience</li>
              <li>To process payments and manage your account</li>
              <li>To improve our platform and develop new features</li>
              <li>To analyze usage patterns and optimize user experience</li>
              <li>To communicate with you regarding updates, support, and promotional offers</li>
              <li>To protect our platform against fraudulent or illegal activity</li>
              <li>To comply with legal obligations</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sharing Your Information</h2>
            <p className="text-gray-600 mb-4">
              We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li><strong>With Service Providers:</strong> We may share your information with third-party vendors who provide services on our behalf, such as payment processing, data analysis, email delivery, and customer service.</li>
              <li><strong>With Educational Partners:</strong> If you are accessing our platform through an educational institution, we may share progress and performance data with your instructor or institution.</li>
              <li><strong>With Your Consent:</strong> We may share your information when you have given us specific consent to do so.</li>
              <li><strong>Business Transfers:</strong> We may share your information in connection with a merger, sale of company assets, financing, or acquisition.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information where required by law or to protect our rights or the rights of others.</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 mb-4">
              We use cookies, web beacons, and similar tracking technologies to collect and track information about your browsing activities on our platform. These technologies help us deliver a better and more personalized service, analyze usage patterns, and measure the effectiveness of our features.
            </p>
            <p className="text-gray-600 mb-4">
              You can set your browser to refuse all or some browser cookies or to alert you when cookies are being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
            </p>
            <p className="text-gray-600">
              For more information about our use of cookies, please see our <Link to="/cookie-policy" className="text-orange-600 hover:text-orange-800">Cookie Policy</Link>.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600 mb-4">
              We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
            <p className="text-gray-600">
              We maintain security measures including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Encryption of sensitive data</li>
              <li>Regular security assessments</li>
              <li>Access controls for our employees and contractors</li>
              <li>Secure data storage practices</li>
              <li>Regular backups of platform data</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
            <p className="text-gray-600 mb-4">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li><strong>Right to Access:</strong> You have the right to request copies of your personal information.</li>
              <li><strong>Right to Rectification:</strong> You have the right to request that we correct inaccurate information about you.</li>
              <li><strong>Right to Erasure:</strong> You have the right to request that we delete your personal information in certain circumstances.</li>
              <li><strong>Right to Restriction of Processing:</strong> You have the right to request that we restrict the processing of your personal information in certain circumstances.</li>
              <li><strong>Right to Data Portability:</strong> You have the right to request that we transfer your personal information to another organization or to you.</li>
              <li><strong>Right to Object:</strong> You have the right to object to our processing of your personal information in certain circumstances.</li>
            </ul>
            <p className="text-gray-600">
              To exercise any of these rights, please contact us using the information provided at the end of this Privacy Policy.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-600 mb-4">
              Our platform is not intended for children under the age of 13 without parental consent. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
            <p className="text-gray-600">
              For educational institutions using our platform for students under 13, we comply with all applicable laws regarding children's privacy, including the Children's Online Privacy Protection Act (COPPA) in the United States.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-600 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
            <p className="text-gray-600">
              You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
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
            By using our platform, you acknowledge that you have read and understand this Privacy Policy.
          </p>
          <div className="mt-4">
            <Link to="/terms-of-service" className="text-orange-600 hover:text-orange-800 text-sm mr-4">Terms of Service</Link>
            <Link to="/cookie-policy" className="text-orange-600 hover:text-orange-800 text-sm">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;