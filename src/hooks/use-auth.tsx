
'use client';

import { config } from "dotenv";
config();

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  photoURL?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const db = getFirestore(app);
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'uid'>;
        setUser({ uid: firebaseUser.uid, ...userData });
      } else {
        // This case handles user creation where the doc might not be created yet.
        // We set a temporary user object and expect a redirect or refresh.
        setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || 'New User',
            role: 'customer' // default role
        });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, [handleUser]);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
    const auth = getAuth(app);
    
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const db = getFirestore(app);
    const userRef = doc(db, 'users', firebaseUser.uid);
    let userDoc = await getDoc(userRef);
    
    // Check if the user is the designated superadmin and update role if needed
    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    if (firebaseUser.email === superAdminEmail) {
      const userDocData = userDoc.exists() ? userDoc.data() : {};
      if (userDocData.role !== 'superadmin') {
        await setDoc(userRef, { role: 'superadmin' }, { merge: true });
        userDoc = await getDoc(userRef); // Re-fetch doc after update
      }
    }

    if (!userDoc.exists()) {
        throw new Error("User document not found.");
    }

    const appUser: User = {
        uid: firebaseUser.uid,
        ...userDoc.data() as Omit<User, 'uid'>
    };
    
    setUser(appUser);
    return appUser;
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const auth = getAuth(app);
    const db = getFirestore(app);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName });

    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email,
      displayName,
      role: 'customer',
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
