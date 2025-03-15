import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getClassCandidates, getElectionSettings, getTotalVotes, getUserClasses, getClassElectionSettings } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, ChevronsUp, Award, Users, Loader2, LockIcon, School } from 'lucide-react';
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import LiveChat from '../components/LiveChat';

const Results = () => {
  const navigate = useNavigate();
  const { currentUser, userClass } = useAuth();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState('');
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
  }, [currentUser]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!selectedClassId) {
          setLoading(false);
          return;
        }
        
        // Get election settings first
        const electionSettings = await getClassElectionSettings(selectedClassId);
        if (!electionSettings) {
          throw new Error('Failed to load election settings');
        }
        
        setSettings(electionSettings);
        
        // Only fetch results if they're visible
        if (!electionSettings.resultsVisible) {
          setLoading(false);
          return;
        }
        
        const [candidatesList] = await Promise.all([
          getClassCandidates(selectedClassId)
        ]);
        
        setCandidates(candidatesList);
        
        // Find the winner
        if (candidatesList.length > 0) {
          const sortedCandidates = [...candidatesList].sort((a, b) => 
            (b.votes || 0) - (a.votes || 0)
          );
          setWinner(sortedCandidates[0]);
          
          // Calculate total votes
          let totalVotes = 0;
          candidatesList.forEach(candidate => {
            totalVotes += candidate.votes || 0;
          });
          setTotalVotes(totalVotes);
          
          // Prepare chart data
          const data = candidatesList.map(candidate => ({
            name: candidate.name.length > 15 ? candidate.name.substring(0, 12) + '...' : candidate.name,
            votes: candidate.votes || 0,
            fill: candidate.id === sortedCandidates[0].id ? '#2563eb' : '#93c5fd'
          }));
          setChartData(data);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load election results');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedClassId]);
  
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-medium">Loading results...</h3>
        </div>
      </div>
    );
  }
  
  if (!selectedClassId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <School className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Select a Class</CardTitle>
            <CardDescription className="text-center">
              Please select a class to view its election results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedClassId || undefined}
              onValueChange={setSelectedClassId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a class" />
              </SelectTrigger>
              <SelectContent>
                {userClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!settings?.resultsVisible) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 space-y-6">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <LockIcon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Results Not Available</CardTitle>
            <CardDescription className="text-center">
              The election results will be visible once the voting period ends.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Please check back later or contact the election administrator.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
        {/* Live Chat Section */}
        <LiveChat classId={selectedClassId as string} currentUser={currentUser} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Error</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <div className="text-center mb-6 md:mb-8 animate-slide-down">
        <div className="inline-block p-2 bg-primary/10 rounded-full mb-3 md:mb-4">
          <BarChart size={28} className="text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Election Results</h1>
        <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
          {settings?.votingEnabled 
            ? 'Live results of the ongoing CR election.' 
            : 'Final results of the CR election.'}
        </p>
      </div>
      
      {userClass && (
        <div className="mb-6">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <h2 className="text-lg font-medium mb-2">Results for: {userClass.name}</h2>
              <p className="text-sm text-gray-500">{userClass.description || 'Class election results'}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-12">
        <Card className="animate-slide-up">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500">Winner</p>
                <h3 className="text-lg md:text-2xl font-bold">{winner?.name || 'No winner yet'}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up [animation-delay:100ms]">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500">Total Votes</p>
                <h3 className="text-lg md:text-2xl font-bold">{totalVotes}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up [animation-delay:200ms] col-span-2 md:col-span-1">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ChevronsUp size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500">Leading Margin</p>
                <h3 className="text-lg md:text-2xl font-bold">
                  {candidates.length > 1 
                    ? ((winner?.votes || 0) - (candidates.sort((a, b) => (b.votes || 0) - (a.votes || 0))[1]?.votes || 0)) 
                    : 0}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Results Chart */}
      <Card className="mb-8 md:mb-12 animate-slide-up overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Vote Distribution</CardTitle>
          <CardDescription>
            Breakdown of votes received by each candidate
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="h-60 md:h-80 w-full min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value} votes`, 'Votes']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="votes" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </RechartBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Winner Highlight */}
      {winner && (
        <Card className="border-primary animate-slide-up mb-8">
          <CardContent className="pt-4 md:pt-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-primary/20">
                <img 
                  src={winner.photoURL || '/placeholder.svg'} 
                  alt={winner.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center bg-primary/10 px-3 py-1 rounded-full text-primary text-xs md:text-sm font-medium mb-2">
                  <Award size={14} className="mr-1" />
                  {settings?.votingEnabled ? 'Currently Leading' : 'Winner'}
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-1">{winner.name}</h2>
                <p className="text-sm md:text-base text-gray-500 mb-2 md:mb-3">{winner.position}</p>
                <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{winner.bio}</p>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <span className="font-bold text-base md:text-lg">{winner.votes || 0} votes</span>
                  <span className="text-gray-500 text-sm">
                    ({totalVotes > 0 ? Math.round(((winner.votes || 0) / totalVotes) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* All Candidates */}
      <div className="mt-6 md:mt-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">All Candidates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {candidates.map(candidate => (
            <Card key={candidate.id} className="overflow-hidden">
              <div className="aspect-square w-full overflow-hidden">
                <img 
                  src={candidate.photoURL || '/placeholder.svg'} 
                  alt={candidate.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <CardContent className="pt-4 md:pt-6">
                <h3 className="text-lg md:text-xl font-bold">{candidate.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{candidate.position}</p>
                <div className="mt-3 md:mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${totalVotes > 0 ? Math.round(((candidate.votes || 0) / totalVotes) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs md:text-sm text-gray-500">{candidate.votes || 0} votes</span>
                    <span className="text-xs md:text-sm font-medium">
                      {totalVotes > 0 ? Math.round(((candidate.votes || 0) / totalVotes) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;