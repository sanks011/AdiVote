
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, School, Vote, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useMobileDetect } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();
  const { currentUser, userData, isAdmin, logOut, loading, userClass } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-sm border-b z-50 flex items-center">
      <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl md:text-2xl text-primary flex items-center">
            <Vote className="h-6 w-6 mr-2" />
            AdiVote
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
              location.pathname === '/' && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            Home
          </Link>
          {currentUser && (
            <>
              <Link
                to="/voting"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
                  location.pathname === '/voting' && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Voting
              </Link>
              <Link
                to="/classes"
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
                  location.pathname === '/classes' && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Class Browser
              </Link>
            </>
          )}
          <Link
            to="/results"
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
              location.pathname === '/results' && "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            Results
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100",
                location.pathname.startsWith('/admin') && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* User Menu (Desktop) */}
        <div className="hidden md:block">
          {loading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0">
                  <Avatar>
                    <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{userData?.displayName || userData?.email?.split('@')[0]}</span>
                  <span className="text-xs font-normal text-gray-500 truncate">{userData?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userClass && (
                  <>
                    <DropdownMenuItem className="flex items-center">
                      <School className="mr-2 h-4 w-4" />
                      <span className="truncate">{userClass.name}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/classes" className="cursor-pointer flex w-full items-center">
                    <School className="mr-2 h-4 w-4" />
                    Class Browser
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/verification">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 p-4">
          <div className="flex flex-col space-y-4">
            {loading ? (
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ) : currentUser ? (
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {(userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{userData?.displayName || userData?.email?.split('@')[0]}</p>
                  <p className="text-sm text-gray-500 truncate">{userData?.email}</p>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-2">
              <Link
                to="/"
                className={cn(
                  "flex items-center p-3 text-base font-medium rounded-md hover:bg-gray-100",
                  location.pathname === '/' && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                Home
              </Link>
              {currentUser && (
                <>
                  <Link
                    to="/voting"
                    className={cn(
                      "flex items-center p-3 text-base font-medium rounded-md hover:bg-gray-100",
                      location.pathname === '/voting' && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <Vote className="h-5 w-5 mr-3" />
                    Voting
                  </Link>
                  <Link
                    to="/classes"
                    className={cn(
                      "flex items-center p-3 text-base font-medium rounded-md hover:bg-gray-100",
                      location.pathname === '/classes' && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <School className="h-5 w-5 mr-3" />
                    Class Browser
                  </Link>
                  <Link
                    to="/profile"
                    className={cn(
                      "flex items-center p-3 text-base font-medium rounded-md hover:bg-gray-100",
                      location.pathname === '/profile' && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <User className="h-5 w-5 mr-3" />
                    Profile
                  </Link>
                </>
              )}

              <Link
                to="/results"
                className={cn(
                  "flex items-center p-3 text-base font-medium rounded-md hover:bg-gray-100",
                  location.pathname === '/results' && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Results
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center p-3 text-base font-medium rounded-md hover:bg-gray-100",
                    location.pathname.startsWith('/admin') && "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Admin
                </Link>
              )}

              {!currentUser ? (
                <Button asChild className="mt-2">
                  <Link to="/verification">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              ) : (
                <Button variant="destructive" onClick={handleLogout} className="mt-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;