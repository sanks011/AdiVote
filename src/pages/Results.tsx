import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCandidates, getElectionSettings, getTotalVotes } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, ChevronsUp, Award, Users, Loader2, 
  LockIcon, PieChart, ListFilter, Search, RefreshCw 
} from 'lucide-react';
import { 
  BarChart as RechartBarChart, 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RechartPieChart,
  Pie, Cell, Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Custom tooltip component for the bar chart
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
        <p className="font-bold">{payload[0].payload.name}</p>
        <p className="text-primary">{`${payload[0].value} votes`}</p>
        <p className="text-gray-500 text-sm">{`${payload[0].payload.percentage}% of total`}</p>
      </div>
    );
  }
  return null;
};

// Type definitions for better type safety
type Candidate = {
  id: string;
  name: string;
  position: string;
  bio: string;
  photoURL: string;
  votes: number;
  percentage?: number;
  fillColor?: string;
};

export type ElectionSettings = {
  votingEnabled: boolean;
  resultsVisible: boolean;
  electionName: string;
  electionDescription?: string;
  startDate?: string;
  endDate?: string;
};

const Results = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [settings, setSettings] = useState<ElectionSettings | null>(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [winner, setWinner] = useState<Candidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('votes-desc');
  const [viewMode, setViewMode] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const [error, setError] = useState<string | null>(null);
  
  const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
  
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [candidatesList, electionSettings, votes] = await Promise.all([
        getAllCandidates(),
        getElectionSettings(),
        getTotalVotes()
      ]);
      
      // Add percentage to candidates
      const enrichedCandidates = candidatesList.map((candidate: Candidate, index: number) => ({
        ...candidate,
        votes: candidate.votes || 0,
        percentage: votes > 0 ? Math.round(((candidate.votes || 0) / votes) * 100) : 0,
        fillColor: COLORS[index % COLORS.length]
      }));
      
      setCandidates(enrichedCandidates);
      setFilteredCandidates(enrichedCandidates);
      setSettings(electionSettings);
      setTotalVotes(votes);
      
      // Find the winner
      if (enrichedCandidates.length > 0) {
        const sortedCandidates = [...enrichedCandidates].sort((a, b) => b.votes - a.votes);
        setWinner(sortedCandidates[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load election data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Set up polling for live updates if voting is enabled
    let intervalId: number | undefined;
    
    const setupPolling = async () => {
      const settings = await getElectionSettings();
      if (settings?.votingEnabled) {
        // Poll for updates every 30 seconds if voting is active
        intervalId = window.setInterval(() => {
          fetchData();
        }, 30000);
      }
    };
    
    setupPolling();
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);
  
  // Filter and sort candidates whenever these values change
  useEffect(() => {
    let result = [...candidates];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(candidate => 
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply view mode filter
    if (viewMode === 'top3') {
      result = [...result].sort((a, b) => b.votes - a.votes).slice(0, 3);
    } else if (viewMode === 'winners' && winner) {
      // Show only candidates with votes >= 50% of winner's votes
      const threshold = winner.votes * 0.5;
      result = result.filter(candidate => candidate.votes >= threshold);
    }
    
    // Apply sorting
    if (sortBy === 'votes-desc') {
      result.sort((a, b) => b.votes - a.votes);
    } else if (sortBy === 'votes-asc') {
      result.sort((a, b) => a.votes - b.votes);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    
    setFilteredCandidates(result);
  }, [candidates, searchQuery, sortBy, viewMode, winner]);
  
  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredCandidates.map(candidate => ({
      ...candidate,
      name: candidate.name.length > 15 ? `${candidate.name.substring(0, 15)}...` : candidate.name,
      fill: candidate.id === winner?.id ? '#2563eb' : '#93c5fd',
      percentage: totalVotes > 0 ? Math.round((candidate.votes / totalVotes) * 100) : 0
    }));
  }, [filteredCandidates, winner, totalVotes]);
  
  // Calculate leading margin
  const leadingMargin = useMemo(() => {
    if (candidates.length < 2) return 0;
    const sortedCandidates = [...candidates].sort((a, b) => b.votes - a.votes);
    return sortedCandidates[0].votes - sortedCandidates[1].votes;
  }, [candidates]);
  
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading election results</h3>
          <p className="text-gray-500">Fetching the latest data, please wait...</p>
          
          <div className="mt-8 space-y-3">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <AlertTitle className="flex items-center">
            <span className="material-icons mr-2">error</span>
            Error Loading Results
          </AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-4">
              <Button onClick={() => fetchData()}>Try Again</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!settings?.resultsVisible) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-lg animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LockIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Results Not Available Yet</CardTitle>
            <CardDescription>
              The election results will be visible once the voting period ends.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-gray-600">Please check back later or contact the election administrator for more information.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate('/')} size="lg" className="px-8">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header with refresh button */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-block p-2 bg-primary/10 rounded-full mb-4">
          <BarChart size={32} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{settings.electionName || 'Election Results'}</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-4">
          {settings.electionDescription || 
            (settings.votingEnabled ? 'Live results of the ongoing election.' : 'Final results of the election.')}
        </p>
        
        {settings.votingEnabled && (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 animate-pulse mb-4">
            Live Results
          </Badge>
        )}
        
        <div className="flex justify-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              fetchData();
            }}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh Results"}
          </Button>
        </div>
      </div>
      
      {/* Stats Row */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="animate-fade-in overflow-hidden">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {settings.votingEnabled ? 'Currently Leading' : 'Winner'}
                </p>
                <h3 className="text-2xl font-bold truncate max-w-[180px]" title={winner?.name || 'No winner yet'}>
                  {winner?.name || 'No winner yet'}
                </h3>
              </div>
            </div>
          </CardContent>
          {winner && (
            <div className="h-1 w-full bg-primary"></div>
          )}
        </Card>
        
        <Card className="animate-fade-in [animation-delay:100ms] overflow-hidden">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Votes</p>
                <h3 className="text-2xl font-bold">{totalVotes.toLocaleString()}</h3>
              </div>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-indigo-500"></div>
        </Card>
        
        <Card className="animate-fade-in [animation-delay:200ms] overflow-hidden">
          <CardContent className="pt-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ChevronsUp size={24} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Leading Margin</p>
                <h3 className="text-2xl font-bold">
                  {leadingMargin.toLocaleString()}
                  {totalVotes > 0 && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({Math.round((leadingMargin / totalVotes) * 100)}%)
                    </span>
                  )}
                </h3>
              </div>
            </div>
          </CardContent>
          <div className="h-1 w-full bg-blue-400"></div>
        </Card>
      </div>
      
      {/* Filter and Controls */}
      <Card className="mb-8 animate-fade-in p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative w-full md:w-auto flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <ListFilter size={16} className="text-gray-500" />
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Candidates</SelectItem>
                  <SelectItem value="top3">Top 3</SelectItem>
                  <SelectItem value="winners">Leading Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="votes-desc">Highest Votes</SelectItem>
                <SelectItem value="votes-asc">Lowest Votes</SelectItem>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>
      
      {/* No Results Message */}
      {filteredCandidates.length === 0 && (
        <Card className="mb-8 p-8 text-center animate-fade-in">
          <div className="mb-4 text-gray-400">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-medium mb-2">No candidates found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? `No candidates matching "${searchQuery}"` : 'No candidates available in this view'}
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setViewMode('all');
          }}>
            Reset Filters
          </Button>
        </Card>
      )}
      
      {/* Results Chart */}
      {filteredCandidates.length > 0 && (
        <Card className="mb-12 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              {chartType === 'bar' ? (
                <BarChart size={20} className="inline mr-2" />
              ) : (
                <PieChart size={20} className="inline mr-2" />
              )}
              Vote Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of votes received by {filteredCandidates.length === candidates.length ? 'all' : 'selected'} candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={chartType} onValueChange={setChartType} className="w-full">
              <TabsList className="mb-6 grid w-[200px] grid-cols-2">
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
                <TabsTrigger value="pie">Pie Chart</TabsTrigger>
              </TabsList>
              
              <TabsContent value="bar" className="w-full">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart 
                      data={chartData} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={100}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Bar 
                        dataKey="votes" 
                        radius={[0, 4, 4, 0]} 
                        isAnimationActive={true}
                        animationDuration={1000}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.id === winner?.id ? '#2563eb' : COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </RechartBarChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="pie" className="w-full">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percentage }) => `${name} (${percentage}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="votes"
                        nameKey="name"
                        isAnimationActive={true}
                        animationDuration={1000}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.id === winner?.id ? '#2563eb' : COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any, name: any, props: any) => 
                          [`${value} votes (${props.payload.percentage}%)`, props.payload.name]
                        }
                      />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Winner Highlight */}
      {winner && (
        <Card className="border-primary mb-12 animate-fade-in overflow-hidden hover:shadow-lg transition-all duration-300">
          <div className="bg-primary/5 px-6 py-2 border-b border-primary/20">
            <div className="flex items-center">
              <Award size={18} className="text-primary mr-2" />
              <span className="font-medium text-primary">
                {settings?.votingEnabled ? 'Currently Leading' : 'Winner'}
              </span>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                <img 
                  src={winner.photoURL || '/placeholder.svg'} 
                  alt={winner.name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium mb-2">
                  <Award size={16} className="mr-1" />
                  {settings?.votingEnabled ? 'Currently Leading' : 'Winner'}
                </div>
                <h2 className="text-2xl font-bold mb-1">{winner.name}</h2>
                <p className="text-gray-500 mb-3">{winner.position}</p>
                <p className="text-gray-600 mb-4 max-w-xl">{winner.bio}</p>
                
                <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1 max-w-xl">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${winner.percentage || 0}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <span className="font-bold text-lg">{winner.votes.toLocaleString()} votes</span>
                  <span className="text-gray-500">
                    ({winner.percentage}%)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* All Candidates */}
      {filteredCandidates.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-2">
            {filteredCandidates.length === candidates.length ? 'All Candidates' : 'Filtered Candidates'}
          </h2>
          <p className="text-gray-500 mb-6">
            Showing {filteredCandidates.length} of {candidates.length} candidates
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate, index) => (
              <Card 
                key={candidate.id} 
                className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-square w-full overflow-hidden relative group">
                  <img 
                    src={candidate.photoURL || '/placeholder.svg'} 
                    alt={candidate.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  {candidate.id === winner?.id && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-white">
                        <Award size={14} className="mr-1" />
                        {settings?.votingEnabled ? 'Leading' : 'Winner'}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold">{candidate.name}</h3>
                  <p className="text-gray-500 mb-4">{candidate.position}</p>
                  
                  <div className="mt-4">
                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-1">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-1000" 
                        style={{ width: `${candidate.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">{candidate.votes.toLocaleString()} votes</span>
                      <span className="text-sm font-medium">
                        {candidate.percentage}%
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t flex justify-between py-3">
                  <p className="text-xs text-gray-500 truncate">
                    {candidate.bio && candidate.bio.length > 50 
                      ? `${candidate.bio.substring(0, 50)}...` 
                      : candidate.bio}
                  </p>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Indication for live updates if voting is enabled */}
      {settings?.votingEnabled && (
        <div className="mt-12 text-center text-gray-500 text-sm flex items-center justify-center">
          <RefreshCw size={14} className="mr-2 animate-spin-slow" />
          Results update automatically while voting is active
        </div>
      )}
    </div>
  );
};

export default Results;