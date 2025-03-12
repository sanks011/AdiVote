
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCandidates, getElectionSettings, getTotalVotes } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, ChevronsUp, Award, Users, Loader2, LockIcon } from 'lucide-react';
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Results = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesList, electionSettings, votes] = await Promise.all([
          getAllCandidates(),
          getElectionSettings(),
          getTotalVotes()
        ]);
        
        setCandidates(candidatesList);
        setSettings(electionSettings);
        setTotalVotes(votes);
        
        // Find the winner
        if (candidatesList.length > 0) {
          const sortedCandidates = [...candidatesList].sort((a, b) => 
            (b.votes || 0) - (a.votes || 0)
          );
          setWinner(sortedCandidates[0]);
          
          // Prepare chart data
          const data = candidatesList.map(candidate => ({
            name: candidate.name,
            votes: candidate.votes || 0,
            fill: candidate.id === sortedCandidates[0].id ? '#2563eb' : '#93c5fd'
          }));
          setChartData(data);
        }
      } catch (err) {
        console.error('Error fetching results:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
  
  if (!settings?.resultsVisible) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
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
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8 animate-slide-down">
        <div className="inline-block p-2 bg-primary/10 rounded-full mb-4">
          <BarChart size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Election Results</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {settings?.votingEnabled 
            ? 'Live results of the ongoing CR election.' 
            : 'Final results of the CR election.'}
        </p>
      </div>
      
      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Winner</p>
                <h3 className="text-2xl font-bold">{winner?.name || 'No winner yet'}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up [animation-delay:100ms]">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Votes</p>
                <h3 className="text-2xl font-bold">{totalVotes}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-slide-up [animation-delay:200ms]">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ChevronsUp size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Leading Margin</p>
                <h3 className="text-2xl font-bold">
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
      <Card className="mb-12 animate-slide-up">
        <CardHeader>
          <CardTitle>Vote Distribution</CardTitle>
          <CardDescription>
            Breakdown of votes received by each candidate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartBarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip 
                  formatter={(value: any) => [`${value} votes`, 'Votes']}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
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
        <Card className="border-primary animate-slide-up">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20">
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
                <div className="inline-flex items-center bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium mb-2">
                  <Award size={16} className="mr-1" />
                  {settings?.votingEnabled ? 'Currently Leading' : 'Winner'}
                </div>
                <h2 className="text-2xl font-bold mb-1">{winner.name}</h2>
                <p className="text-gray-500 mb-3">{winner.position}</p>
                <p className="text-gray-600 mb-3">{winner.bio}</p>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <span className="font-bold text-lg">{winner.votes || 0} votes</span>
                  <span className="text-gray-500">
                    ({totalVotes > 0 ? Math.round(((winner.votes || 0) / totalVotes) * 100) : 0}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* All Candidates */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">All Candidates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold">{candidate.name}</h3>
                <p className="text-gray-500 mb-2">{candidate.position}</p>
                <div className="mt-4">
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${totalVotes > 0 ? Math.round(((candidate.votes || 0) / totalVotes) * 100) : 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">{candidate.votes || 0} votes</span>
                    <span className="text-sm font-medium">
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