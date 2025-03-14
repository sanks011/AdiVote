
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from 'firebase/auth';
import { auth, getUserData, getAllClasses, getClassById } from '../lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  userData: any | null;
  isAdmin: boolean;
  loading: boolean;
  isVerified: boolean;
  refreshUserData: () => Promise<void>;
  userClass: any | null;
  classes: any[] | null;
  refreshClasses: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userData: null,
  isAdmin: false,
  loading: true,
  isVerified: false,
  refreshUserData: async () => {},
  userClass: null,
  classes: null,
  refreshClasses: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userClass, setUserClass] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[] | null>(null);

  const refreshUserData = async () => {
    if (currentUser) {
      try {
        // Force reload the user to get the latest metadata from Firebase Auth
        await currentUser.reload();
        // Update the current user reference to get updated email verification status
        const updatedUser = auth.currentUser;
        setCurrentUser(updatedUser);
        
        if (updatedUser) {
          const data = await getUserData(updatedUser.uid);
          setUserData(data);
          setIsAdmin(data?.isAdmin || false);
          setIsVerified(updatedUser.emailVerified);
          
          // If user has a class, load it
          if (data?.classId) {
            const classData = await getClassById(data.classId);
            setUserClass(classData);
          } else {
            setUserClass(null);
          }
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    }
  };
  
  const refreshClasses = async () => {
    try {
      const allClasses = await getAllClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const data = await getUserData(user.uid);
          setUserData(data);
          setIsAdmin(data?.isAdmin || false);
          setIsVerified(user.emailVerified);
          
          // If user has a class, load it
          if (data?.classId) {
            const classData = await getClassById(data.classId);
            setUserClass(classData);
          }
          
          // Load all classes
          const allClasses = await getAllClasses();
          setClasses(allClasses);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
        setIsVerified(false);
        setUserClass(null);
        setClasses(null);
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
    isVerified,
    refreshUserData,
    userClass,
    classes,
    refreshClasses
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};