
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { FirebaseApp } from 'firebase/app';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'uid'>;
           if (firebaseUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && userData.role !== 'superadmin') {
              userData.role = 'superadmin';
              await setDoc(userRef, { role: 'superadmin' }, { merge: true });
           }
          setUser({ uid: firebaseUser.uid, ...userData });
        } else {
           const isSuperAdmin = firebaseUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
           const userRole: UserRole = isSuperAdmin ? 'superadmin' : 'customer';
           const newUser: Omit<User, 'uid'> = {
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || 'New User',
            role: userRole,
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), {
             ...newUser,
             createdAt: serverTimestamp(),
          });
          setUser({ uid: firebaseUser.uid, ...newUser });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
       throw new Error("User document not found in Firestore.");
    }
    
    const userData = userDoc.data() as Omit<User, 'uid'>;
    
    const appUser: User = {
        uid: firebaseUser.uid,
        ...userData
    };
    
    setUser(appUser);
    return appUser;
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName });

    const isSuperAdmin = email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    const userRole: UserRole = isSuperAdmin ? 'superadmin' : 'customer';

    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email,
      displayName,
      role: userRole,
      createdAt: serverTimestamp(),
    });
  };

  const logout = async () => {
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
