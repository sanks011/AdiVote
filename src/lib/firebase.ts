import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, User, onAuthStateChanged, reload } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, Timestamp, orderBy, limit, writeBatch, increment, arrayUnion, arrayRemove, deleteField, serverTimestamp, addDoc } from 'firebase/firestore';
import { getDatabase, ref as rtdbRef, onValue, set as rtdbSet, serverTimestamp as rtdbServerTimestamp } from 'firebase/database';
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
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);
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

// New function to check email verification status
export const checkEmailVerification = async (user: User): Promise<boolean> => {
  try {
    // Reload the user to get the latest data from Firebase
    await reload(user);
    return user.emailVerified;
  } catch (error) {
    console.error('Error checking email verification: ', error);
    return false;
  }
};

// New function to handle verification success
export const handleVerificationSuccess = async (user: User): Promise<boolean> => {
  try {
    // Make sure user is reloaded to get latest verification status
    await reload(user);
    
    // Ensure the user document exists in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      // Create a new user document if it doesn't exist
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.email?.split('@')[0],
        photoURL: null,
        isAdmin: isAdmin(user.email || ''),
        createdAt: Timestamp.now(),
        lastLogin: Timestamp.now(),
        hasVoted: false,
        emailVerified: user.emailVerified
      });
    } else {
      // Update the existing user document
      await updateDoc(userRef, {
        lastLogin: Timestamp.now(),
        emailVerified: user.emailVerified
      });
    }
    
    console.log("User document created/updated successfully");
    return true;
  } catch (error) {
    console.error('Error handling verification success: ', error);
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

// Class Management
export interface Class {
  id?: string;
  name: string;
  description: string;
  adminId: string;
  adminName?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export const createClass = async (className: string, description: string, adminId: string) => {
  try {
    const classesRef = collection(db, 'classes');
    const newClassRef = doc(classesRef);
    
    await setDoc(newClassRef, {
      id: newClassRef.id,
      name: className,
      description: description,
      adminId: adminId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    toast.success('Class created successfully');
    return newClassRef.id;
  } catch (error) {
    console.error('Error creating class:', error);
    toast.error('Failed to create class');
    return null;
  }
};

export const updateClass = async (classId: string, updates: Partial<Class>) => {
  try {
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    toast.success('Class updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating class:', error);
    toast.error('Failed to update class');
    return false;
  }
};

export const deleteClass = async (classId: string) => {
  try {
    // First, remove all users from this class
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('classId', '==', classId));
    const querySnapshot = await getDocs(q);
    
    const batchOps = writeBatch(db);
    querySnapshot.forEach((userDoc) => {
      batchOps.update(userDoc.ref, { classId: null });
    });
    
    // Delete the class
    const classRef = doc(db, 'classes', classId);
    batchOps.delete(classRef);
    
    await batchOps.commit();
    toast.success('Class deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting class:', error);
    toast.error('Failed to delete class');
    return false;
  }
};

export const getAllClasses = async () => {
  try {
    const classesRef = collection(db, 'classes');
    const q = query(classesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    const classes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Class[];
    
    // Add admin names
    for (const classItem of classes) {
      if (classItem.adminId) {
        const adminData = await getUserData(classItem.adminId);
        classItem.adminName = adminData?.displayName || 'Unknown';
      }
    }
    
    return classes;
  } catch (error) {
    console.error('Error getting classes:', error);
    return [];
  }
};

export const getClassById = async (classId: string) => {
  try {
    const classRef = doc(db, 'classes', classId);
    const classSnap = await getDoc(classRef);
    
    if (classSnap.exists()) {
      return { id: classSnap.id, ...classSnap.data() } as Class;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting class:', error);
    return null;
  }
};

export const getClassUsers = async (classId: string) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('classId', '==', classId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting class users:', error);
    return [];
  }
};

export const addUserToClass = async (userId: string, classId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      classId: classId,
      updatedAt: Timestamp.now()
    });
    
    toast.success('User added to class successfully');
    return true;
  } catch (error) {
    console.error('Error adding user to class:', error);
    toast.error('Failed to add user to class');
    return false;
  }
};

export const removeUserFromClass = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      classId: null,
      updatedAt: Timestamp.now()
    });
    
    toast.success('User removed from class successfully');
    return true;
  } catch (error) {
    console.error('Error removing user from class:', error);
    toast.error('Failed to remove user from class');
    return false;
  }
};

