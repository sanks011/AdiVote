
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from 'firebase/auth';
import { auth, getUserData } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  userData: any | null;
  isAdmin: boolean;
  loading: boolean;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  isAdmin: false,
  loading: true,
  isVerified: false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const data = await getUserData(user.uid);
        setUserData(data);
        setIsAdmin(data?.isAdmin || false);
        setIsVerified(user.emailVerified);
      } else {
        setUserData(null);
        setIsAdmin(false);
        setIsVerified(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    isAdmin,
    loading,
    isVerified
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};