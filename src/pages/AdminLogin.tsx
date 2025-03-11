
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, AlertCircle, Loader2, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginWithEmail } from '../lib/firebase';

const AdminLogin = () => {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (currentUser && isAdmin) {
      navigate('/admin/dashboard');
    } else if (currentUser && !isAdmin) {
      setError('You do not have admin privileges');
    }
  }, [currentUser, isAdmin, navigate]);
  
  const validateEmail = (email: string) => {
    const facultyDomain = "@adamasuniversity.ac.in";
    return email.endsWith(facultyDomain);
  };
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please use your faculty email address');
      setLoading(false);
      return;
    }
    
    try {
      const user = await loginWithEmail(email, password);
      if (user) {
        // If user is authenticated but not admin, this will be caught in the useEffect
        if (user.emailVerified) {
          navigate('/admin/dashboard');
        } else {
          setError('Please verify your email before signing in');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-white">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>
              Sign in to manage the CR election
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleEmailLogin}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Faculty Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@adamasuniversity.ac.in"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="text-center text-sm text-gray-500">
            <p className="w-full">
              Only faculty members with admin privileges can access this area.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;