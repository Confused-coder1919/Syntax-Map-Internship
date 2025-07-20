import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const TermsOfService = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 mb-4">
              Welcome to SyntaxMap. These Terms of Service ("Terms") govern your access to and use of the SyntaxMap website, mobile applications, and services (collectively, the "Platform").
            </p>
            <p className="text-gray-600 mb-4">
              Please read these Terms carefully. By accessing or using our Platform, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Platform.
            </p>
            <p className="text-gray-600">
              We may modify these Terms at any time. If we do so, we will notify you by updating the "Last Updated" date at the top of this page. Your continued use of the Platform after any such update constitutes your acceptance of the revised Terms.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Access and Account Registration</h2>
            <p className="text-gray-600 mb-4">
              To access certain features of the Platform, you may need to register for an account. When you register, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your account credentials secure</li>
              <li>Not share your account with others</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
            </ul>
            <p className="text-gray-600">
              We reserve the right to suspend or terminate your account if any information provided during registration or thereafter proves to be inaccurate, not current, or incomplete.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Subscription and Payments</h2>
            <p className="text-gray-600 mb-4">
              3.1 <strong>Free Trial.</strong> We may offer free trials to new users. When the trial period ends, your account will automatically convert to a paid subscription unless you cancel before the trial ends.
            </p>
            <p className="text-gray-600 mb-4">
              3.2 <strong>Subscription Fees.</strong> Access to certain content and features on the Platform requires a paid subscription. Subscription fees are clearly displayed before you complete your purchase. By subscribing, you authorize us to charge the applicable fees to your selected payment method.
            </p>
            <p className="text-gray-600 mb-4">
              3.3 <strong>Automatic Renewal.</strong> Unless you cancel your subscription, it will automatically renew at the end of your billing period, and your payment method will be charged the then-current rate.
            </p>
            <p className="text-gray-600 mb-4">
              3.4 <strong>Cancellation.</strong> You may cancel your subscription at any time through your account settings or by contacting our customer support. If you cancel, you may continue to use the subscription features until the end of your current billing period, but you will not receive a refund for any fees already paid.
            </p>
            <p className="text-gray-600">
              3.5 <strong>Price Changes.</strong> We may change our subscription fees at any time. If we do so, we will provide notice of the change through the Platform or by email. Price changes will take effect at the start of the next subscription period.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Content</h2>
            <p className="text-gray-600 mb-4">
              4.1 <strong>Responsibility for Content.</strong> You are solely responsible for any content that you submit, post, or display on the Platform ("User Content"). You represent and warrant that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>You own or have the necessary rights to use and authorize others to use your User Content</li>
              <li>Your User Content does not violate the privacy, publicity, intellectual property, or other rights of any person or entity</li>
              <li>Your User Content does not contain any material that is defamatory, obscene, offensive, or otherwise objectionable</li>
            </ul>
            <p className="text-gray-600 mb-4">
              4.2 <strong>License to User Content.</strong> By submitting User Content to the Platform, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform your User Content in connection with the Platform and our business.
            </p>
            <p className="text-gray-600">
              4.3 <strong>Removal of Content.</strong> We reserve the right to remove any User Content that violates these Terms or that we find objectionable for any reason, without prior notice.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
            <p className="text-gray-600 mb-4">
              5.1 <strong>Our Content.</strong> The Platform and its entire content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by SyntaxMap, its licensors, or other providers and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
            </p>
            <p className="text-gray-600 mb-4">
              5.2 <strong>Limited License.</strong> We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform for your personal, non-commercial use in accordance with these Terms.
            </p>
            <p className="text-gray-600">
              5.3 <strong>Restrictions.</strong> You may not:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Copy, modify, distribute, sell, or lease any part of the Platform</li>
              <li>Reverse engineer or attempt to extract the source code of the Platform</li>
              <li>Remove any copyright, trademark, or other proprietary notices</li>
              <li>Use the Platform for any commercial purpose without our prior written consent</li>
              <li>Use the Platform in any manner that could damage, disable, overburden, or impair it</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Prohibited Conduct</h2>
            <p className="text-gray-600 mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Violate any applicable law or regulation</li>
              <li>Impersonate any person or entity, or falsely state or misrepresent your affiliation with a person or entity</li>
              <li>Engage in any activity that exploits, harms, or threatens to harm minors</li>
              <li>Send spam or unsolicited messages</li>
              <li>Upload or transmit viruses, malware, or other malicious code</li>
              <li>Interfere with or disrupt the integrity or performance of the Platform</li>
              <li>Attempt to gain unauthorized access to the Platform or related systems or networks</li>
              <li>Use any robot, spider, or other automated device to access the Platform</li>
              <li>Bypass measures we may use to prevent or restrict access to the Platform</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600 mb-4">
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
            <p className="text-gray-600 mb-4">
              WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE PLATFORM OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
            <p className="text-gray-600">
              WE MAKE NO GUARANTEES REGARDING THE ACCURACY, RELIABILITY, COMPLETENESS, OR TIMELINESS OF THE PLATFORM OR ANY CONTENT THEREIN.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL SYNTAXMAP, ITS DIRECTORS, EMPLOYEES, PARTNERS, AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE PLATFORM</li>
              <li>ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE PLATFORM</li>
              <li>ANY CONTENT OBTAINED FROM THE PLATFORM</li>
              <li>UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT</li>
            </ul>
            <p className="text-gray-600">
              IN ANY EVENT, OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THESE TERMS OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO SYNTAXMAP DURING THE TWELVE (12) MONTH PERIOD PRIOR TO THE EVENT GIVING RISE TO THE LIABILITY.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-600">
              You agree to indemnify, defend, and hold harmless SyntaxMap, its directors, officers, employees, agents, affiliates, and partners from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-600 space-y-2">
              <li>Your use of and access to the Platform</li>
              <li>Your violation of any term of these Terms</li>
              <li>Your violation of any third-party right, including without limitation any copyright, property, or privacy right</li>
              <li>Any claim that your User Content caused damage to a third party</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-600 mb-4">
              We may terminate or suspend your access to all or part of the Platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p className="text-gray-600">
              Upon termination, your right to use the Platform will immediately cease. All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-600">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law principles. Any legal action or proceeding arising out of or relating to these Terms or your use of the Platform shall be exclusively brought in the federal or state courts located in San Francisco County, California, and you consent to the personal jurisdiction and venue of such courts.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Dispute Resolution</h2>
            <p className="text-gray-600 mb-4">
              12.1 <strong>Informal Resolution.</strong> Before filing a claim against SyntaxMap, you agree to try to resolve the dispute informally by contacting us. We'll try to resolve the dispute informally by contacting you via email.
            </p>
            <p className="text-gray-600 mb-4">
              12.2 <strong>Arbitration.</strong> If a dispute is not resolved within 30 days of submission, you and SyntaxMap agree to resolve the dispute through binding arbitration, on an individual basis, in accordance with the American Arbitration Association's rules.
            </p>
            <p className="text-gray-600">
              12.3 <strong>Class Action Waiver.</strong> You agree that any arbitration or proceeding shall be limited to the dispute between us and you individually. To the fullest extent permitted by law, (a) no arbitration or proceeding shall be joined with any other; (b) there is no right or authority for any dispute to be arbitrated or resolved on a class action basis; and (c) there is no right or authority for any dispute to be brought in a purported representative capacity.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Miscellaneous</h2>
            <p className="text-gray-600 mb-4">
              13.1 <strong>Entire Agreement.</strong> These Terms, together with our Privacy Policy and any other agreements expressly incorporated by reference herein, constitute the entire agreement between you and SyntaxMap concerning the Platform.
            </p>
            <p className="text-gray-600 mb-4">
              13.2 <strong>Waiver.</strong> Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
            </p>
            <p className="text-gray-600 mb-4">
              13.3 <strong>Severability.</strong> If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect.
            </p>
            <p className="text-gray-600">
              13.4 <strong>Assignment.</strong> You may not assign or transfer these Terms, by operation of law or otherwise, without our prior written consent. Any attempt by you to assign or transfer these Terms without such consent will be null and of no effect. We may assign or transfer these Terms, at our sole discretion, without restriction.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 font-medium">SyntaxMap, Inc.</p>
              <p className="text-gray-600">123 Learning Avenue</p>
              <p className="text-gray-600">San Francisco, CA 94105</p>
              <p className="text-gray-600">Email: legal@syntaxmap.com</p>
              <p className="text-gray-600">Phone: (555) 123-4567</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="max-w-4xl mx-auto mt-8 text-center">
          <p className="text-gray-500 text-sm">
            By using our platform, you acknowledge that you have read and understand these Terms of Service.
          </p>
          <div className="mt-4">
            <Link to="/privacy-policy" className="text-orange-600 hover:text-orange-800 text-sm mr-4">Privacy Policy</Link>
            <Link to="/cookie-policy" className="text-orange-600 hover:text-orange-800 text-sm">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;