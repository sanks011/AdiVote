import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Authentication functions
export const registerWithEmail = async (email: string, password: string) => {
  try {
    // Check if email domain is valid
    if (!isValidEmail(email)) {
      toast.error('Please use your college email to register');
      return null;
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    toast.success('Verification email sent! Please check your inbox');
    return result.user;
  } catch (error: any) {
    console.error('Error registering with email: ', error);
    toast.error(error.message);
    return null;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email domain is valid
    if (!isValidEmail(result.user.email || '')) {
      await signOut(auth);
      toast.error('Please use your college email to sign in');
      return null;
    }
    
    // Check if email is verified
    if (!result.user.emailVerified) {
      toast.error('Please verify your email before signing in');
      return null;
    }
    
    await createOrUpdateUser(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with email: ', error);
    toast.error(error.message);
    return null;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out: ', error);
    return false;
  }
};

// Helper functions
const isValidEmail = (email: string) => {
  const studentDomain = "@stu.adamasuniversity.ac.in";
  const facultyDomain = "@adamasuniversity.ac.in";
  return email.endsWith(studentDomain) || email.endsWith(facultyDomain);
};

export const isAdmin = (email: string) => {
  const facultyDomain = "@adamasuniversity.ac.in";
  return email.endsWith(facultyDomain);
};

// User functions
const createOrUpdateUser = async (user: User) => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.email?.split('@')[0],
      photoURL: null,
      isAdmin: isAdmin(user.email || ''),
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      hasVoted: false
    });
  } else {
    await updateDoc(userRef, {
      lastLogin: Timestamp.now(),
    });
  }
};

export const getUserData = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    return null;
  }
};

// Candidate functions
export interface Candidate {
  id?: string;
  name: string;
  bio: string;
  photoURL: string;
  position: string;
  votes?: number;
}

export const addCandidate = async (candidate: Candidate) => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const newCandidateRef = doc(candidatesRef);
    await setDoc(newCandidateRef, {
      ...candidate,
      id: newCandidateRef.id,
      votes: 0,
      createdAt: Timestamp.now()
    });
    toast.success('Candidate added successfully');
    return newCandidateRef.id;
  } catch (error) {
    console.error('Error adding candidate: ', error);
    toast.error('Failed to add candidate');
    return null;
  }
};

export const updateCandidate = async (id: string, candidate: Partial<Candidate>) => {
  try {
    const candidateRef = doc(db, 'candidates', id);
    await updateDoc(candidateRef, {
      ...candidate,
      updatedAt: Timestamp.now()
    });
    toast.success('Candidate updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating candidate: ', error);
    toast.error('Failed to update candidate');
    return false;
  }
};

export const deleteCandidate = async (id: string) => {
  try {
    const candidateRef = doc(db, 'candidates', id);
    await deleteDoc(candidateRef);
    toast.success('Candidate deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting candidate: ', error);
    toast.error('Failed to delete candidate');
    return false;
  }
};

export const getAllCandidates = async () => {
  try {
    const candidatesRef = collection(db, 'candidates');
    const q = query(candidatesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Candidate[];
  } catch (error) {
    console.error('Error getting candidates: ', error);
    return [];
  }
};

// Voting functions
export const castVote = async (userId: string, candidateId: string) => {
  try {
    // Check if user has already voted
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists() && userSnap.data().hasVoted) {
      toast.error('You have already cast your vote');
      return false;
    }
    
    // Check if voting is enabled
    const settingsRef = doc(db, 'settings', 'election');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists() && !settingsSnap.data().votingEnabled) {
      toast.error('Voting is currently disabled');
      return false;
    }
    
    // Create vote record
    const votesRef = collection(db, 'votes');
    await setDoc(doc(votesRef), {
      userId,
      candidateId,
      timestamp: Timestamp.now()
    });
    
    // Update candidate votes
    const candidateRef = doc(db, 'candidates', candidateId);
    await updateDoc(candidateRef, {
      votes: (await getDoc(candidateRef)).data()?.votes + 1 || 1
    });
    
    // Mark user as voted
    await updateDoc(userRef, {
      hasVoted: true,
      votedAt: Timestamp.now(),
      votedFor: candidateId
    });
    
    toast.success('Your vote has been cast');
    return true;
  } catch (error) {
    console.error('Error casting vote: ', error);
    toast.error('Failed to cast vote');
    return false;
  }
};

export const getTotalVotes = async () => {
  try {
    const votesRef = collection(db, 'votes');
    const snapshot = await getDocs(votesRef);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting total votes: ', error);
    return 0;
  }
};

// Election settings functions
export interface ElectionSettings {
  votingEnabled: boolean;
  resultsVisible: boolean;
  startDate?: Timestamp;
  endDate?: Timestamp;
  electionTitle: string;
  electionDescription: string;
}

export const getElectionSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'election');
    const settingsSnap = await getDoc(settingsRef);
    
    if (settingsSnap.exists()) {
      return settingsSnap.data() as ElectionSettings;
    } else {
      // Initialize with default settings
      const defaultSettings: ElectionSettings = {
        votingEnabled: false,
        resultsVisible: false,
        electionTitle: 'CR Election',
        electionDescription: 'Vote for your Class Representative'
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
  } catch (error) {
    console.error('Error getting election settings: ', error);
    return null;
  }
};

export const updateElectionSettings = async (settings: Partial<ElectionSettings>) => {
  try {
    const settingsRef = doc(db, 'settings', 'election');
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: Timestamp.now()
    });
    toast.success('Election settings updated');
    return true;
  } catch (error) {
    console.error('Error updating election settings: ', error);
    toast.error('Failed to update election settings');
    return false;
  }
};

// Storage functions
export const uploadImage = async (file: File, path: string) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image: ', error);
    return null;
  }
};

export { auth, db, storage };
