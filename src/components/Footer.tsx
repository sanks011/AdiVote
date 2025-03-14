import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Github, Mail } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  
  if (location.pathname === '/admin-login' || location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
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
  );
};

export default Footer;