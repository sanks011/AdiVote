import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HeartIcon, Vote, GithubIcon, LinkedinIcon, Github, Mail, Heart, Star, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from "@/lib/utils";

// Particle effect component
const ParticleEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-[#33CC33]/10 rounded-full"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            scale: [1, Math.random() * 0.5 + 0.5],
            opacity: [0.3, 0.1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
};

// Enhanced animation variants
const footerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      staggerChildren: 0.2
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

const linkVariants = {
  initial: { x: 0 },
  hover: { 
    x: 10,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
};

const Footer = () => {
  const location = useLocation();
  
  if (location.pathname === '/admin-login' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
    <footer className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand and Copyright */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="text-xl font-medium text-gray-900">
              AdiVote
            </Link>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} AdiVote. All rights reserved.
            </p>
          </div>

          {/* Essential Links */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                Terms
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4 border-l border-gray-100 pl-6">
              <a
                href="https://github.com/yourusername/adivote"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:contact@adivote.com"
                className="text-gray-400 hover:text-gray-900 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    </>
  );
};

export default Footer;