import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ArrowLeft, ShieldAlert, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
              <FileText className="h-8 w-8 text-[#33CC33]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#33CC33] to-[#2ecc71] bg-clip-text text-transparent mb-2">
                Terms of Service
              </h1>
              <p className="text-gray-500">Last Updated: March 16, 2025</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="prose max-w-none text-gray-700">
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">1.</span> 
                Acceptance of Terms
              </h2>
              <p className="text-lg leading-relaxed">
                By accessing or using the AdiVote platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our platform.
              </p>
            </div>
            
            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">2.</span>
                Eligibility
                <UserCheck className="h-5 w-5 text-[#33CC33]" />
              </h2>
              <p className="text-lg leading-relaxed">
                You must be a currently enrolled student or authorized faculty/staff member of Adamas University to use the AdiVote platform. You must register with your official university email address.
              </p>
            </div>

            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">3.</span>
                User Accounts
              </h2>
              <p className="text-lg leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate our policies.
              </p>
            </div>

            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">4.</span>
                Voting Rules
              </h2>
              <p className="text-lg mb-4">The following rules apply to all elections on AdiVote:</p>
              <ul className="space-y-3 pl-6">
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">You may only vote once in each election for which you are eligible</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">You must not attempt to manipulate the voting process</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">You must not share your account with others to vote on their behalf</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">You must not use automated methods to cast votes</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">You must respect the confidentiality of the voting process</span>
                </li>
              </ul>
            </div>

            <div className="mb-12 hover:bg-slate-50/50 p-6 rounded-xl transition-colors duration-200">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-3 mb-4">
                <span className="text-[#33CC33] bg-[#33CC33]/10 p-2 rounded-lg">5.</span>
                Prohibited Activities
                <ShieldAlert className="h-5 w-5 text-[#33CC33]" />
              </h2>
              <p className="text-lg mb-4">Users are prohibited from:</p>
              <ul className="space-y-3 pl-6">
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">Attempting to interfere with the proper functioning of the platform</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">Attempting to gain unauthorized access to other user accounts or voting data</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">Using the platform for any unlawful purpose</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">Uploading malicious code or attempting to compromise system security</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">Engaging in harassment or abusive behavior</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-[#33CC33] mr-3 group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-lg">Violating the privacy of other users</span>
                </li>
              </ul>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">6.</span> Intellectual Property
              </h2>
              <p>
                All content, features, and functionality of the AdiVote platform are owned by AdiVote and are protected by intellectual property laws. You may not reproduce, distribute, modify, or create derivative works based on our platform without express permission.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">7.</span> Disclaimer
                <AlertCircle className="h-4 w-4 text-[#33CC33] ml-1" />
              </h2>
              <p>
                The AdiVote platform is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the platform will be error-free or uninterrupted.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">8.</span> Limitation of Liability
              </h2>
              <p>
                AdiVote and its team will not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
              </p>
            </div>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">9.</span> Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Your continued use of AdiVote after changes are posted constitutes your acceptance of the updated terms.
              </p>
            </div>
            
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <span className="text-[#33CC33]">10.</span> Contact Us
              </h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at <a href="mailto:sahnik.biswas@stu.adamasuniversity.ac.in" className="text-[#33CC33] hover:underline">sahnik.biswas@stu.adamasuniversity.ac.in</a>.
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

export default TermsOfService;