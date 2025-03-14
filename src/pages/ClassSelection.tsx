
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addUserToClass } from '../lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { School, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';

const ClassSelection = () => {
  const { currentUser, userData, isVerified, classes, userClass, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // If user is not logged in or not verified, redirect to verification page
    if (!currentUser || !isVerified) {
      navigate('/verification');
      return;
    }
    
    // If user already has a class, redirect to voting page
    if (userClass) {
      navigate('/voting');
    }
  }, [currentUser, isVerified, userClass, navigate]);
  
  const handleClassSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClass) {
      setError('Please select a class');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (!currentUser) {
        throw new Error('You must be logged in to select a class');
      }
      
      // Add user to selected class
      await addUserToClass(currentUser.uid, selectedClass);
      
      // Refresh user data to get the updated class
      await refreshUserData();
      
      // Redirect to voting page
      navigate('/voting');
    } catch (error: any) {
      setError(error.message || 'Failed to join class');
    } finally {
      setLoading(false);
    }
  };
  
  if (!classes || classes.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">No Classes Available</CardTitle>
            <CardDescription className="text-center">
              There are currently no classes available to join.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Please contact your administrator to create a class for you.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <School className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Select Your Class</CardTitle>
            <CardDescription>
              Join a class to participate in the CR election
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleClassSelect}>
              <div className="space-y-4">
                <RadioGroup value={selectedClass || ''} onValueChange={setSelectedClass}>
                  {classes.map((classItem) => (
                    <div key={classItem.id} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-gray-50">
                      <RadioGroupItem value={classItem.id} id={classItem.id} />
                      <div className="flex-1">
                        <Label htmlFor={classItem.id} className="font-medium cursor-pointer">
                          {classItem.name}
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">{classItem.description}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                
                <Button type="submit" className="w-full mt-6" disabled={loading || !selectedClass}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining class...
                    </>
                  ) : (
                    'Join Selected Class'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="text-center text-sm text-gray-500">
            <p className="w-full">
              Note: You can only join one class at a time, and this can only be changed by an administrator.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ClassSelection;