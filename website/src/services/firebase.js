import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBoONsVDB8q0vgypB6wfgEzPFWzPN4IvJ8",
  authDomain: "quizbuzz-74702.firebaseapp.com",
  projectId: "quizbuzz-74702",
  storageBucket: "quizbuzz-74702.firebasestorage.app",
  messagingSenderId: "23424348039",
  appId: "1:23424348039:web:2b7860e2a0acce418e6d22"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Sign Up with Email
export const signUp = async (username, email, password) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName: username });
  return result.user;
};

// Sign In with Email
export const signIn = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// Sign In with Google
export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

// Sign Out
export const logOut = () => signOut(auth);