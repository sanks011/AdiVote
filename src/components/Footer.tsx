import React from 'react';
import { useLocation } from 'react-router-dom';
import { HeartIcon, Vote, GithubIcon, LinkedinIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  
  // Don't show footer on admin login page or admin pages
  if (location.pathname === '/admin-login' || location.pathname.startsWith('/admin')) {
    return null;
  }

  const socialLinks = [
    { icon: <GithubIcon size={18} />, href: "#", label: "GitHub" },
    { icon: <LinkedinIcon size={18} />, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="mt-auto py-12 bg-gradient-to-br from-[#F3F6F8] to-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-[#33CC33]/30"
            style={{
              width: Math.random() * 6 + 4 + 'px',
              height: Math.random() * 6 + 4 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `pulse ${Math.random() * 4 + 2}s infinite ease-in-out`
            }}
          />
        ))}
      </div>
      
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#33CC33]/5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#33CC33]/5 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Vote className="h-6 w-6 mr-2 text-[#33CC33]" />
              <span className="font-bold text-xl text-[#33CC33]">AdiVote</span>
            </div>
            <p className="text-sm text-[#232323]/70 max-w-xs leading-relaxed">
              Secure, transparent and fair elections for Adamas University student representatives
            </p>
            <div className="flex space-x-3 pt-2">
              {socialLinks.map((link, i) => (
                <a 
                  key={i}
                  href={link.href}
                  aria-label={link.label}
                  className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#232323]/70 hover:text-[#33CC33] hover:shadow-md transition-all"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm uppercase tracking-wide text-[#232323]/70">Quick Links</h3>
            <div className="space-y-3">
              <a href="/" className="block text-sm text-[#232323]/70 hover:text-[#33CC33] transition-colors">Home</a>
              <a href="/voting" className="block text-sm text-[#232323]/70 hover:text-[#33CC33] transition-colors">Voting</a>
              <a href="/results" className="block text-sm text-[#232323]/70 hover:text-[#33CC33] transition-colors">Results</a>
              <a href="/classes" className="block text-sm text-[#232323]/70 hover:text-[#33CC33] transition-colors">Class Browser</a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm uppercase tracking-wide text-[#232323]/70">Contact</h3>
            <div className="space-y-3">
              <p className="text-sm text-[#232323]/70">
                <span className="font-medium">Email:</span> support@adivote.com
              </p>
              <p className="text-sm text-[#232323]/70">
                <span className="font-medium">Address:</span> Adamas University, Kolkata
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#33CC33]/20 text-[#33CC33] font-medium text-sm">
                <div className="w-2 h-2 rounded-full bg-[#33CC33] mr-2 animate-pulse"></div>
                Elections Active
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-[#232323]/10 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <p className="text-sm text-[#232323]/70">
            &copy; {currentYear} CR Voting System for Adamas University. All rights reserved.
          </p>
          <p className="flex items-center text-xs text-[#232323]/70 mt-4 md:mt-0">
            Made with 
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }} 
              transition={{ repeat: Infinity, duration: 2 }}
              className="mx-1 text-red-500"
            >
              <HeartIcon size={12} />
            </motion.div>
            for the student community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;