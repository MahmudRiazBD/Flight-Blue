
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
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
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
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
  const [firebaseInstances, setFirebaseInstances] = useState<{ app: FirebaseApp; auth: Auth; db: Firestore } | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Initialize Firebase on the client side
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    setFirebaseInstances({ app, auth, db });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'uid'>;
          setUser({ uid: firebaseUser.uid, ...userData });
        } else {
           const isSuperAdmin = firebaseUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
           const userRole: UserRole = isSuperAdmin ? 'superadmin' : 'customer';
           const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || 'New User',
            role: userRole,
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), {
             ...newUser,
             createdAt: serverTimestamp(),
          });
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
    if (!firebaseInstances) throw new Error("Firebase not initialized");
    const { auth, db } = firebaseInstances;

    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
       throw new Error("User document not found in Firestore.");
    }
    
    const userData = userDoc.data() as Omit<User, 'uid'>;
    
    if (firebaseUser.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL && userData.role !== 'superadmin') {
      userData.role = 'superadmin';
      await setDoc(userRef, { role: 'superadmin' }, { merge: true });
    }

    const appUser: User = {
        uid: firebaseUser.uid,
        ...userData
    };
    
    setUser(appUser);
    return appUser;
  };

  const signup = async (email: string, password: string, displayName: string) => {
    if (!firebaseInstances) throw new Error("Firebase not initialized");
    const { auth, db } = firebaseInstances;

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
    if (!firebaseInstances) throw new Error("Firebase not initialized");
    const { auth } = firebaseInstances;
    await signOut(auth);
    setUser(null);
    router.push('/');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading: loading || !firebaseInstances, login, signup, logout }}>
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
