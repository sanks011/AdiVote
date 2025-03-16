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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/">
          <Button 
            variant="ghost" 
            className="mb-6 text-gray-600 hover:text-[#33CC33] transition-colors duration-200 group flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:translate-x-[-4px] transition-transform duration-300" />
            Back to Home
          </Button>
        </Link>
      
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
        >
          <motion.div 
            variants={itemVariants} 
            className="flex items-center gap-6 mb-10 pb-6 border-b border-gray-100"
          >
            <div className="p-4 rounded-2xl bg-[#33CC33]/10 transform hover:scale-110 transition-transform duration-300">
              <Lock className="h-8 w-8 text-[#33CC33]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#33CC33] to-[#2ecc71] bg-clip-text text-transparent mb-2">
                Privacy Policy
              </h1>
              <p className="text-gray-500">Last Updated: March 16, 2025</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="prose max-w-none text-gray-700">
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">1.</span> Introduction
              </h2>
              <p className="mb-4">
                Welcome to AdiVote ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our voting platform.
              </p>
            </div>
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">2.</span> 
                Information We Collect
                <Eye className="h-5 w-5 text-[#33CC33]" />
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
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">3.</span> How We Use Your Information
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
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">4.</span> Data Security
                <Shield className="h-5 w-5 text-[#33CC33]" />
              </h2>
              <p>
                We implement reasonable security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the internet or electronic storage is 100% secure.
              </p>
            </div>
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">5.</span> Data Retention
                <Clock className="h-5 w-5 text-[#33CC33]" />
              </h2>
              <p>
                We retain your information only as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law or to resolve disputes.
              </p>
            </div>
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">6.</span> Your Rights
              </h2>
              <p>
                You have the right to access, correct, or delete your personal information. If you wish to exercise these rights, please contact us at <a href="mailto:sahnik.biswas@stu.adamasuniversity.ac.in" className="text-[#33CC33] hover:underline">sahnik.biswas@stu.adamasuniversity.ac.in</a>.
              </p>
            </div>
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">7.</span> Changes to This Privacy Policy
              </h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </div>
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">8.</span> Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at <a href="mailto:sahnik.biswas@stu.adamasuniversity.ac.in" className="text-[#33CC33] hover:underline">sahnik.biswas@stu.adamasuniversity.ac.in</a>.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants} 
            className="mt-12 pt-6 border-t border-gray-100 text-center"
          >
            <p className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
              © 2025 AdiVote. All rights reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;