// Class request functionality
export interface ClassRequest {
  id?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  classId: string;
  className?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: Timestamp;
  responseDate?: Timestamp;
}

export const requestToJoinClass = async (userId: string, classId: string) => {
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    // Get class data
    const classDoc = await getDoc(doc(db, 'classes', classId));
    if (!classDoc.exists()) {
      throw new Error('Class not found');
    }
    const classData = classDoc.data();

    // Check class membership restrictions for non-admin users
    if (!userData.isAdmin) {
      const userClasses = userData.classes || [];
      if (userClasses.length > 0) {
        throw new Error('You can only join one class at a time');
      }
    }

    // Check if request already exists
    const requestsRef = collection(db, 'classRequests');
    const q = query(
      requestsRef,
      where('userId', '==', userId),
      where('classId', '==', classId),
      where('status', '==', 'pending')
    );
    const existingRequests = await getDocs(q);
    
    if (!existingRequests.empty) {
      throw new Error('You already have a pending request for this class');
    }

    // Create new request
    await addDoc(collection(db, 'classRequests'), {
      userId,
      userName: userData.displayName || userData.email?.split('@')[0] || 'Unknown User',
      userEmail: userData.email,
      classId,
      className: classData.name,
      status: 'pending',
      requestDate: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('Error requesting to join class:', error);
    throw error;
  }
};

export const getClassRequests = async (classId: string) => {
  try {
    const requestsRef = collection(db, 'classRequests');
    // Try the indexed query first
    try {
      const q = query(
        requestsRef,
        where('classId', '==', classId),
        where('status', '==', 'pending'),
        orderBy('requestDate', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClassRequest[];
      
      // Add user details
      for (const request of requests) {
        if (request.userId) {
          const userData = await getUserData(request.userId);
          request.userName = userData?.displayName || userData?.email?.split('@')[0] || 'Unknown';
          request.userEmail = userData?.email;
        }
      }
      
      return requests;
    } catch (indexError) {
      // If index is building, fall back to basic query
      console.warn('Index building, falling back to basic query');
      const basicQuery = query(
        requestsRef,
        where('classId', '==', classId),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(basicQuery);
      const requests = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClassRequest[];
      
      // Add user details
      for (const request of requests) {
        if (request.userId) {
          const userData = await getUserData(request.userId);
          request.userName = userData?.displayName || userData?.email?.split('@')[0] || 'Unknown';
          request.userEmail = userData?.email;
        }
      }
      
      return requests;
    }
  } catch (error) {
    console.error('Error getting class requests:', error);
    return [];
  }
};

export const getUserClassRequests = async (userId: string): Promise<ClassRequest[]> => {
  try {
    const requestsRef = collection(db, 'classRequests');
    // Try the indexed query first
    try {
      const q = query(
        requestsRef,
        where('userId', '==', userId),
        orderBy('requestDate', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClassRequest[];
    } catch (indexError) {
      // If index is building, fall back to basic query
      console.warn('Index building, falling back to basic query');
      const basicQuery = query(
        requestsRef,
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(basicQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ClassRequest[];
    }
  } catch (error) {
    console.error('Error getting user class requests:', error);
    return []; // Return empty array instead of throwing
  }
};

export const approveClassRequest = async (requestId: string) => {
  try {
    const requestRef = doc(db, 'classRequests', requestId);
    const requestDoc = await getDoc(requestRef);
    
    if (!requestDoc.exists()) {
      throw new Error('Request not found');
    }
    
    const requestData = requestDoc.data() as ClassRequest;
    const { userId, classId } = requestData;
    
    // Get class details
    const classDoc = await getDoc(doc(db, 'classes', classId));
    if (!classDoc.exists()) {
      throw new Error('Class not found');
    }
    const classData = classDoc.data();
    
    // Start a batch write
    const batch = writeBatch(db);
    
    // Update request status
    batch.update(requestRef, {
      status: 'approved',
      responseDate: Timestamp.now()
    });
    
    // Add class to user's classes array with timestamp
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      classes: arrayUnion({
        id: classId,
        name: classData.name,
        joinedAt: Timestamp.now()
      })
    });
    
    // Commit the batch
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
};

export const rejectClassRequest = async (requestId: string) => {
  try {
    const requestRef = doc(db, 'classRequests', requestId);
    
    await updateDoc(requestRef, {
      status: 'rejected',
      responseDate: Timestamp.now()
    });
    
    toast.success('Class request rejected');
    return true;
  } catch (error) {
    console.error('Error rejecting class request:', error);
    toast.error('Failed to reject class request');
    return false;
  }
};

// Candidate management
export const updateCandidate = async (candidateId: string, updates: Partial<Candidate>) => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    await updateDoc(candidateRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    
    toast.success('Candidate updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating candidate:', error);
    toast.error('Failed to update candidate');
    return false;
  }
};

export const deleteCandidate = async (candidateId: string) => {
  try {
    const candidateRef = doc(db, 'candidates', candidateId);
    await deleteDoc(candidateRef);
    
    toast.success('Candidate deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting candidate:', error);
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
    console.error('Error getting candidates:', error);
    return [];
  }
};

// Update the candidate interface to include classId
export interface Candidate {
  id?: string;
  name: string;
  bio: string;
  photoURL: string;
  position: string;
  classId?: string;
  votes?: number;
}

// Update candidate functions to support classId
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

// Update to get candidates for a specific class
export const getClassCandidates = async (classId: string) => {
  try {
    const candidatesRef = collection(db, 'candidates');
    
    try {
      // Try the indexed query first
      const q = query(candidatesRef, where('classId', '==', classId), orderBy('name'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Candidate[];
    } catch (indexError) {
      // If index is building, fall back to basic query
      console.warn('Index building, falling back to basic query');
      const basicQuery = query(candidatesRef, where('classId', '==', classId));
      const querySnapshot = await getDocs(basicQuery);
      
      // Sort the results in memory
      const candidates = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Candidate[];
      
      return candidates.sort((a, b) => a.name.localeCompare(b.name));
    }
  } catch (error) {
    console.error('Error getting class candidates:', error);
    return [];
  }
};

// Update voting functions to include classId
export const castVote = async (userId: string, candidateId: string, classId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      toast.error('User not found');
      return false;
    }
    
    const userData = userDoc.data();
    
    // Check if user has already voted in this class
    const votesRef = collection(db, 'votes');
    const existingVoteQuery = query(
      votesRef,
      where('userId', '==', userId),
      where('classId', '==', classId)
    );
    const existingVoteSnap = await getDocs(existingVoteQuery);
    
    if (!existingVoteSnap.empty) {
      toast.error('You have already voted in this class for this session');
      return false;
    }
    
    // Get candidate
    const candidateRef = doc(db, 'candidates', candidateId);
    const candidateDoc = await getDoc(candidateRef);
    
    if (!candidateDoc.exists()) {
      toast.error('Candidate not found');
      return false;
    }
    
    // Check if candidate belongs to the correct class
    const candidateData = candidateDoc.data();
    if (candidateData.classId !== classId) {
      toast.error('Invalid candidate for this class');
      return false;
    }
    
    const batch = writeBatch(db);
    
    // Update candidate votes
    batch.update(candidateRef, {
      votes: increment(1)
    });
    
    // Add vote record
    const voteRef = doc(collection(db, 'votes'));
    batch.set(voteRef, {
      userId,
      candidateId,
      classId,
      timestamp: serverTimestamp()
    });
    
    await batch.commit();
    toast.success('Your vote has been cast successfully');
    return true;
  } catch (error) {
    console.error('Error casting vote:', error);
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

// Election settings interfaces
export interface ElectionSettings {
  votingEnabled: boolean;
  resultsVisible: boolean;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  electionTitle: string;
  electionDescription: string;
}

export interface ClassElectionSettings extends ElectionSettings {
  classId: string;
}

export const getElectionSettings = async () => {
  try {
    const settingsRef = doc(db, 'settings', 'election');
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // Initialize default settings
      const defaultSettings: ElectionSettings = {
        votingEnabled: false,
        resultsVisible: false,
        startDate: null,
        endDate: null,
        electionTitle: 'Class Election',
        electionDescription: 'Vote for your Class Representative'
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
    
    return settingsDoc.data() as ElectionSettings;
  } catch (error) {
    console.error('Error getting election settings:', error);
    return null;
  }
};

export const updateElectionSettings = async (settings: Partial<ElectionSettings>): Promise<void> => {
  try {
    const settingsRef = doc(db, 'settings', 'election');
    await updateDoc(settingsRef, settings);
    toast.success('Election settings updated successfully');
  } catch (error) {
    console.error('Error updating election settings:', error);
    toast.error('Failed to update election settings');
    throw error;
  }
};

// Storage functions
export const uploadImage = async (file: File, path: string) => {
  try {
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const fullPath = `${path}/${uniqueFilename}`;
    
    const storageRef = ref(storage, fullPath);
    
    // Set metadata to handle CORS
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'Access-Control-Allow-Origin': '*'
      }
    };
    
    // Upload the file with metadata
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    if (!downloadURL) {
      throw new Error('Failed to get download URL');
    }
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image. Please try again.');
    return null;
  }
};

export const leaveClass = async (userId: string, classId: string) => {
  try {
    // Check user role
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    // Only admins can leave classes
    if (!userData.isAdmin) {
      throw new Error('Only administrators can leave classes');
    }

    // Get current classes array
    const currentClasses = userData.classes || [];
    const updatedClasses = currentClasses.filter((cls: any) => cls.id !== classId);

    const batch = writeBatch(db);
    
    // Update user document with filtered classes array
    batch.update(doc(db, 'users', userId), {
      classes: updatedClasses
    });
    
    // Remove any pending requests
    const requestsRef = collection(db, 'classRequests');
    const requestsQuery = query(requestsRef, where('userId', '==', userId), where('classId', '==', classId));
    const requestsSnap = await getDocs(requestsQuery);
    
    requestsSnap.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    toast.success('Successfully left the class');
    return true;
  } catch (error) {
    console.error('Error leaving class:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to leave class');
    return false;
  }
};

export const getUserClasses = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    
    // If user has no classes array, return empty array
    if (!userData.classes) {
      return [];
    }
    
    // Get full class details for each class ID
    const classPromises = userData.classes.map(async (classRef: { id: string }) => {
      const classDoc = await getDoc(doc(db, 'classes', classRef.id));
      if (classDoc.exists()) {
        return {
          id: classDoc.id,
          ...classDoc.data()
        };
      }
      return null;
    });
    
    const classes = await Promise.all(classPromises);
    return classes.filter(Boolean); // Remove any null values
  } catch (error) {
    console.error('Error getting user classes:', error);
    return [];
  }
};

export const subscribeToElectionStatus = (classId: string, callback: (settings: ElectionSettings) => void) => {
  const db = getDatabase();
  const electionRef = rtdbRef(db, `elections/${classId}`);
  
  const unsubscribe = onValue(electionRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Convert ISO date strings back to Date objects
      const settings: ElectionSettings = {
        ...data,
        startDate: data.startDate ? Timestamp.fromDate(new Date(data.startDate)) : null,
        endDate: data.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null
      };
      callback(settings);
    }
  });
  
  return unsubscribe;
};

export const updateElectionStatusRealtime = async (classId: string, settings: Partial<ElectionSettings>) => {
  const db = getDatabase();
  const electionRef = rtdbRef(db, `elections/${classId}`);
  
  // Convert Timestamps to ISO strings for storage in RTDB, handling null/undefined values
  const rtdbSettings = {
    ...settings,
    startDate: settings.startDate ? settings.startDate.toDate().toISOString() : null,
    endDate: settings.endDate ? settings.endDate.toDate().toISOString() : null,
    lastUpdated: rtdbServerTimestamp()
  };
  
  // Remove any undefined values before setting
  Object.keys(rtdbSettings).forEach(key => {
    if (rtdbSettings[key] === undefined) {
      delete rtdbSettings[key];
    }
  });
  
  await rtdbSet(electionRef, rtdbSettings);
};

export const getClassElectionSettings = async (classId: string): Promise<ClassElectionSettings | null> => {
  try {
    const settingsRef = doc(db, 'settings', `election_${classId}`);
    const settingsDoc = await getDoc(settingsRef);
    
    if (!settingsDoc.exists()) {
      // Initialize default settings for the class
      const defaultSettings: ClassElectionSettings = {
        classId,
        votingEnabled: false,
        resultsVisible: false,
        startDate: null,
        endDate: null,
        electionTitle: 'Class Election',
        electionDescription: 'Vote for your Class Representative'
      };
      
      await setDoc(settingsRef, defaultSettings);
      return defaultSettings;
    }
    
    return { ...settingsDoc.data(), classId } as ClassElectionSettings;
  } catch (error) {
    console.error('Error getting class election settings:', error);
    return null;
  }
};

export const updateClassElectionSettings = async (classId: string, settings: Partial<ElectionSettings>): Promise<void> => {
  try {
    // Update Firestore
    const settingsRef = doc(db, 'settings', `election_${classId}`);
    await updateDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    });

    // Update Realtime Database
    await updateElectionStatusRealtime(classId, settings);
    
    toast.success('Election settings updated successfully');
  } catch (error) {
    console.error('Error updating class election settings:', error);
    toast.error('Failed to update election settings');
    throw error;
  }
};

export const resetClassVotes = async (classId: string): Promise<boolean> => {
  try {
    const batch = writeBatch(db);
    
    // 1. Reset all candidate votes in this class
    const candidatesRef = collection(db, 'candidates');
    const candidatesQuery = query(candidatesRef, where('classId', '==', classId));
    const candidatesSnapshot = await getDocs(candidatesQuery);
    
    candidatesSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { votes: 0 });
    });
    
    // 2. Reset voting status for all users in this class
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('votedInClass', '==', classId));
    const usersSnapshot = await getDocs(usersQuery);
    
    usersSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        hasVoted: false,
        votedFor: deleteField(),
        votedInClass: deleteField(),
        votedAt: deleteField()
      });
    });
    
    // 3. Delete all vote records for this class
    const votesRef = collection(db, 'votes');
    const votesQuery = query(votesRef, where('classId', '==', classId));
    const votesSnapshot = await getDocs(votesQuery);
    
    votesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // 4. Reset election settings
    const settingsRef = doc(db, 'settings', `election_${classId}`);
    batch.update(settingsRef, {
      votingEnabled: false,
      resultsVisible: false,
      startDate: null,
      endDate: null,
      updatedAt: serverTimestamp()
    });
    
    // 5. Reset realtime database election status
    const electionStatusRef = rtdbRef(rtdb, `elections/${classId}`);
    await rtdbSet(electionStatusRef, {
      votingEnabled: false,
      resultsVisible: false,
      startDate: null,
      endDate: null,
      lastUpdated: rtdbServerTimestamp()
    });
    
    await batch.commit();
    toast.success('Election data reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting class votes:', error);
    toast.error('Failed to reset election data');
    return false;
  }
};

export const getPendingRequests = async (userId: string): Promise<ClassRequest[]> => {
  try {
    const requestsRef = collection(db, 'classRequests');
    const requestsQuery = query(
      requestsRef,
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(requestsQuery);
    const requests: ClassRequest[] = [];
    
    for (const docSnapshot of snapshot.docs) {
      const request = { id: docSnapshot.id, ...docSnapshot.data() } as ClassRequest;
      
      // Get class name if not already included
      if (!request.className && request.classId) {
        const classDoc = await getDoc(doc(db, 'classes', request.classId));
        if (classDoc.exists()) {
          const classData = classDoc.data() as Class;
          request.className = classData.name;
        }
      }
      
      requests.push(request);
    }
    
    return requests;
  } catch (error) {
    console.error('Error getting pending requests:', error);
    throw new Error('Failed to get pending requests');
  }
};

export { auth, db, storage, Timestamp };