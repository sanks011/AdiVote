import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Vote, BarChart3, Clock, Users, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getElectionSettings, getTotalVotes } from '../lib/firebase';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Index = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectionData = async () => {
      const electionSettings = await getElectionSettings();
      const votes = await getTotalVotes();
      
      setSettings(electionSettings);
      setTotalVotes(votes);
      setLoading(false);
    };
    
    fetchElectionData();
  }, []);

  const handleStartVoting = () => {
    if (currentUser) {
      navigate('/voting');
    } else {
      navigate('/verification');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-[#F3F6F8]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#33CC33]/10 to-[#F3F6F8] z-0"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33CC33]/10 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#33CC33]/10 rounded-full filter blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 text-center md:text-left animate-slide-up">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#33CC33]/20 text-[#33CC33] font-medium text-sm mb-6">
                <div className="w-2 h-2 rounded-full bg-[#33CC33] mr-2 animate-pulse"></div>
                {settings?.votingEnabled ? 'Voting Open' : 'Coming Soon'}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#232323] mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#232323] to-[#33CC33]">
                  {settings?.electionTitle || 'CR Voting System'}
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-[#232323]/80 mb-8 md:mb-10 max-w-2xl leading-relaxed">
                {settings?.electionDescription || 'Vote for your Class Representative in a secure, transparent and fair election process.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  size="lg" 
                  onClick={handleStartVoting} 
                  className="flex items-center gap-2 w-full sm:w-auto text-base px-8 py-6 bg-[#33CC33] hover:bg-[#33CC33]/80 transition-all duration-300 shadow-lg shadow-[#33CC33]/20"
                >
                  {userData?.hasVoted ? 'View Your Vote' : 'Start Voting'}
                  <ChevronRight size={18} />
                </Button>
                
                <Link to="/results" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="flex items-center gap-2 w-full text-base px-8 py-6 border-[#232323] text-[#232323] hover:bg-[#232323] hover:text-white transition-all duration-300"
                  >
                    View Results
                    <BarChart3 size={18} />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 flex justify-center items-center animate-slide-down mt-6 md:mt-0">
              <div className="rounded-2xl glass p-2 bg-white/50 backdrop-blur-sm shadow-xl border border-white/20 w-full max-w-md transform hover:scale-[1.02] transition-all duration-300">
                <DotLottieReact
                  src="https://lottie.host/5261d763-ce67-40cc-bfa9-e6c61fd84ec2/T6s26ljfpD.lottie"
                  loop
                  autoplay
                  className="w-full h-64 md:h-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Moved up for better visual flow */}
      <section className="py-12 md:py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#33CC33]/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#33CC33]/5 rounded-full filter blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#232323] mb-2">Election Statistics</h2>
            <div className="h-1 w-20 bg-[#33CC33] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6 md:gap-8">
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-[#F3F6F8] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 md:p-8">
                <div className="h-16 w-16 rounded-2xl bg-[#33CC33]/10 flex items-center justify-center mb-6 mx-auto">
                  <Users size={32} className="text-[#33CC33]" />
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-[#232323] mb-2 text-center">{totalVotes}</h3>
                <p className="text-base text-[#232323]/70 text-center font-medium">Total Votes Cast</p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-[#F3F6F8] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 md:p-8">
                <div className="h-16 w-16 rounded-2xl bg-[#33CC33]/10 flex items-center justify-center mb-6 mx-auto">
                  <ShieldCheck size={32} className="text-[#33CC33]" />
                </div>
                <h3 className="text-3xl md:text-5xl font-bold text-[#232323] mb-2 text-center">
                  {settings?.votingEnabled ? 'Open' : 'Closed'}
                </h3>
                <p className="text-base text-[#232323]/70 text-center font-medium">Voting Status</p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-white to-[#F3F6F8] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-6 md:p-8">
                <div className="h-16 w-16 rounded-2xl bg-[#33CC33]/10 flex items-center justify-center mb-6 mx-auto">
                  <Clock size={32} className="text-[#33CC33]" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[#232323] mb-2 text-center">
                  {settings?.endDate ? new Date(settings.endDate.seconds * 1000).toLocaleDateString() : 'TBD'}
                </h3>
                <p className="text-base text-[#232323]/70 text-center font-medium">Results Date</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-[#F3F6F8] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#33CC33]/10 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#33CC33]/10 rounded-full filter blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1 rounded-full bg-[#33CC33]/10 text-[#33CC33] font-medium text-sm mb-4">
              SIMPLE PROCESS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#232323] mb-4">How It Works</h2>
            <p className="text-lg text-[#232323]/70 max-w-2xl mx-auto">
              Our voting system is designed to be simple, secure, and transparent.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden sm:block absolute top-24 left-1/6 right-1/6 h-0.5 bg-[#33CC33]/30"></div>
            
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white overflow-hidden">
              <div className="h-2 bg-[#33CC33]"></div>
              <CardContent className="pt-8 p-6 md:p-8">
                <div className="h-16 w-16 rounded-full bg-[#33CC33]/10 border-4 border-[#F3F6F8] flex items-center justify-center mb-6 mx-auto">
                  <span className="text-xl font-bold text-[#33CC33]">1</span>
                </div>
                <h3 className="text-xl font-bold text-[#232323] text-center mb-4">Verify Your Identity</h3>
                <p className="text-[#232323]/70 text-center">
                  Sign in with your college email to verify your identity and eligibility to vote.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white overflow-hidden sm:mt-8">
              <div className="h-2 bg-[#33CC33]"></div>
              <CardContent className="pt-8 p-6 md:p-8">
                <div className="h-16 w-16 rounded-full bg-[#33CC33]/10 border-4 border-[#F3F6F8] flex items-center justify-center mb-6 mx-auto">
                  <span className="text-xl font-bold text-[#33CC33]">2</span>
                </div>
                <h3 className="text-xl font-bold text-[#232323] text-center mb-4">Cast Your Vote</h3>
                <p className="text-[#232323]/70 text-center">
                  Browse the candidates, learn about their platforms, and cast your vote for your preferred candidate.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white overflow-hidden">
              <div className="h-2 bg-[#33CC33]"></div>
              <CardContent className="pt-8 p-6 md:p-8">
                <div className="h-16 w-16 rounded-full bg-[#33CC33]/10 border-4 border-[#F3F6F8] flex items-center justify-center mb-6 mx-auto">
                  <span className="text-xl font-bold text-[#33CC33]">3</span>
                </div>
                <h3 className="text-xl font-bold text-[#232323] text-center mb-4">View Results</h3>
                <p className="text-[#232323]/70 text-center">
                  Once voting ends, the results will be displayed transparently for everyone to see.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#232323] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/dots-pattern.svg')] opacity-5"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to make your voice heard?</h2>
              <p className="text-xl text-white/70 mb-6">
                Join your fellow students in shaping the future of your class.
              </p>
            </div>
            <div className="flex-shrink-0">
            <Button 
                size="lg" 
                onClick={handleStartVoting}
                className="bg-[#33CC33] hover:bg-[#33CC33]/90 text-white px-8 py-6 rounded-lg flex items-center gap-2 text-lg font-medium shadow-lg shadow-[#33CC33]/20 transition-all duration-300 transform hover:scale-105"
              >
                Start Now
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Banner */}
      <section className="py-10 bg-gradient-to-r from-[#F3F6F8] to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#232323]/70 text-center md:text-left">
              Secure, transparent, and fair elections for everyone.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#33CC33] animate-pulse"></div>
              <span className="text-[#33CC33] font-medium">
                {settings?.votingEnabled ? 'Voting is currently open' : 'Voting coming soon'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;