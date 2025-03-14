import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, School, Vote, BarChart3, Settings, Bell, Search, Home, Users, Shield } from 'lucide-react';
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
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

interface UserData {
  displayName?: string;
  email?: string;
  photoURL?: string;
}

interface ClassData {
  name: string;
  // Add other class properties as needed
}

interface AuthContextType {
  currentUser: any | null;
  userData: UserData | null;
  isAdmin: boolean;
  loading: boolean;
  userClass: ClassData | null;
  logOut: () => Promise<void>;
}

// Enhanced animations and transitions
const navVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1
    }
  }
};

const menuItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      type: "spring",
      stiffness: 100
    }
  })
};

const mobileMenuVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const Navbar = () => {
  const location = useLocation();
  const { currentUser, userData, isAdmin, logOut, loading, userClass } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const isMobile = useMobile();

  // Enhanced scroll progress animation
  const { scrollYProgress } = useScroll();
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const scrollBlur = useTransform(scrollYProgress, [0, 0.2], [0, 8]);

  // Handle scroll effect with enhanced animation
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
    <div>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#33CC33] to-[#2ecc71] z-50"
        style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
      />
      <motion.header 
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "fixed top-0 left-0 right-0 min-h-[70px] z-40 flex items-center transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-white/80 backdrop-blur-xl shadow-lg"
            : "bg-transparent",
          isMenuOpen && isMobile
            ? "bg-white/90 backdrop-blur-xl shadow-lg"
            : ""
        )}
        style={{
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.9)" : "transparent",
          backdropFilter: `blur(${scrollBlur}px)`,
        }}
      >
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <Link to="/" className="flex items-center">
              <motion.div 
                className="absolute -inset-2 bg-gradient-to-r from-[#33CC33]/20 to-[#2ecc71]/20 rounded-lg blur"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.span 
                className="font-bold text-xl md:text-2xl text-[#33CC33] flex items-center relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Vote className="h-6 w-6 mr-2 text-[#33CC33]" />
                AdiVote
              </motion.span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <nav className="flex items-center space-x-4">
              {[
                { to: "/", label: "Home", icon: <Home className="w-4 h-4" /> },
                ...(currentUser ? [
                  { to: "/voting", label: "Voting", icon: <Vote className="w-4 h-4" /> },
                  { to: "/classes", label: "Class Browser", icon: <Users className="w-4 h-4" /> }
                ] : []),
                { to: "/results", label: "Results", icon: <BarChart3 className="w-4 h-4" /> },
                ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: <Settings className="w-4 h-4" /> }] : [])
              ].map((item, i) => (
                <motion.div
                  key={item.to}
                  custom={i}
                  variants={menuItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={item.to}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2",
                      (item.to === '/' && location.pathname === '/') || 
                      (item.to !== '/' && location.pathname.startsWith(item.to))
                        ? "bg-gradient-to-r from-[#33CC33] to-[#2ecc71] text-white shadow-lg shadow-[#33CC33]/20"
                        : "hover:bg-[#F3F6F8] hover:text-[#33CC33]"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          )}

          {/* User Menu - Desktop */}
          {!isMobile ? (
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full w-10 h-10 hover:bg-[#F3F6F8]"
                >
                  <Bell className="w-5 h-5 text-[#33CC33]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </Button>
              </motion.div>

              {loading ? (
                <Skeleton className="h-10 w-10 rounded-full" />
              ) : currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" className="relative rounded-full h-10 w-10 p-0 hover:bg-[#F3F6F8]">
                      <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-[#33CC33]/20 to-[#2ecc71]/20 rounded-full blur"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      <Avatar>
                        <AvatarImage src={userData?.photoURL || ''} alt={userData?.displayName || ''} />
                        <AvatarFallback className="bg-[#33CC33]/10 text-[#33CC33]">
                          {(userData?.displayName?.charAt(0) || userData?.email?.charAt(0) || 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-[#33CC33]/20 shadow-lg backdrop-blur-lg bg-white/90">
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
                    <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer flex w-full items-center">
                          <User className="mr-2 h-4 w-4 text-[#33CC33]" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                    </motion.div>
                    <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                      <DropdownMenuItem asChild>
                        <Link to="/classes" className="cursor-pointer flex w-full items-center">
                          <School className="mr-2 h-4 w-4 text-[#33CC33]" />
                          Class Browser
                        </Link>
                      </DropdownMenuItem>
                    </motion.div>
                    <DropdownMenuSeparator />
                    <motion.div 
                      whileHover={{ x: 5, color: "#ef4444" }} 
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </motion.div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="w-full bg-gradient-to-r from-[#33CC33] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#33CC33] text-white shadow-lg shadow-[#33CC33]/20"
                  >
                    <Link to="/verification" className="flex justify-center items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMenu} 
              aria-label="Toggle menu"
              className={cn(
                "relative z-50 p-2 rounded-lg transition-all duration-300",
                isMenuOpen ? "bg-[#33CC33]/10" : ""
              )}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -180 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 180 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          )}
        </div>
      </motion.header>

      {/* Mobile Menu with enhanced animations */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 top-[70px] z-30 bg-white/90 backdrop-blur-xl"
          >
            <motion.div 
              className="flex flex-col p-4 h-full"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
              }}
              initial="hidden"
              animate="visible"
            >
              {loading ? (
                <motion.div 
                  className="flex items-center space-x-4 p-4 border rounded-lg shadow-md bg-white/50 backdrop-blur-sm mb-4"
                  variants={menuItemVariants}
                >
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </motion.div>
              ) : currentUser ? (
                <motion.div 
                  className="flex items-center space-x-4 p-4 border rounded-lg shadow-md bg-white/50 backdrop-blur-sm mb-4"
                  variants={menuItemVariants}
                >
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
                </motion.div>
              ) : null}

              <div className="grid grid-cols-1 gap-2">
                {[
                  { to: "/", label: "Home", icon: <Home className="h-5 w-5 mr-3" /> },
                  ...(currentUser ? [
                    { to: "/voting", label: "Voting", icon: <Vote className="h-5 w-5 mr-3" /> },
                    { to: "/classes", label: "Class Browser", icon: <School className="h-5 w-5 mr-3" /> },
                    { to: "/profile", label: "Profile", icon: <User className="h-5 w-5 mr-3" /> }
                  ] : []),
                  { to: "/results", label: "Results", icon: <BarChart3 className="h-5 w-5 mr-3" /> },
                  ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: <Settings className="h-5 w-5 mr-3" /> }] : [])
                ].map((item, i) => (
                  <motion.div
                    key={item.to}
                    variants={menuItemVariants}
                    custom={i}
                    whileHover={{ scale: 1.02, x: 10 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      to={item.to}
                      className={cn(
                        "flex items-center p-4 text-base font-medium rounded-lg transition-all duration-300",
                        (item.to === '/' && location.pathname === '/') || 
                        (item.to !== '/' && location.pathname.startsWith(item.to))
                          ? "bg-gradient-to-r from-[#33CC33] to-[#2ecc71] text-white shadow-lg shadow-[#33CC33]/20"
                          : "hover:bg-[#F3F6F8] hover:text-[#33CC33]"
                      )}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                className="mt-4"
                variants={menuItemVariants}
                custom={6}
              >
                {!currentUser ? (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-[#33CC33] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#33CC33] text-white shadow-lg shadow-[#33CC33]/20"
                    >
                      <Link to="/verification" className="flex justify-center items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      variant="destructive" 
                      onClick={handleLogout} 
                      className="w-full shadow-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;