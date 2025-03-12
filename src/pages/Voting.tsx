import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllCandidates, getElectionSettings, castVote, Candidate } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Vote, Info, Clock, Users, Award } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import CandidateCard from '../components/CandidateCard';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Voting = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [candidatesList, electionSettings] = await Promise.all([
          getAllCandidates(),
          getElectionSettings()
        ]);
        
        setCandidates(candidatesList);
        setSettings(electionSettings);
        
        // Calculate total votes
        let votes = 0;
        candidatesList.forEach(candidate => {
          if (candidate.votes) {
            votes += candidate.votes;
          }
        });
        setTotalVotes(votes);
        
        // If user has already voted, select that candidate
        if (userData?.hasVoted && userData?.votedFor) {
          setSelectedCandidate(userData.votedFor);
        }

        // Calculate time remaining if end time is available
        if (electionSettings?.endTime) {
          updateTimeRemaining(electionSettings.endTime);
          const interval = setInterval(() => {
            updateTimeRemaining(electionSettings.endTime);
          }, 1000);
          return () => clearInterval(interval);
        }
      } catch (err) {
        setError('Failed to load candidates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData]);

  const updateTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      setTimeRemaining('Voting has ended');
      return;
    }
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h remaining`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    } else {
      setTimeRemaining(`${minutes}m ${seconds}s remaining`);
    }
  };
  
  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    
    // Open confirmation dialog
    setConfirmationOpen(true);
  };

  const confirmVote = async () => {
    try {
      setSubmitting(true);
      
      if (!currentUser) {
        throw new Error('You must be logged in to vote');
      }
      
      const success = await castVote(currentUser.uid, selectedCandidate as string);
      
      if (success) {
        toast.success('Your vote has been cast successfully');
        // Navigate to results page if results are visible, otherwise stay on voting page
        if (settings?.resultsVisible) {
          navigate('/results');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cast vote');
      toast.error(err.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
      setConfirmationOpen(false);
    }
  };

  const cancelVote = () => {
    setConfirmationOpen(false);
  };

  const filteredCandidates = candidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (candidate.platform && candidate.platform.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedCandidates = [...filteredCandidates].sort((a, b) => {
    // Sort by votes if results are visible
    if (settings?.resultsVisible) {
      return (b.votes || 0) - (a.votes || 0);
    }
    // Otherwise sort alphabetically
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-medium">Loading election data...</h3>
          <p className="text-gray-500 mt-2">Please wait while we retrieve the latest information</p>
        </div>
      </div>
    );
  }

  if (!settings?.votingEnabled && !userData?.hasVoted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-2 border-gray-200 shadow-lg animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              Voting Not Available
            </CardTitle>
            <CardDescription className="text-center text-base">
              The voting period has not started yet or has ended.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-4">
            {settings?.startTime && Date.now() < settings.startTime && (
              <div className="mb-4">
                <p className="font-medium">Voting starts in:</p>
                <p className="text-xl font-bold text-primary">
                  {new Date(settings.startTime).toLocaleString()}
                </p>
              </div>
            )}
            
            {settings?.endTime && Date.now() > settings.endTime && (
              <div className="mb-4">
                <p className="font-medium">Voting ended on:</p>
                <p className="text-xl font-bold text-primary">
                  {new Date(settings.endTime).toLocaleString()}
                </p>
              </div>
            )}
            
            <p className="mb-6">Please check back later or contact the election administrator.</p>
            
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/')} variant="outline">
                Return to Home
              </Button>
              {settings?.resultsVisible && (
                <Button onClick={() => navigate('/results')} variant="default">
                  View Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-primary/10 rounded-full mb-4 animate-slide-down">
          <Vote size={36} className="text-primary" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 animate-slide-down">
          {userData?.hasVoted ? 'Thank You for Voting' : 'Cast Your Vote'}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg animate-slide-down">
          {userData?.hasVoted
            ? 'You have successfully cast your vote for the Class Representative election.'
            : 'Select your preferred candidate for the Class Representative position. You can only vote once.'}
        </p>

        {/* Election statistics */}
        {totalVotes > 0 && settings?.resultsVisible && (
          <div className="mt-6 flex flex-wrap justify-center gap-4 animate-fade-in">
            <Card className="p-3 flex items-center gap-2 bg-primary/5">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">{totalVotes} Total Votes</span>
            </Card>
            
            {timeRemaining && (
              <Card className="p-3 flex items-center gap-2 bg-amber-50">
                <Clock className="h-5 w-5 text-amber-500" />
                <span className="font-medium">{timeRemaining}</span>
              </Card>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {userData?.hasVoted && !settings?.resultsVisible && (
        <div className="animate-fade-in">
          <Alert className="mb-6 max-w-2xl mx-auto bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle>Vote Confirmed</AlertTitle>
            <AlertDescription className="text-gray-700">
              Your vote has been recorded. Results will be available once the voting period ends.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Controls and filters section */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
        <div className="relative w-full sm:w-auto">
          <input
            type="search"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 pl-10"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">View:</span>
          <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="w-auto">
            <TabsList className="grid w-[180px] grid-cols-2">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredCandidates.length === 0 ? (
        <Card className="p-8 text-center mb-8">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No candidates found</h3>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </Card>
      ) : (
        <Tabs value={viewMode} defaultValue="grid">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          <TabsContent value="grid">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sortedCandidates.map((candidate) => (
                <div key={candidate.id} className="transition-all duration-300 animate-slide-up">
                  <CandidateCard
                    candidate={candidate}
                    selectedCandidate={selectedCandidate}
                    onSelect={setSelectedCandidate}
                    hasVoted={userData?.hasVoted}
                    votingEnabled={settings?.votingEnabled}
                    showResults={settings?.resultsVisible}
                    totalVotes={totalVotes}
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="list">
            <div className="space-y-4 mb-8">
              {sortedCandidates.map((candidate) => (
                <div key={candidate.id} className="transition-all duration-300 animate-slide-right">
                  <Card className={`transition-all duration-200 ${
                    selectedCandidate === candidate.id ? 'border-primary border-2 bg-primary/5' : ''
                  }`}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {candidate.name}
                          {settings?.resultsVisible && (candidate.votes || 0) > 0 && (candidate.votes || 0) === Math.max(...candidates.map(c => c.votes || 0)) && (
                            <Badge variant="default" className="ml-2 bg-amber-500">
                              <Award className="h-3 w-3 mr-1" /> Leading
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{candidate.slogan}</CardDescription>
                      </div>
                      {settings?.votingEnabled && !userData?.hasVoted && (
                        <Button
                          variant={selectedCandidate === candidate.id ? "default" : "outline"}
                          onClick={() => setSelectedCandidate(candidate.id)}
                          className="min-w-[100px]"
                        >
                          {selectedCandidate === candidate.id ? (
                            <><CheckCircle className="h-4 w-4 mr-2" /> Selected</>
                          ) : "Select"}
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-3">{candidate.platform}</p>
                      
                      {settings?.resultsVisible && (
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">
                              {candidate.votes || 0} votes
                            </span>
                            <span className="text-sm font-medium">
                              {totalVotes > 0 
                                ? `${Math.round(((candidate.votes || 0) / totalVotes) * 100)}%` 
                                : '0%'}
                            </span>
                          </div>
                          <Progress 
                            value={totalVotes > 0 ? ((candidate.votes || 0) / totalVotes) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      {!userData?.hasVoted && settings?.votingEnabled && (
        <div className="max-w-md mx-auto animate-fade-in">
          <Card className="border-2 shadow-lg p-6">
            <CardHeader className="pb-2 text-center">
              <CardTitle>Ready to Cast Your Vote?</CardTitle>
              <CardDescription>
                Please review your selection before confirming
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {selectedCandidate ? (
                <div className="p-4 bg-primary/5 rounded-lg mb-4">
                  <p className="font-medium">Your selection:</p>
                  <p className="text-xl font-bold">
                    {candidates.find(c => c.id === selectedCandidate)?.name}
                  </p>
                </div>
              ) : (
                <Alert className="bg-amber-50 border-amber-200 mb-4">
                  <Info className="h-4 w-4 text-amber-500" />
                  <AlertDescription>Please select a candidate to continue</AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleCastVote}
                disabled={!selectedCandidate || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting your vote...
                  </>
                ) : (
                  'Cast Your Vote'
                )}
              </Button>
              <p className="text-sm text-gray-500 text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted">
                      Note: You can only vote once
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Your vote is final and cannot be changed after submission.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </p>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmationOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-2">Confirm Your Vote</h3>
            <p className="mb-4">
              You are about to cast your vote for <strong>{candidates.find(c => c.id === selectedCandidate)?.name}</strong>. 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={cancelVote}>
                Cancel
              </Button>
              <Button 
                onClick={confirmVote} 
                disabled={submitting}
                className="min-w-[120px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Confirm Vote'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations imported from module */}
      import './Voting.module.css';
    </div>
  );
};

export default Voting;