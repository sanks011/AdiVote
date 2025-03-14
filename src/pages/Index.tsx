// Update this page with advanced UI/UX while keeping core functionality

import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  ChevronRight, 
  BarChart3, 
  Clock, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Check,
  ChevronDown,
  Sparkles,
  Shield,
  Lock,
  Star,
  Zap,
  MousePointer2,
  Fingerprint,
  Award,
  Rocket,
  Target,
  Lightbulb,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2,
  Timer,
  UserCheck,
  Gauge,
  Workflow,
  Blocks,
  Puzzle,
  Megaphone,
  Handshake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getElectionSettings, getTotalVotes } from "../lib/firebase";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";

// Custom styles with enhanced animations
const customStyles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes float {
    0% { transform: translateY(0) rotate(0); }
    50% { transform: translateY(-20px) rotate(5deg); }
    100% { transform: translateY(0) rotate(0); }
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 0.5; }
    100% { transform: scale(1.3); opacity: 0; }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  @keyframes aurora {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    75% { transform: rotate(10deg); }
  }

  @keyframes scale-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes rotate-3d {
    0% { transform: perspective(1000px) rotateY(0deg); }
    100% { transform: perspective(1000px) rotateY(360deg); }
  }

  .aurora {
    position: absolute;
    width: 800px;
    height: 800px;
    transform: translate(-50%, -50%);
    background: linear-gradient(45deg, 
      rgba(51, 204, 51, 0.1) 0%,
      rgba(46, 204, 113, 0.1) 25%,
      rgba(51, 204, 51, 0.1) 50%,
      rgba(46, 204, 113, 0.1) 75%,
      rgba(51, 204, 51, 0.1) 100%
    );
    filter: blur(60px);
    border-radius: 50%;
    animation: aurora 15s linear infinite;
    pointer-events: none;
  }

  .gradient-text {
    background: linear-gradient(45deg, #33CC33, #2ecc71, #27ae60);
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .floating {
    animation: float 6s ease-in-out infinite;
  }

  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(51, 204, 51, 0.1), transparent);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite linear;
  }

  .card-hover {
    transition: all 0.3s ease;
  }

  .card-hover:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 40px rgba(51, 204, 51, 0.1);
  }

  .glass-effect {
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .text-gradient {
    background: linear-gradient(120deg, #33CC33, #2ecc71);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hover-lift {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .hover-lift:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(51, 204, 51, 0.15);
  }

  .bounce {
    animation: bounce 2s ease-in-out infinite;
  }

  .wave {
    animation: wave 2s ease-in-out infinite;
  }

  .scale-pulse {
    animation: scale-pulse 2s ease-in-out infinite;
  }

  .slide-up {
    animation: slide-up 0.5s ease-out forwards;
  }

  .rotate-3d {
    animation: rotate-3d 15s linear infinite;
  }

  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
  }

  .highlight-box {
    position: relative;
    overflow: hidden;
  }

  .highlight-box::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(51, 204, 51, 0.1),
      transparent
    );
    transform: rotate(45deg);
    animation: shimmer 3s linear infinite;
  }

  .feature-grid {
    display: grid;
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .timeline-item {
    position: relative;
    padding-left: 2rem;
    margin-bottom: 2rem;
  }

  .timeline-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 2px;
    background: linear-gradient(to bottom, #33CC33, #2ecc71);
  }

  .timeline-item::after {
    content: '';
    position: absolute;
    left: -4px;
    top: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #33CC33;
    box-shadow: 0 0 0 4px rgba(51, 204, 51, 0.2);
  }
`;

const Index = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Scroll progress for enhanced animations
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        const electionSettings = await getElectionSettings();
        const votes = await getTotalVotes();
        setSettings(electionSettings);
        setTotalVotes(votes);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching election data:", error);
        setLoading(false);
      }
    };

    fetchElectionData();
  }, []);

  // Add styles to document head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleStartVoting = () => {
    if (currentUser) {
      navigate("/voting");
    } else {
      navigate("/verification");
    }
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-white to-[#F3F6F8] overflow-hidden"
    >
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[#33CC33] origin-left z-50"
        style={{ scaleX }}
      />

      {/* Interactive background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[#F3F6F8]/50" />
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-[#33CC33]/10 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() * 0.5 + 0.5],
              opacity: [0.5, 0.2],
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
        <div className="aurora" style={{ left: '50%', top: '50%' }} />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center py-20 px-4">
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            className="absolute -top-20 -left-20 w-64 h-64 bg-[#33CC33]/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#2ecc71]/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-6"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="relative w-3 h-3"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  <div className="absolute inset-0 rounded-full bg-[#33CC33]" />
                  <div className="absolute inset-0 rounded-full bg-[#33CC33] animate-ping" />
                </motion.div>
                <span className="ml-2 text-[#33CC33] font-medium">
                  {settings?.votingEnabled ? "Voting Open" : "Coming Soon"}
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="gradient-text">
                  {settings?.electionTitle || "CR Voting System"}
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-[#232323]/70 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {settings?.electionDescription ||
                  "Vote for your Class Representative in a secure, transparent and fair election process."}
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    onClick={handleStartVoting}
                    className="relative overflow-hidden group bg-gradient-to-r from-[#33CC33] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#33CC33] text-white px-8 py-6 rounded-xl shadow-xl transition-all duration-300"
                  >
                    <motion.span 
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <span className="relative z-10 flex items-center gap-2 text-lg font-medium">
                      {userData?.hasVoted ? "View Your Vote" : "Start Voting"}
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link to="/results">
                    <Button
                      size="lg"
                      variant="outline"
                      className="relative overflow-hidden group border-2 border-[#33CC33] text-[#33CC33] hover:text-white px-8 py-6 rounded-xl transition-all duration-300"
                    >
                      <motion.span 
                        className="absolute inset-0 bg-[#33CC33] transform origin-left"
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                      <span className="relative z-10 flex items-center gap-2 text-lg font-medium">
                        View Results
                        <BarChart3 className="transition-transform group-hover:rotate-6" />
                      </span>
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Right Column - 3D Animation */}
            <motion.div
              className="relative perspective-1000"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                transform: `rotateY(${mousePosition.x * 0.02}deg) rotateX(${-mousePosition.y * 0.02}deg)`,
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute -inset-4 bg-gradient-to-r from-[#33CC33]/20 to-[#2ecc71]/20 rounded-3xl blur-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div 
                  className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <DotLottieReact
                    src="https://lottie.host/5261d763-ce67-40cc-bfa9-e6c61fd84ec2/T6s26ljfpD.lottie"
                    loop
                    autoplay
                    className="w-full h-80"
                  />
                  
                  {/* Floating elements */}
                  <motion.div
                    className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-[#33CC33] to-[#2ecc71] rounded-full shadow-lg"
                    animate={{
                      y: [0, -15, 0],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Star className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>
                  
                  <motion.div
                    className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-[#232323] to-[#454545] rounded-full shadow-lg"
                    animate={{
                      y: [0, 15, 0],
                      rotate: [0, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  >
                    <Zap className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="w-6 h-6 text-[#33CC33]" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4 text-[#33CC33] mr-2" />
              <span className="text-[#33CC33] font-medium">WHY CHOOSE US</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Advanced Features
            </h2>
            <p className="text-xl text-[#232323]/70 max-w-2xl mx-auto">
              Experience the future of voting with our cutting-edge platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MousePointer2 className="w-8 h-8" />,
                title: "Easy to Use",
                description: "Intuitive interface designed for seamless voting experience",
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Secure Voting",
                description: "Advanced encryption and security measures to protect your vote",
              },
              {
                icon: <Fingerprint className="w-8 h-8" />,
                title: "Verified Identity",
                description: "Multi-factor authentication ensures legitimate voters",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  className="relative overflow-hidden hover:shadow-2xl transition-all duration-500"
                  gradient
                  hover3D
                  glare
                >
                  <CardContent className="p-8">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#33CC33] to-[#2ecc71] flex items-center justify-center text-white mb-6"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-[#232323]/70">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-[#33CC33]/5"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(51, 204, 51, 0.1) 0%, transparent 70%)',
            backgroundSize: '100% 100%',
          }}
        />
        
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BarChart3 className="w-4 h-4 text-[#33CC33] mr-2" />
              <span className="text-[#33CC33] font-medium">LIVE METRICS</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Real-time Statistics
            </h2>
            <p className="text-xl text-[#232323]/70 max-w-2xl mx-auto">
              Track the progress of the election as it happens
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                value: totalVotes,
                label: "Total Votes",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                value: settings?.votingEnabled ? "Active" : "Closed",
                label: "Status",
              },
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                value: "100%",
                label: "Security",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  className="relative overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white/50 backdrop-blur-sm"
                  gradient
                  hover3D
                  glare
                >
                  <CardContent className="p-8">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-[#33CC33]/10 flex items-center justify-center text-[#33CC33] mb-6 mx-auto"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {stat.icon}
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, delay: index * 0.2 }}
                      className="text-4xl font-bold text-center mb-2"
                    >
                      {stat.value}
                    </motion.div>
                    <p className="text-[#232323]/70 text-center">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Workflow className="w-4 h-4 text-[#33CC33] mr-2" />
              <span className="text-[#33CC33] font-medium">HOW IT WORKS</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Simple Voting Process
            </h2>
            <p className="text-xl text-[#232323]/70 max-w-2xl mx-auto">
              Complete your vote in three easy steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <UserCheck className="w-8 h-8" />,
                title: "1. Verify Identity",
                description: "Sign in with your college email for secure access",
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "2. Choose Candidate",
                description: "Select your preferred candidate from the list",
              },
              {
                icon: <CheckCircle2 className="w-8 h-8" />,
                title: "3. Confirm Vote",
                description: "Review and confirm your selection",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  className="relative overflow-hidden hover:shadow-2xl transition-all duration-500"
                  gradient
                  hover3D
                  glare
                >
                  <CardContent className="p-8">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#33CC33] to-[#2ecc71] flex items-center justify-center text-white mb-6"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {step.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                    <p className="text-[#232323]/70">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-white to-[#F3F6F8]">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 0% 0%, rgba(51, 204, 51, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 100% 100%, rgba(51, 204, 51, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 0% 0%, rgba(51, 204, 51, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        <div className="max-w-6xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Award className="w-4 h-4 text-[#33CC33] mr-2" />
              <span className="text-[#33CC33] font-medium">BENEFITS</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Why Choose Digital Voting
            </h2>
            <p className="text-xl text-[#232323]/70 max-w-2xl mx-auto">
              Experience the advantages of modern voting technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Timer className="w-6 h-6" />,
                title: "Time Efficient",
                description: "Vote quickly from anywhere, no queues or waiting",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Enhanced Security",
                description: "Advanced encryption and verification systems",
              },
              {
                icon: <Gauge className="w-6 h-6" />,
                title: "Real-time Results",
                description: "Instant vote counting and result updates",
              },
              {
                icon: <Blocks className="w-6 h-6" />,
                title: "Transparent Process",
                description: "Clear audit trail and verifiable results",
              },
              {
                icon: <Puzzle className="w-6 h-6" />,
                title: "Easy Integration",
                description: "Seamlessly works with existing systems",
              },
              {
                icon: <Megaphone className="w-6 h-6" />,
                title: "Better Engagement",
                description: "Increased participation and voter turnout",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="highlight-box"
              >
                <Card className="h-full glass-card hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-[#33CC33]/10 flex items-center justify-center text-[#33CC33] mb-4"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {benefit.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-[#232323]/70 text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Support Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 rounded-full glass-effect mb-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Rocket className="w-4 h-4 text-[#33CC33] mr-2" />
              <span className="text-[#33CC33] font-medium">PLATFORM SUPPORT</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Vote from Any Device
            </h2>
            <p className="text-xl text-[#232323]/70 max-w-2xl mx-auto">
              Our platform works seamlessly across all your devices
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Laptop className="w-12 h-12" />,
                title: "Desktop",
                description: "Vote comfortably from your computer",
              },
              {
                icon: <Smartphone className="w-12 h-12" />,
                title: "Mobile",
                description: "Vote on the go with our mobile-optimized interface",
              },
              {
                icon: <Tablet className="w-12 h-12" />,
                title: "Tablet",
                description: "Perfect for touch-screen voting experience",
              },
            ].map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                <Card
                  className="relative overflow-hidden text-center hover:shadow-2xl transition-all duration-500"
                  gradient
                  hover3D
                  glare
                >
                  <CardContent className="p-8">
                    <motion.div
                      className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#33CC33] to-[#2ecc71] flex items-center justify-center text-white mb-6 mx-auto"
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {platform.icon}
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-4">{platform.title}</h3>
                    <p className="text-[#232323]/70">{platform.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#33CC33]/5 to-[#2ecc71]/5"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <div className="max-w-4xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center glass-card rounded-3xl p-12"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Handshake className="w-16 h-16 text-[#33CC33] mx-auto mb-6" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-xl text-[#232323]/70 mb-8 max-w-2xl mx-auto">
              Join your fellow students in shaping the future of your class
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  onClick={handleStartVoting}
                  className="relative overflow-hidden group bg-gradient-to-r from-[#33CC33] to-[#2ecc71] hover:from-[#2ecc71] hover:to-[#33CC33] text-white px-8 py-6 rounded-xl shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  <motion.span 
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2 text-lg font-medium">
                    Start Voting Now
                    <ArrowRight className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/results" className="block w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="relative overflow-hidden group border-2 border-[#33CC33] text-[#33CC33] hover:text-white px-8 py-6 rounded-xl transition-all duration-300 w-full"
                  >
                    <motion.span 
                      className="absolute inset-0 bg-[#33CC33] transform origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center justify-center gap-2 text-lg font-medium">
                      Check Results
                      <BarChart3 className="transition-transform group-hover:rotate-6" />
                    </span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </motion.main>
  );
};

export default Index;
