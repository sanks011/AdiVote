import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAllClasses, 
  requestToJoinClass, 
  getUserClassRequests, 
  ClassRequest,
  leaveClass,
  getUserClasses,
  getPendingRequests
} from '../lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, School, Check, X, Clock, Users, Info, LogOut, CheckCircle, UserPlus, AlertCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ClassBrowser = () => {
  const { currentUser, userData } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestingClasses, setRequestingClasses] = useState<{ [key: string]: boolean }>({});
  const [userClasses, setUserClasses] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [userRequests, setUserRequests] = useState<ClassRequest[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        if (!currentUser) return;
        
        // Get all classes
        const allClasses = await getAllClasses();
        setClasses(allClasses);
        
        // Get user's classes
        const userClassList = await getUserClasses(currentUser.uid);
        setUserClasses(userClassList);
        
        // Get user's requests
        const requests = await getUserClassRequests(currentUser.uid);
        setUserRequests(requests);
        
        // Get pending requests
        const pendingReqs = await getPendingRequests(currentUser.uid);
        setPendingRequests(pendingReqs.map(req => req.classId));
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const handleJoinRequest = async (classId: string) => {
    if (!currentUser) return;
    
    try {
      setRequestingClasses(prev => ({ ...prev, [classId]: true }));
      
      await requestToJoinClass(currentUser.uid, classId);
      
      // Update pending requests
      setPendingRequests(prev => [...prev, classId]);
      
      toast.success('Join request sent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send join request');
    } finally {
      setRequestingClasses(prev => ({ ...prev, [classId]: false }));
    }
  };

  const handleLeaveClass = async (classId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in to leave a class');
      return;
    }

    try {
      setRequestingClasses(prev => ({ ...prev, [classId]: true }));
      await leaveClass(currentUser.uid, classId);
      
      // Only refresh user classes if leave was successful
      const updatedClasses = await getUserClasses(currentUser.uid);
      setUserClasses(updatedClasses);
    } catch (error: any) {
      console.error('Error leaving class:', error);
      toast.error(error.message || 'Failed to leave class');
    } finally {
      setRequestingClasses(prev => ({ ...prev, [classId]: false }));
    }
  };
  
  const getRequestStatus = (classId: string) => {
    if (!userRequests) return null;
    const request = userRequests.find(req => req.classId === classId);
    return request ? request.status : null;
  };

  const isUserInClass = (classId: string) => {
    return userClasses.some(cls => cls.id === classId);
  };
  
  const isClassJoined = (classId: string) => {
    return userClasses.some(cls => cls.id === classId);
  };
  
  const isPendingRequest = (classId: string) => {
    return pendingRequests.includes(classId);
  };
  
  // Add helper function to check if user can join more classes
  const canJoinMoreClasses = () => {
    return userData?.isAdmin || userClasses.length === 0;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle>Join Multiple Classes</AlertTitle>
        <AlertDescription>
          {userData?.isAdmin 
            ? "As an admin, you can join multiple classes to manage them."
            : "You can join one class to participate in its elections. Admins can join multiple classes."}
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="browse">
        <TabsList className="mb-4 w-full md:w-auto">
          <TabsTrigger value="browse" className="flex-1 md:flex-initial">
            <Users className="h-4 w-4 mr-2" /> Browse Classes
          </TabsTrigger>
          <TabsTrigger value="myclasses" className="flex-1 md:flex-initial">
            <School className="h-4 w-4 mr-2" /> My Classes
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1 md:flex-initial">
            <Clock className="h-4 w-4 mr-2" /> My Requests
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.length === 0 ? (
              <div className="col-span-full text-center p-8 border rounded-md bg-gray-50">
                <School className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 font-medium">No classes found</p>
                <p className="text-sm text-gray-400 mt-1">Please check back later or contact your administrator</p>
              </div>
            ) : (
              classes.map((classItem) => {
                const requestStatus = getRequestStatus(classItem.id);
                const inClass = isUserInClass(classItem.id);
                
                return (
                  <Card key={classItem.id} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{classItem.name}</CardTitle>
                          <CardDescription>
                            {classItem.description || 'No description available'}
                          </CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <School className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        Admin: {classItem.adminName || 'Unknown'}
                      </p>
                    </CardContent>
                    <CardFooter>
                      {inClass ? (
                        userData?.isAdmin ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <LogOut className="h-3 w-3 mr-1" />
                                Leave Class
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Leave Class?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to leave this class? You will need to request to join again if you want to participate in future elections.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleLeaveClass(classItem.id)}>
                                  Leave Class
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 w-full justify-center py-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Joined
                          </Badge>
                        )
                      ) : isPendingRequest(classItem.id) ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 w-full justify-center py-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Request Pending
                        </Badge>
                      ) : !canJoinMoreClasses() ? (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 w-full justify-center py-1">
                          <Info className="h-3 w-3 mr-1" />
                          Already in a Class
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => handleJoinRequest(classItem.id)} 
                          disabled={requestingClasses[classItem.id]}
                          size="sm"
                          className="w-full"
                        >
                          {requestingClasses[classItem.id] ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Sending Request...
                            </>
                          ) : (
                            <>
                              <School className="h-3 w-3 mr-1" />
                              Request to Join
                            </>
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="myclasses">
          {userClasses.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-gray-50">
              <School className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No Classes Joined</p>
              <p className="text-sm text-gray-400 mt-1">Browse and join classes to participate in elections</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userClasses.map((classItem) => (
                <Card key={classItem.id} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{classItem.name}</CardTitle>
                        <CardDescription>
                          {classItem.description || 'No description available'}
                        </CardDescription>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <School className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      Admin: {classItem.adminName || 'Unknown'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    {userData?.isAdmin ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <LogOut className="h-3 w-3 mr-1" />
                            Leave Class
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Leave Class?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to leave this class? You will need to request to join again if you want to participate in future elections.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleLeaveClass(classItem.id)}>
                              Leave Class
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 w-full justify-center py-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Member
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests">
          {userRequests.length === 0 ? (
            <div className="text-center p-8 border rounded-md bg-gray-50">
              <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">No Requests Found</p>
              <p className="text-sm text-gray-400 mt-1">You haven't made any class join requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {userRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <School className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{request.className || 'Unknown Class'}</h3>
                          <p className="text-xs text-gray-500">
                            Requested on: {request.requestDate?.toDate().toLocaleDateString() || 'Unknown'}
                          </p>
                        </div>
                      </div>
                      {request.status === 'pending' ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      ) : request.status === 'approved' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassBrowser;