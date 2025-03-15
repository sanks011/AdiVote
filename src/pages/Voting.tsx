import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  getClassCandidates, 
  getClassElectionSettings, 
  castVote, 
  Candidate,
  getUserClasses,
  subscribeToElectionStatus,
  updateClassElectionSettings
} from '../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2, Vote, School } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CandidateCard from '../components/CandidateCard';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserClasses = async () => {
      try {
        if (!currentUser) return;
        const classes = await getUserClasses(currentUser.uid);
        setUserClasses(classes);
        
        // If user has only one class, select it automatically
        if (classes.length === 1) {
          setSelectedClassId(classes[0].id);
        }
      } catch (error) {
        console.error('Error fetching user classes:', error);
        toast.error('Failed to load your classes');
      }
    };
    
    fetchUserClasses();
  }, [currentUser, userData]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!selectedClassId) {
          setLoading(false);
          return;
        }
        
        // Get candidates
        const candidatesList = await getClassCandidates(selectedClassId);
        setCandidates(candidatesList);
        
        // Subscribe to election status changes
        const unsubscribe = subscribeToElectionStatus(selectedClassId, (electionStatus) => {
          setSettings(electionStatus);
          
          // Auto-disable voting and show results when end time is reached
          const now = new Date();
          const endTime = electionStatus.endDate?.toDate();
          
          if (endTime && now >= endTime && electionStatus.votingEnabled) {
            updateClassElectionSettings(selectedClassId, {
              votingEnabled: false,
              resultsVisible: true
            });
          }
        });
        
        // Calculate total votes
        let votes = 0;
        candidatesList.forEach(candidate => {
          if (candidate.votes) {
            votes += candidate.votes;
          }
        });
        setTotalVotes(votes);
        
        return () => {
          unsubscribe(); // Cleanup subscription
        };
      } catch (err) {
        setError('Failed to load candidates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedClassId]);
  
  const handleVote = async () => {
    if (!currentUser || !selectedCandidate || !selectedClassId) return;
    
    try {
      setSubmitting(true);
      const success = await castVote(currentUser.uid, selectedCandidate, selectedClassId);
      
      if (success) {
        // Refresh the candidates list to update vote counts
        const updatedCandidates = await getClassCandidates(selectedClassId);
        setCandidates(updatedCandidates);
        
        // Update total votes
        let votes = 0;
        updatedCandidates.forEach(candidate => {
          if (candidate.votes) {
            votes += candidate.votes;
          }
        });
        setTotalVotes(votes);
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast.error('Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-medium mb-2">Please Sign In</h3>
          <p className="text-gray-500">
            You need to sign in and verify your email before you can vote.
          </p>
        </div>
      </div>
    );
  }
  
  if (userClasses.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Classes Joined</h3>
          <p className="text-gray-500 mb-4">
            You need to join a class before you can participate in voting.
          </p>
          <Button onClick={() => navigate('/classes')}>
            Browse Classes
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Cast Your Vote</h2>
          <p className="text-sm text-gray-500">Select your preferred candidate</p>
        </div>
        
        {userClasses.length > 1 && (
          <Select
            value={selectedClassId || undefined}
            onValueChange={setSelectedClassId}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {userClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {!selectedClassId ? (
        <Alert className="bg-yellow-50 border-yellow-200">
          <School className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-600">
            Please select a class to view candidates and vote
          </AlertDescription>
        </Alert>
      ) : loading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !settings?.votingEnabled ? (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-600">
            Voting is currently not active for this class. Please check back later.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidate === candidate.id}
                onSelect={() => setSelectedCandidate(candidate.id)}
                totalVotes={totalVotes}
                showResults={settings?.resultsVisible}
                disabled={userData?.hasVoted}
              />
            ))}
          </div>
          
          {!userData?.hasVoted ? (
            <Card>
              <CardContent className="pt-6">
                <Button
                  onClick={handleVote}
                  disabled={!selectedCandidate || submitting}
                  className="w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Casting Vote...
                    </>
                  ) : (
                    <>
                      <Vote className="mr-2 h-4 w-4" />
                      Cast Vote
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                You have already cast your vote. {settings?.resultsVisible ? 'View the results above.' : 'Results will be visible once voting ends.'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
};

export default Voting;