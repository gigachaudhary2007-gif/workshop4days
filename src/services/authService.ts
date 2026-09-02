import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User } from '../types';

export interface AuthUserProfileRecord {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  avatar?: string;
  gradeLevel?: string;
  studyGoalHours?: number;
  completedTasksToday?: number;
  streakDays?: number;
}

/**
 * Fetch or bootstrap user profile document in Firestore `users/{uid}`
 */
export async function getUserProfile(firebaseUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, 'users', firebaseUser.uid);
  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as AuthUserProfileRecord;
      return {
        id: firebaseUser.uid,
        name: data.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
        email: data.email || firebaseUser.email || '',
        createdAt: data.createdAt || new Date().toISOString(),
        avatar: data.avatar || firebaseUser.photoURL || undefined,
        gradeLevel: data.gradeLevel || 'Grade 12 / AP Scholar',
        studyGoalHours: data.studyGoalHours || 3,
        completedTasksToday: data.completedTasksToday || 0,
        streakDays: data.streakDays || 1,
      };
    }
  } catch (err) {
    console.warn('Could not read user profile from Firestore, using auth fallback', err);
  }

  // Create initial profile if it doesn't exist
  const initialProfile: AuthUserProfileRecord = {
    userId: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student',
    email: firebaseUser.email || '',
    createdAt: new Date().toISOString(),
    avatar: firebaseUser.photoURL || undefined,
    gradeLevel: 'Grade 12 / AP Scholar',
    studyGoalHours: 3,
    completedTasksToday: 0,
    streakDays: 1,
  };

  try {
    await setDoc(userRef, initialProfile, { merge: true });
  } catch (err) {
    console.warn('Could not write initial profile to Firestore', err);
  }

  return {
    id: firebaseUser.uid,
    name: initialProfile.name,
    email: initialProfile.email,
    createdAt: initialProfile.createdAt,
    avatar: initialProfile.avatar,
    gradeLevel: initialProfile.gradeLevel,
    studyGoalHours: initialProfile.studyGoalHours,
    completedTasksToday: initialProfile.completedTasksToday,
    streakDays: initialProfile.streakDays,
  };
}

/**
 * Sign Up with email and password
 * Creates user in Firebase Auth and profile record in Firestore
 */
export async function signUpWithEmail(
  name: string,
  email: string,
  password: string
): Promise<User> {
  // Set local persistence so user remains logged in after refresh
  await setPersistence(auth, browserLocalPersistence);

  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

  // Set Firebase displayName
  if (name.trim()) {
    try {
      await updateProfile(cred.user, { displayName: name.trim() });
    } catch {
      // Non-blocking
    }
  }

  // Create user profile record in Firestore
  const userProfile: AuthUserProfileRecord = {
    userId: cred.user.uid,
    name: name.trim() || email.split('@')[0],
    email: email.trim(),
    createdAt: new Date().toISOString(),
    gradeLevel: 'Grade 12 / AP Scholar',
    studyGoalHours: 3,
    completedTasksToday: 0,
    streakDays: 1,
  };

  try {
    const userRef = doc(db, 'users', cred.user.uid);
    await setDoc(userRef, userProfile);
  } catch (err) {
    console.warn('Could not save user profile in Firestore', err);
  }

  return {
    id: cred.user.uid,
    name: userProfile.name,
    email: userProfile.email,
    createdAt: userProfile.createdAt,
    gradeLevel: userProfile.gradeLevel,
    studyGoalHours: userProfile.studyGoalHours,
    completedTasksToday: userProfile.completedTasksToday,
    streakDays: userProfile.streakDays,
    rememberMe: true,
  };
}

/**
 * Sign In with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string,
  rememberMe: boolean = true
): Promise<User> {
  await setPersistence(
    auth,
    rememberMe ? browserLocalPersistence : browserSessionPersistence
  );

  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const user = await getUserProfile(cred.user);
  return { ...user, rememberMe };
}

/**
 * Sign In with Google Popup
 */
export async function signInWithGoogle(): Promise<User> {
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const cred = await signInWithPopup(auth, provider);
  return await getUserProfile(cred.user);
}

/**
 * Sign Out from Firebase Auth
 */
export async function logoutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Update user profile in Firestore
 */
export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.gradeLevel && { gradeLevel: data.gradeLevel }),
      ...(data.studyGoalHours && { studyGoalHours: data.studyGoalHours }),
      ...(data.avatar && { avatar: data.avatar }),
    });
  } catch (err) {
    console.warn('Could not update Firestore user document', err);
  }
}

/**
 * Subscribe to Firebase Auth state change for persistence
 */
export function onAuthUserChanged(
  callback: (user: User | null, rawUser: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const appUser = await getUserProfile(firebaseUser);
      callback(appUser, firebaseUser);
    } else {
      callback(null, null);
    }
  });
}
