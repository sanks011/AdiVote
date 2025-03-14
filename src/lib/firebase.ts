import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, User, onAuthStateChanged, reload } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, Timestamp, orderBy, limit, writeBatch } from 'firebase/firestore';
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
    // Check if user already has a pending request for this class
    const requestsRef = collection(db, 'classRequests');
    const q = query(
      requestsRef, 
      where('userId', '==', userId),
      where('classId', '==', classId),
      where('status', '==', 'pending')
    );
    
    const existingRequests = await getDocs(q);
    if (!existingRequests.empty) {
      toast.info('You already have a pending request for this class');
      return null;
    }
    
    // Check if user is already in a class
    const userData = await getUserData(userId);
    if (userData?.classId) {
      toast.error('You are already assigned to a class');
      return null;
    }
    
    // Create the request
    const newRequestRef = doc(collection(db, 'classRequests'));
    const request: ClassRequest = {
      id: newRequestRef.id,
      userId,
      classId,
      status: 'pending',
      requestDate: Timestamp.now()
    };
    
    await setDoc(newRequestRef, request);
    toast.success('Class join request sent successfully');
    return newRequestRef.id;
  } catch (error) {
    console.error('Error requesting to join class:', error);
    toast.error('Failed to send class join request');
    return null;
  }
};

export const getClassRequests = async (classId: string) => {
  try {
    const requestsRef = collection(db, 'classRequests');
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
  } catch (error) {
    console.error('Error getting class requests:', error);
    return [];
  }
};

export const getUserClassRequests = async (userId: string) => {
  try {
    const requestsRef = collection(db, 'classRequests');
    const q = query(requestsRef, where('userId', '==', userId), orderBy('requestDate', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ClassRequest[];
    
    // Add class details
    for (const request of requests) {
      if (request.classId) {
        const classData = await getClassById(request.classId);
        request.className = classData?.name || 'Unknown';
      }
    }
    
    return requests;
  } catch (error) {
    console.error('Error getting user class requests:', error);
    return [];
  }
};

export const approveClassRequest = async (requestId: string) => {
  try {
    const requestRef = doc(db, 'classRequests', requestId);
    const requestSnap = await getDoc(requestRef);
    
    if (!requestSnap.exists()) {
      toast.error('Request not found');
      return false;
    }
    
    const requestData = requestSnap.data() as ClassRequest;
    
    // Add user to class
    await addUserToClass(requestData.userId, requestData.classId);
    
    // Update request status
    await updateDoc(requestRef, {
      status: 'approved',
      responseDate: Timestamp.now()
    });
    
    toast.success('Class request approved');
    return true;
  } catch (error) {
    console.error('Error approving class request:', error);
    toast.error('Failed to approve class request');
    return false;
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
    const q = query(candidatesRef, where('classId', '==', classId), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Candidate[];
  } catch (error) {
    console.error('Error getting class candidates:', error);
    return [];
  }
};

// Update voting functions to include classId
export const castVote = async (userId: string, candidateId: string, classId: string) => {
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
    
    // Check if user belongs to the class
    if (userSnap.exists() && userSnap.data().classId !== classId) {
      toast.error('You can only vote in your assigned class');
      return false;
    }
    
    // Create vote record
    const votesRef = collection(db, 'votes');
    await setDoc(doc(votesRef), {
      userId,
      candidateId,
      classId,
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
    // Create a unique filename to avoid collisions
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

export { auth, db, storage, Timestamp };