
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Vote, CheckCircle, Timer } from 'lucide-react';
import { collection, getDocs, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';
import { db, getElectionSettings } from '../../lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [totalVoters, setTotalVoters] = useState<number | null>(null);
  const [votesCast, setVotesCast] = useState<number | null>(null);
  const [votingStatus, setVotingStatus] = useState<string>('Loading...');
  const [timeRemaining, setTimeRemaining] = useState<string>('--:--:--');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get total registered users (excluding admins)
        const usersRef = collection(db, 'users');
        const usersQuery = query(usersRef, where('isAdmin', '==', false));
        const usersSnapshot = await getCountFromServer(usersQuery);
        setTotalVoters(usersSnapshot.data().count);
        
        // Get total votes cast
        const votesRef = collection(db, 'votes');
        const votesSnapshot = await getCountFromServer(votesRef);
        setVotesCast(votesSnapshot.data().count);
        
        // Get voting status from settings
        const settings = await getElectionSettings();
        if (settings) {
          setVotingStatus(settings.votingEnabled ? 'Active' : 'Not Active');
          
          // Calculate time remaining if end date is set
          if (settings.endDate) {
            const endTime = settings.endDate.toDate();
            const updateTimer = () => {
              const now = new Date();
              const diff = endTime.getTime() - now.getTime();
              
              if (diff <= 0) {
                setTimeRemaining('Ended');
                clearInterval(interval);
              } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                
                setTimeRemaining(
                  `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
              }
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
          } else {
            setTimeRemaining('No End Date');
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const renderValue = (value: any, isLoading: boolean) => {
    if (isLoading) {
      return <Skeleton className="h-8 w-20" />;
    }
    return <div className="text-2xl font-bold">{value}</div>;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Voters</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground ml-auto" />
        </CardHeader>
        <CardContent>
          {renderValue(totalVoters ?? 0, loading)}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
          <Vote className="h-4 w-4 text-muted-foreground ml-auto" />
        </CardHeader>
        <CardContent>
          {renderValue(votesCast ?? 0, loading)}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Voting Status</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground ml-auto" />
        </CardHeader>
        <CardContent>
          {renderValue(votingStatus, loading)}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Time Remaining</CardTitle>
          <Timer className="h-4 w-4 text-muted-foreground ml-auto" />
        </CardHeader>
        <CardContent>
          {renderValue(timeRemaining, loading)}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;