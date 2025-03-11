
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logOut } from '../lib/firebase';
import { toast } from 'sonner';

const Navbar = () => {
  const { currentUser, isAdmin } = useAuth();
  const location = useLocation();
  
  const handleLogout = async () => {
    await logOut();
    toast.success('Logged out successfully');
  };
  
  // Don't show navbar on admin login page
  if (location.pathname === '/admin-login') {
    return null;
  }
  
  // Don't show navbar on admin pages except for admin users
  if (location.pathname.startsWith('/admin') && !isAdmin) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-semibold text-primary">CR Voting System</h1>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {!location.pathname.startsWith('/admin') && (
              <>
                <Link 
                  to="/" 
                  className={`px-3 py-2 text-sm font-medium ${
                    location.pathname === '/' 
                      ? 'text-primary' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Home
                </Link>
                
                <Link 
                  to="/results" 
                  className={`px-3 py-2 text-sm font-medium ${
                    location.pathname === '/results' 
                      ? 'text-primary' 
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Results
                </Link>
                
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary"
                  >
                    Admin Panel
                  </Link>
                )}
              </>
            )}

            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {currentUser.email?.split('@')[0]}
                  </span>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary"
                >
                  <LogOut size={16} className="mr-1" /> Logout
                </Button>
              </div>
            ) : (
              location.pathname !== '/verification' && (
                <Link to="/verification">
                  <Button size="sm">
                    Sign In
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
