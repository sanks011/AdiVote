
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserData } from '../lib/firebase';
import { Loader2, User, Mail, Calendar, Vote, Clock } from 'lucide-react';
import { format } from 'date-fns';

const UserProfile = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [votedCandidate, setVotedCandidate] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      try {
        const data = await getUserData(currentUser.uid);
        setUserData(data);

        // If user has voted, fetch candidate info
        if (data && data.votedFor) {
          // Fetch candidate info
          // For simplicity, we'll leave this part empty for now
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-medium">Loading profile...</h3>
        </div>
      </div>
    );
  }

  if (!currentUser || !userData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Not Logged In</CardTitle>
            <CardDescription className="text-center">
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Card className="mb-8">
        <CardHeader className="pb-0">
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <CardDescription>
            View and manage your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-2 border-primary/20">
              <AvatarFallback className="text-2xl">
                {userData.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">{userData.displayName || userData.email?.split('@')[0]}</h2>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Mail className="h-4 w-4" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Joined: {userData.createdAt ? format(userData.createdAt.toDate(), 'MMMM d, yyyy') : 'Unknown'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="info">Account Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voting History</CardTitle>
            </CardHeader>
            <CardContent>
              {userData.hasVoted ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <Vote className="h-5 w-5" />
                    <span className="font-medium">You have voted in this election</span>
                  </div>
                  
                  {userData.votedAt && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Voted on: {format(userData.votedAt.toDate(), 'MMMM d, yyyy h:mm a')}</span>
                    </div>
                  )}
                  
                  {votedCandidate && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">You voted for:</h3>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={votedCandidate.photoURL} />
                          <AvatarFallback>{votedCandidate.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{votedCandidate.name}</p>
                          <p className="text-sm text-gray-500">{votedCandidate.position}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Vote className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">You have not voted in the current election</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Display Name</p>
                <p>{userData.displayName || userData.email?.split('@')[0]}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Email</p>
                <p>{userData.email}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Account Type</p>
                <p>{userData.isAdmin ? 'Administrator' : 'Student'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Last Login</p>
                <p>{userData.lastLogin ? format(userData.lastLogin.toDate(), 'MMMM d, yyyy h:mm a') : 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;