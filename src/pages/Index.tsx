
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ChevronRight, Vote, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getElectionSettings, getTotalVotes } from '../lib/firebase';

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
    <div className="min-h-[calc(100vh-4rem)] w-full">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white z-0"></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="flex-1 text-center md:text-left animate-slide-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4">
                {settings?.electionTitle || 'CR Voting System'}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
                {settings?.electionDescription || 'Vote for your Class Representative in a secure, transparent and fair election process.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button size="lg" onClick={handleStartVoting} className="flex items-center gap-2">
                  {userData?.hasVoted ? 'View Your Vote' : 'Start Voting'}
                  <ChevronRight size={18} />
                </Button>
                <Link to="/results">
                  <Button size="lg" variant="outline" className="flex items-center gap-2">
                    View Results
                    <BarChart3 size={18} />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center animate-slide-down">
              <div className="rounded-2xl glass p-1 shadow-xl">
                <img
                  src="/placeholder.svg"
                  alt="Voting Illustration"
                  className="w-full max-w-md rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our voting system is designed to be simple, secure, and transparent.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="animate-slide-up [animation-delay:100ms]">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Vote size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">1. Verify Your Identity</h3>
                <p className="text-gray-600 text-center">
                  Sign in with your college email to verify your identity and eligibility to vote.
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-slide-up [animation-delay:200ms]">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Vote size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">2. Cast Your Vote</h3>
                <p className="text-gray-600 text-center">
                  Browse the candidates, learn about their platforms, and cast your vote for your preferred candidate.
                </p>
              </CardContent>
            </Card>
            
            <Card className="animate-slide-up [animation-delay:300ms]">
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 size={24} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">3. View Results</h3>
                <p className="text-gray-600 text-center">
                  Once voting ends, the results will be displayed transparently for everyone to see.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-lg bg-white shadow-sm animate-slide-up">
              <h3 className="text-4xl font-bold text-primary mb-2">{totalVotes}</h3>
              <p className="text-gray-600">Total Votes Cast</p>
            </div>
            
            <div className="p-6 rounded-lg bg-white shadow-sm animate-slide-up [animation-delay:100ms]">
              <h3 className="text-4xl font-bold text-primary mb-2">
                {settings?.votingEnabled ? 'Open' : 'Closed'}
              </h3>
              <p className="text-gray-600">Voting Status</p>
            </div>
            
            <div className="p-6 rounded-lg bg-white shadow-sm animate-slide-up [animation-delay:200ms]">
              <h3 className="text-4xl font-bold text-primary mb-2">
                {settings?.endDate ? new Date(settings.endDate.seconds * 1000).toLocaleDateString() : 'TBD'}
              </h3>
              <p className="text-gray-600">Results Date</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
