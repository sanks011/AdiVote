
import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  
  // Don't show footer on admin login page
  if (location.pathname === '/admin-login') {
    return null;
  }
  
  // Don't show footer on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="mt-auto py-6 px-4 bg-white/80 backdrop-blur-sm border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CR Voting System for Adamas University
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Secure, transparent and fair elections for our student representatives
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
