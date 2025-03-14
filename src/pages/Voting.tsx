
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getClassCandidates, getElectionSettings, castVote, Candidate } from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Vote } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CandidateCard from '../components/CandidateCard';
import { toast } from 'sonner';

const Voting = () => {
  const { currentUser, userData, userClass } = useAuth();
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [totalVotes, setTotalVotes] = useState(0);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        if (!userData?.classId) {
          setError('You need to select a class before voting');
          setLoading(false);
          return;
        }
        
        const [candidatesList, electionSettings] = await Promise.all([
          getClassCandidates(userData.classId),
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
      } catch (err) {
        setError('Failed to load candidates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userData]);
  
  const handleCastVote = async () => {
    if (!selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    
    try {
      setSubmitting(true);
      
      if (!currentUser) {
        throw new Error('You must be logged in to vote');
      }
      
      if (!userData?.classId) {
        throw new Error('You need to select a class before voting');
      }
      
      const success = await castVote(currentUser.uid, selectedCandidate, userData.classId);
      
      if (success) {
        toast.success('Your vote has been cast successfully');
        // Navigate to results page if results are visible, otherwise stay on voting page
        if (settings?.resultsVisible) {
          navigate('/results');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-medium">Loading candidates...</h3>
        </div>
      </div>
    );
  }

  if (!settings?.votingEnabled && !userData?.hasVoted) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Voting Not Available</CardTitle>
            <CardDescription className="text-center">
              The voting period has not started yet or has ended.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Please check back later or contact the election administrator.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userClass) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">No Class Selected</CardTitle>
            <CardDescription className="text-center">
              You need to be assigned to a class before you can vote.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Please contact your administrator to be assigned to a class.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="text-center mb-6 md:mb-8 animate-slide-down">
        <div className="inline-block p-2 bg-primary/10 rounded-full mb-4">
          <Vote size={28} className="text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Cast Your Vote</h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          {userData?.hasVoted
            ? 'You have already cast your vote. Thank you for participating!'
            : 'Select your preferred candidate for the Class Representative position. You can only vote once.'}
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4 md:mb-6 max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {userData?.hasVoted && !settings?.resultsVisible && (
        <Alert className="mb-4 md:mb-6 max-w-2xl mx-auto">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Your vote has been recorded. Results will be available once the voting period ends.
          </AlertDescription>
        </Alert>
      )}
      
      {userClass && (
        <div className="mb-6">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-2">Voting in: {userClass.name}</h2>
              <p className="text-sm text-gray-500">{userClass.description || 'Class election'}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
        {candidates.map((candidate) => (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            selectedCandidate={selectedCandidate}
            onSelect={setSelectedCandidate}
            hasVoted={userData?.hasVoted}
            votingEnabled={settings?.votingEnabled}
            showResults={settings?.resultsVisible}
            totalVotes={totalVotes}
          />
        ))}
      </div>
      
      {!userData?.hasVoted && settings?.votingEnabled && (
        <div className="max-w-md mx-auto">
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
              'Cast Vote'
            )}
          </Button>
          <p className="text-xs md:text-sm text-gray-500 text-center mt-4">
            Note: You can only vote once and cannot change your vote after submission.
          </p>
        </div>
      )}
    </div>
  );
};

export default Voting;