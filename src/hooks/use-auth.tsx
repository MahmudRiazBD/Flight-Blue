
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
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
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, type Firestore, getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import type { FirebaseApp } from 'firebase/app';

export type UserRole = 'customer' | 'staff' | 'admin' | 'superadmin';

export interface User {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  photoURL?: string | null;
  password?: string; // Only used for creation, not stored
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>;
  signup: (email: string, password: string, name: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const seedSuperAdmin = async () => {
        const hasRunKey = 'superAdminSeeded_v3';
        if (sessionStorage.getItem(hasRunKey)) {
            return;
        }

        console.log("Attempting to seed super admin...");
        
        const superAdminEmail = "hello@riaz.com.bd";
        const superAdminPassword = "2002##flightblue.MHR";
        
        try {
            // Try to create the user. If it fails because the email exists, that's fine.
            const userCredential = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
            console.log("Super admin auth user created successfully.");

            const firebaseUser = userCredential.user;
            if (firebaseUser) {
                const userRef = doc(db, 'users', firebaseUser.uid);
                await setDoc(userRef, {
                    email: superAdminEmail,
                    firstName: 'Super',
                    lastName: 'Admin',
                    role: 'superadmin' as UserRole,
                    createdAt: serverTimestamp(),
                    photoURL: '',
                    phone: ''
                });
                console.log("Super admin user document created in Firestore.");
                // Sign out immediately after seeding to not affect current user session
                await signOut(auth);
                console.log("Super admin seeding session signed out.");
            }
             sessionStorage.setItem(hasRunKey, 'true');

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log("Super admin email already exists. Seeding process complete.");
            } else {
                 console.error("Error creating super admin:", error);
            }
            // Even if it fails (e.g. already exists), we mark it as run to avoid retries.
            sessionStorage.setItem(hasRunKey, 'true');
        }
    };
    
    // We run this only on the client side
    if (typeof window !== "undefined") {
      seedSuperAdmin();
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'uid'>;
          setUser({ uid: firebaseUser.uid, ...userData });
        } else {
           const nameParts = (firebaseUser.displayName || "New User").split(" ");
           const firstName = nameParts[0] || "New";
           const lastName = nameParts.slice(1).join(" ") || "User";

           const newUser: Omit<User, 'uid'> = {
            email: firebaseUser.email!,
            firstName: firstName,
            lastName: lastName,
            role: 'customer',
            phone: '',
            photoURL: firebaseUser.photoURL || ''
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

  const login = useCallback(async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    
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
  }, []);

  const signup = useCallback(async (email: string, password: string, displayName: string, role: UserRole = 'customer') => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const superAdminEmail = "hello@riaz.com.bd";
    if (email === superAdminEmail) {
        throw new Error("Cannot register with super admin email.");
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    await updateProfile(firebaseUser, { displayName });

    const nameParts = displayName.split(' ');
    const firstName = nameParts[0] || displayName;
    const lastName = nameParts.slice(1).join(' ') || '';

    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      createdAt: serverTimestamp(),
      photoURL: '',
      phone: ''
    });
  }, []);

  const logout = useCallback(async () => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    router.push('/');
    router.refresh();
  }, [router]);

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
