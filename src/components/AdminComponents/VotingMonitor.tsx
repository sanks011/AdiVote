
import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp, getDocs, getDoc, doc, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, CheckCircle, Clock, Users, BarChart, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import ClassSelector from './ClassSelector';

interface VoteActivity {
  id: string;
  userId: string;
  candidateId: string;
  timestamp: Timestamp;
  userEmail?: string;
  candidateName?: string;
  className?: string;
}

interface VoteStats {
  totalVotes: number;
  totalVoters: number;
  votesLastHour: number;
  votingRate: number; // Votes per hour
  candidateVotes: { id: string; name: string; votes: number; percentage: number }[];
}

const VotingMonitor = () => {
  const [voteActivity, setVoteActivity] = useState<VoteActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VoteStats>({
    totalVotes: 0,
    totalVoters: 0,
    votesLastHour: 0,
    votingRate: 0,
    candidateVotes: []
  });
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  
  useEffect(() => {
    // Set up real-time listener for recent votes
    const votesRef = collection(db, 'votes');
    let voteQuery;
    
    if (selectedClassId) {
      voteQuery = query(
        votesRef, 
        where('classId', '==', selectedClassId),
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
    } else {
      voteQuery = query(
        votesRef, 
        orderBy('timestamp', 'desc'), 
        limit(20)
      );
    }
    
    const unsubscribe = onSnapshot(voteQuery, async (snapshot) => {
      const voteData: VoteActivity[] = [];
      
      for (const docSnapshot of snapshot.docs) {
        const vote = { id: docSnapshot.id, ...docSnapshot.data() } as VoteActivity;
        
        // Try to get user email and candidate name
        try {
          const userDoc = await getDoc(doc(db, 'users', vote.userId));
          const candidateDoc = await getDoc(doc(db, 'candidates', vote.candidateId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            vote.userEmail = userData.email;
          }
          
          if (candidateDoc.exists()) {
            const candidateData = candidateDoc.data();
            vote.candidateName = candidateData.name;
            
            // Get class name
            if (candidateData.classId) {
              const classDoc = await getDoc(doc(db, 'classes', candidateData.classId));
              if (classDoc.exists()) {
                vote.className = classDoc.data().name;
              }
            }
          }
        } catch (err) {
          console.error("Error fetching related data:", err);
        }
        
        voteData.push(vote);
      }
      
      setVoteActivity(voteData);
      await fetchVoteStats();
      setLoading(false);
    }, (error) => {
      console.error("Error fetching vote activity:", error);
      setLoading(false);
    });
    
    // Set up interval to refresh stats every minute
    const statsInterval = setInterval(fetchVoteStats, 60000);
    
    return () => {
      unsubscribe();
      clearInterval(statsInterval);
    };
  }, [selectedClassId]);

  const fetchVoteStats = async () => {
    try {
      // Get all votes
      const votesRef = collection(db, 'votes');
      let votesQuery;
      
      if (selectedClassId) {
        votesQuery = query(votesRef, where('classId', '==', selectedClassId));
      } else {
        votesQuery = votesRef;
      }
      
      const votesSnapshot = await getDocs(votesQuery);
      const totalVotes = votesSnapshot.size;
      
      // Get unique voters
      const votersSet = new Set();
      votesSnapshot.docs.forEach(doc => {
        votersSet.add(doc.data().userId);
      });
      const totalVoters = votersSet.size;
      
      // Count votes in the last hour
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      let votesLastHour = 0;
      votesSnapshot.docs.forEach(doc => {
        const voteTime = doc.data().timestamp.toDate();
        if (voteTime >= oneHourAgo) {
          votesLastHour++;
        }
      });
      
      // Calculate voting rate (votes per hour)
      const votingRate = votesLastHour;
      
      // Get votes by candidate
      const candidatesRef = collection(db, 'candidates');
      let candidatesQuery;
      
      if (selectedClassId) {
        candidatesQuery = query(candidatesRef, where('classId', '==', selectedClassId));
      } else {
        candidatesQuery = candidatesRef;
      }
      
      const candidatesSnapshot = await getDocs(candidatesQuery);
      const candidateVotes = candidatesSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          votes: data.votes || 0,
          percentage: totalVotes > 0 ? ((data.votes || 0) / totalVotes) * 100 : 0
        };
      }).sort((a, b) => b.votes - a.votes);
      
      setStats({
        totalVotes,
        totalVoters,
        votesLastHour,
        votingRate,
        candidateVotes
      });
    } catch (error) {
      console.error("Error fetching vote statistics:", error);
    }
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Monitor Voting</h2>
        <ClassSelector 
          selectedClassId={selectedClassId} 
          setSelectedClassId={setSelectedClassId} 
        />
      </div>
      
      {/* Voting Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Votes</p>
                <p className="text-2xl font-bold">{stats.totalVotes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Unique Voters</p>
                <p className="text-2xl font-bold">{stats.totalVoters}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Votes (Last Hour)</p>
                <p className="text-2xl font-bold">{stats.votesLastHour}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Voting Rate</p>
                <p className="text-2xl font-bold">{stats.votingRate} <span className="text-sm font-normal text-gray-500">votes/hour</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Candidate Vote Distribution */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Live Vote Distribution {selectedClassId ? 'for Selected Class' : 'Across All Classes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            ) : stats.candidateVotes.length > 0 ? (
              stats.candidateVotes.map(candidate => (
                <div key={candidate.id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{candidate.name}</span>
                    <span className="text-sm">
                      {candidate.votes} votes ({candidate.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={candidate.percentage} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No votes recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity Log */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Voting Activity {selectedClassId ? 'in Selected Class' : 'Across All Classes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : voteActivity.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {voteActivity.map((vote) => (
                  <div key={vote.id} className="flex items-start gap-3 border-b border-gray-100 pb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {vote.userEmail ? (
                          <>User <span className="text-primary">{vote.userEmail}</span> cast a vote</>
                        ) : (
                          <>User <span className="text-primary">{vote.userId.substring(0, 8)}...</span> cast a vote</>
                        )}
                        {vote.candidateName && (
                          <> for <span className="text-primary">{vote.candidateName}</span></>
                        )}
                        {vote.className && (
                          <> in <span className="text-gray-500">{vote.className}</span></>
                        )}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimestamp(vote.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 text-gray-400 mb-2" />
              <p>No voting activity to display</p>
              <p className="text-sm">When students start voting, their activity will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingMonitor;