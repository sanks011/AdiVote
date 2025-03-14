
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllClasses, requestToJoinClass, getUserClassRequests, ClassRequest } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, School, Check, X, Clock, Users, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const ClassBrowser = () => {
  const { currentUser, userData, userClass, refreshUserData } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [userRequests, setUserRequests] = useState<ClassRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allClasses, requests] = await Promise.all([
          getAllClasses(),
          currentUser ? getUserClassRequests(currentUser.uid) : []
        ]);
        
        setClasses(allClasses);
        setUserRequests(requests);
      } catch (error) {
        console.error('Error fetching classes:', error);
        toast.error('Failed to load classes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  const handleRequestJoin = async (classId: string) => {
    if (!currentUser) {
      toast.error('You must be logged in to join a class');
      return;
    }
    
    try {
      setSubmitting(true);
      await requestToJoinClass(currentUser.uid, classId);
      
      // Refresh requests
      const requests = await getUserClassRequests(currentUser.uid);
      setUserRequests(requests);
      
      toast.success('Request to join class sent successfully');
    } catch (error) {
      console.error('Error requesting to join class:', error);
      toast.error('Failed to send join request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getRequestStatus = (classId: string) => {
    const request = userRequests.find(req => req.classId === classId);
    return request ? request.status : null;
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // If user is already in a class, show their current class
  if (userClass) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your Current Class</CardTitle>
            <CardDescription>
              You are currently a member of this class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <School className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">{userClass.name}</h3>
                <p className="text-sm text-gray-500">{userClass.description || 'No description available'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              Contact your administrator if you need to be moved to a different class.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle>Join a Class to Participate</AlertTitle>
        <AlertDescription>
          You must join a class to view election information and vote for candidates. 
          Browse available classes below and send a request to join. Your request must be approved by a class administrator.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="browse">
        <TabsList className="mb-4 w-full md:w-auto">
          <TabsTrigger value="browse" className="flex-1 md:flex-initial">
            <Users className="h-4 w-4 mr-2" /> Browse Classes
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
                    <CardFooter className="border-t bg-gray-50 p-3">
                      {requestStatus === 'pending' ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 w-full justify-center py-1">
                          <Clock className="h-3 w-3 mr-1" />
                          Request Pending
                        </Badge>
                      ) : requestStatus === 'approved' ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 w-full justify-center py-1">
                          <Check className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : requestStatus === 'rejected' ? (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 w-full justify-center py-1">
                          <X className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => handleRequestJoin(classItem.id)} 
                          disabled={submitting}
                          size="sm"
                          className="w-full"
                        >
                          {submitting ? (
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
                      <div>
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