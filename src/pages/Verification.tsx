import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginWithEmail, registerWithEmail, checkEmailVerification, handleVerificationSuccess, auth } from '../lib/firebase';
import { toast } from 'sonner';

const Verification = () => {
  const { currentUser, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [checkingVerification, setCheckingVerification] = useState(false);
  
  // Handle verification status check
  useEffect(() => {
    if (currentUser) {
      if (currentUser.emailVerified) {
        navigate('/voting');
      } else {
        setVerificationMessage('Please check your email and verify your account before proceeding.');
        
        // Start polling for email verification
        const intervalId = setInterval(async () => {
          if (currentUser) {
            setCheckingVerification(true);
            const isVerified = await checkEmailVerification(currentUser);
            
            if (isVerified) {
              clearInterval(intervalId);
              // Process the user data before redirecting
              setVerificationMessage('Email verified! Creating your account...');
              
              try {
                // Create/update user in Firestore before redirecting
                await handleVerificationSuccess(currentUser);
                
                // Fully refresh the user data in the auth context
                await refreshUserData();
                
                setVerificationMessage('Email verified! Redirecting to voting page...');
                
                // Add a delay before redirect to ensure Firestore operations complete
                setTimeout(() => {
                  // Log out the verification status for debugging
                  console.log("Verification complete, redirecting to voting page");
                  console.log("User verification status:", currentUser.emailVerified);
                  
                  navigate('/voting');
                }, 3000); // Increased delay to 3 seconds
              } catch (error) {
                console.error('Error during verification process:', error);
                setVerificationMessage('Verification successful but there was an issue setting up your account. Please try logging in.');
                toast.error('Error setting up your account. Please try logging in again.');
              }
            }
            setCheckingVerification(false);
          }
        }, 3000); // Check every 3 seconds
        
        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
      }
    }
  }, [currentUser, navigate, refreshUserData]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError('');
    setVerificationMessage('');
  };
  
  const validateEmail = (email: string) => {
    const studentDomain = "@stu.adamasuniversity.ac.in";
    const facultyDomain = "@adamasuniversity.ac.in";
    return email.endsWith(studentDomain) || email.endsWith(facultyDomain);
  };
  
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationMessage('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please use your college email address');
      setLoading(false);
      return;
    }
    
    try {
      const user = await loginWithEmail(email, password);
      if (user) {
        if (user.emailVerified) {
          // Direct redirect to voting page after successful login
          navigate('/voting');
        } else {
          setVerificationMessage('Please check your email and verify your account before proceeding.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setVerificationMessage('');
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please use your college email address');
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      setLoading(false);
      return;
    }
    
    try {
      const user = await registerWithEmail(email, password);
      if (user) {
        setVerificationMessage('Registration successful! Please check your email to verify your account. You will be automatically redirected once verified.');
        setActiveTab('login');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Student Verification</CardTitle>
            <CardDescription>
              Verify your identity to participate in the CR election
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {verificationMessage && (
              <Alert className="mb-4 bg-primary/10 text-primary border-primary">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationMessage}
                  {checkingVerification && (
                    <span className="block mt-2">
                      <Loader2 className="inline-block h-4 w-4 animate-spin mr-2" />
                      Checking verification status...
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleEmailLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">College Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@stu.adamasuniversity.ac.in"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading || checkingVerification}
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
                          disabled={loading || checkingVerification}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading || checkingVerification}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        'Login'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                <form onSubmit={handleEmailRegister}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">College Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="you@stu.adamasuniversity.ac.in"
                          className="pl-10"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading || checkingVerification}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading || checkingVerification}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading || checkingVerification}
                        />
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={loading || checkingVerification}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Register'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="text-center text-sm text-gray-500">
            <p className="w-full">
              By continuing, you agree to the voting process terms and conditions.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Verification;