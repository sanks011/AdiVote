import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Shield, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
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
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6 text-gray-600 hover:text-[#33CC33] transition-colors duration-200 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-2px] transition-transform duration-200" />
            Back to Home
          </Button>
        </Link>
      
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100"
        >
          <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
            <div className="p-3 rounded-full bg-[#33CC33]/10">
              <Lock className="h-6 w-6 text-[#33CC33]" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#33CC33] to-[#2ecc71] bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-gray-500 text-sm">Last Updated: March 16, 2025</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="prose max-w-none text-gray-700">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">1.</span> Introduction
              </h2>
              <p className="mb-4">
                Welcome to AdiVote ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our voting platform.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">2.</span> Information We Collect
                <Eye className="h-4 w-4 text-[#33CC33] ml-1" />
              </h2>
              <p className="mb-3">
                We collect information that you provide directly to us when you:
              </p>
              <ul className="space-y-2 pl-6 mb-4">
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Create an account or profile
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Participate in elections
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Submit votes
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Communicate with us
                </li>
              </ul>
              <p>
                This information may include your name, email address, student ID, class/department information, and authentication details.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">3.</span> How We Use Your Information
              </h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="space-y-2 pl-6 mb-4">
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Verify your identity and eligibility to vote
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Enable your participation in elections
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Process and validate your votes
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Prevent duplicate voting or fraudulent activity
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Maintain the security and integrity of our platform
                </li>
                <li className="flex items-start">
                  <span className="text-[#33CC33] mr-2">•</span>
                  Communicate important information about elections
                </li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">4.</span> Data Security
                <Shield className="h-4 w-4 text-[#33CC33] ml-1" />
              </h2>
              <p>
                We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">5.</span> Data Retention
                <Clock className="h-4 w-4 text-[#33CC33] ml-1" />
              </h2>
              <p>
                We retain your information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law or to resolve disputes.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">6.</span> Your Rights
              </h2>
              <p>
                You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact us at <a href="mailto:sahnik.biswas@stu.adamasuniversity.ac.in" className="text-[#33CC33] hover:underline">sahnik.biswas@stu.adamasuniversity.ac.in</a>.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">7.</span> Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">8.</span> Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:sahnik.biswas@stu.adamasuniversity.ac.in" className="text-[#33CC33] hover:underline">sahnik.biswas@stu.adamasuniversity.ac.in</a>.
              </p>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-10 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">© 2025 AdiVote. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;