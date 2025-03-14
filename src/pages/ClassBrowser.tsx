
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ClassBrowserComponent from '../components/ClassBrowser';
import { Loader2 } from 'lucide-react';

const ClassBrowserPage = () => {
  const { loading, currentUser, isVerified } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-xl font-medium">Loading...</h3>
        </div>
      </div>
    );
  }

  if (!currentUser || !isVerified) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-medium mb-2">Please Sign In</h3>
          <p className="text-gray-500">
            You need to sign in and verify your email before you can browse and join classes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-10">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl md:text-2xl">Class Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-6">
            Browse available classes and send a request to join. You can only join one class at a time.
          </p>
          <ClassBrowserComponent />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassBrowserPage;