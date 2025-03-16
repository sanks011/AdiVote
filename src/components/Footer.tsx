import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Github, Mail, Vote, Heart, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Footer = () => {
  const location = useLocation();
  
  if (location.pathname === '/admin-login' || location.pathname.startsWith('/admin')) {
    return null;
  }

  const footerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const linkVariants = {
    hover: {
      scale: 1.05,
      color: "#33CC33",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
      className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/50"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 group"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="p-2 rounded-lg bg-gradient-to-r from-[#33CC33]/10 to-[#2ecc71]/10 group-hover:from-[#33CC33]/20 group-hover:to-[#2ecc71]/20 transition-colors duration-300"
              >
                <Vote className="h-6 w-6 text-[#33CC33]" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#33CC33] to-[#2ecc71] bg-clip-text text-transparent">
                AdiVote
              </span>
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>© {new Date().getFullYear()} AdiVote.</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-4 w-4 text-red-500" /> by Team AdiVote
              </span>
            </div>
          </div>

          {/* Links and Social */}
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Essential Links */}
            <div className="flex items-center gap-8">
              <motion.div 
                variants={linkVariants}
                whileHover="hover"
                className="relative group"
              >
                <Link
                  to="/privacy"
                  className="text-sm text-gray-600 hover:text-[#33CC33] transition-colors flex items-center gap-1"
                >
                  Privacy Policy
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
              <motion.div 
                variants={linkVariants}
                whileHover="hover"
                className="relative group"
              >
                <Link
                  to="/terms"
                  className="text-sm text-gray-600 hover:text-[#33CC33] transition-colors flex items-center gap-1"
                >
                  Terms of Service
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-6 md:border-l border-gray-200 md:pl-8">
              <motion.a
                href="https://github.com/yourusername/adivote"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 hover:bg-[#33CC33]/10 text-gray-600 hover:text-[#33CC33] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </motion.a>
              <motion.a
                href="mailto:contact@adivote.com"
                className="p-2 rounded-lg bg-gray-100 hover:bg-[#33CC33]/10 text-gray-600 hover:text-[#33CC33] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;