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
import { useMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  loading: boolean;
  userClass: ClassData | null;
  logOut: () => Promise<void>;
}

const Navbar = () => {
  const location = useLocation();
  const { currentUser, userData, isAdmin, logOut, loading, userClass } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMobile();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isMobile]);

  // Close menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 min-h-[70px] border-b z-50 flex items-center transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md"
          : "bg-transparent border-transparent",
        isMenuOpen && isMobile
          ? "bg-white/60 backdrop-blur-lg shadow-lg"
          : ""
      )}
    >
      <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl md:text-2xl text-[#33CC33] flex items-center">
            <Vote className="h-6 w-6 mr-2 text-[#33CC33]" />
            AdiVote
          </span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center space-x-2">
            <Link
              to="/"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#F3F6F8] transition-colors",
                location.pathname === '/' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90"
              )}
            >
              Home
            </Link>
            {currentUser && (
              <>
                <Link
                  to="/voting"
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#F3F6F8] transition-colors",
                    location.pathname === '/voting' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90"
                  )}
                >
                  Voting
                </Link>
                <Link
                  to="/classes"
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#F3F6F8] transition-colors",
                    location.pathname === '/classes' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90"
                  )}
                >
                  Class Browser
                </Link>
              </>
            )}
            <Link
              to="/results"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#F3F6F8] transition-colors",
                location.pathname === '/results' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90"
              )}
            >
              Results
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg hover:bg-[#F3F6F8] transition-colors",
                  location.pathname.startsWith('/admin') && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90"
                )}
              >
                Admin
              </Link>
            )}
          </nav>
        )}

        {/* User Menu - Desktop */}
        {!isMobile ? (
          <div className="block">
            {loading ? (
              <Skeleton className="h-10 w-10 rounded-full" />
            ) : currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0 hover:bg-[#F3F6F8] transition-colors">
                    <Avatar>
                      <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                      <AvatarFallback className="bg-[#33CC33]/10 text-[#33CC33]">
                        {(userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-[#33CC33]/20 shadow-lg">
                  <DropdownMenuLabel className="flex flex-col">
                    <span>{userData?.displayName || userData?.email?.split('@')[0]}</span>
                    <span className="text-xs font-normal text-gray-500 truncate">{userData?.email}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userClass && (
                    <>
                      <DropdownMenuItem className="flex items-center">
                        <School className="mr-2 h-4 w-4 text-[#33CC33]" />
                        <span className="truncate">{userClass.name}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer flex w-full items-center">
                      <User className="mr-2 h-4 w-4 text-[#33CC33]" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/classes" className="cursor-pointer flex w-full items-center">
                      <School className="mr-2 h-4 w-4 text-[#33CC33]" />
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
              <Button 
                asChild 
                size="sm" 
                className="bg-[#33CC33] hover:bg-[#33CC33]/90 text-white shadow-lg shadow-[#33CC33]/20 px-4 py-2 rounded-lg transition-all duration-300"
              >
                <Link to="/verification">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
            className={cn(
              "relative z-50 transition-colors",
              isMenuOpen && "bg-[#33CC33]/10"
            )}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        )}
      </div>

      {/* Mobile Menu with enhanced design */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 top-[70px] z-40 transition-all duration-300",
            isMenuOpen 
              ? "opacity-100 pointer-events-auto bg-white/80 backdrop-blur-lg"
              : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex flex-col p-4 h-full">
            {loading ? (
              <div className="flex items-center space-x-4 p-4 border rounded-lg shadow-md bg-white mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ) : currentUser ? (
              <div className={cn(
                "flex items-center space-x-4 p-4 border rounded-lg shadow-md bg-white mb-4 transition-all duration-300",
                isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              )}>
                <Avatar className="h-12 w-12 border-2 border-[#33CC33]/20">
                  <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                  <AvatarFallback className="bg-[#33CC33]/10 text-[#33CC33] text-lg">
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
                  "flex items-center p-4 text-base font-medium rounded-lg hover:bg-[#F3F6F8] transition-all duration-300",
                  location.pathname === '/' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90",
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  "transition-all delay-[50ms]"
                )}
              >
                Home
              </Link>

              {currentUser && (
                <>
                  <Link
                    to="/voting"
                    className={cn(
                      "flex items-center p-4 text-base font-medium rounded-lg hover:bg-[#F3F6F8] transition-all duration-300",
                      location.pathname === '/voting' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90",
                      isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                      "transition-all delay-[100ms]"
                    )}
                  >
                    <Vote className="h-5 w-5 mr-3" />
                    Voting
                  </Link>

                  <Link
                    to="/classes"
                    className={cn(
                      "flex items-center p-4 text-base font-medium rounded-lg hover:bg-[#F3F6F8] transition-all duration-300",
                      location.pathname === '/classes' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90",
                      isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                      "transition-all delay-[150ms]"
                    )}
                  >
                    <School className="h-5 w-5 mr-3" />
                    Class Browser
                  </Link>

                  <Link
                    to="/profile"
                    className={cn(
                      "flex items-center p-4 text-base font-medium rounded-lg hover:bg-[#F3F6F8] transition-all duration-300",
                      location.pathname === '/profile' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90",
                      isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                      "transition-all delay-[200ms]"
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
                  "flex items-center p-4 text-base font-medium rounded-lg hover:bg-[#F3F6F8] transition-all duration-300",
                  location.pathname === '/results' && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90",
                  isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                  "transition-all delay-[250ms]"
                )}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Results
              </Link>

              {isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    "flex items-center p-4 text-base font-medium rounded-lg hover:bg-[#F3F6F8] transition-all duration-300",
                    location.pathname.startsWith('/admin') && "bg-[#33CC33] text-white hover:bg-[#33CC33]/90",
                    isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                    "transition-all delay-[300ms]"
                  )}
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Admin
                </Link>
              )}

              <div className={cn(
                "mt-4 transition-all duration-300",
                isMenuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                "transition-all delay-[350ms]"
              )}>
                {!currentUser ? (
                  <Button 
                    asChild 
                    className="w-full shadow-lg shadow-[#33CC33]/20 bg-[#33CC33] hover:bg-[#33CC33]/90 text-white"
                  >
                    <Link to="/verification" className="flex justify-center items-center">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    variant="destructive" 
                    onClick={handleLogout} 
                    className="w-full shadow-sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;