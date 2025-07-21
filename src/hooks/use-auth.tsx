
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
  username: string;
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

const extractUsernameFromEmail = (email: string) => email.split('@')[0];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    const seedSuperAdmin = async () => {
        const hasRunKey = 'superAdminSeeded_v5';
        if (sessionStorage.getItem(hasRunKey)) {
            return;
        }

        console.log("Attempting to seed super admin...");
        
        const superAdminEmail = "hello@riaz.com.bd";
        const superAdminPassword = "2002##flightblue.MHR";
        
        try {
            // This is a temporary auth instance for seeding, not for the main app state
            const tempAuth = getAuth(getFirebaseApp());
            
            // Try to sign in first to check if user exists in Auth
            try {
                const userCredential = await signInWithEmailAndPassword(tempAuth, superAdminEmail, superAdminPassword);
                const firebaseUser = userCredential.user;
                console.log("Super admin already exists in Auth. Checking Firestore...");

                const userRef = doc(db, 'users', firebaseUser.uid);
                const userDoc = await getDoc(userRef);

                if (!userDoc.exists()) {
                    console.log("Super admin document not found in Firestore. Creating it...");
                    await setDoc(userRef, {
                        email: superAdminEmail,
                        username: extractUsernameFromEmail(superAdminEmail),
                        firstName: 'Super',
                        lastName: 'Admin',
                        role: 'superadmin' as UserRole,
                        createdAt: serverTimestamp(),
                        photoURL: '',
                        phone: ''
                    });
                    console.log("Super admin Firestore document re-created.");
                }
                 await signOut(tempAuth);


            } catch (error: any) {
                if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                    // User does not exist in Auth, create them
                    console.log("Super admin not found in Auth. Creating new super admin...");
                    const userCredential = await createUserWithEmailAndPassword(tempAuth, superAdminEmail, superAdminPassword);
                    const firebaseUser = userCredential.user;
                    console.log("Super admin auth user created successfully.");

                    const userRef = doc(db, 'users', firebaseUser.uid);
                    await setDoc(userRef, {
                        email: superAdminEmail,
                        username: extractUsernameFromEmail(superAdminEmail),
                        firstName: 'Super',
                        lastName: 'Admin',
                        role: 'superadmin' as UserRole,
                        createdAt: serverTimestamp(),
                        photoURL: '',
                        phone: ''
                    });
                    console.log("Super admin user document created in Firestore.");
                    await signOut(tempAuth);
                    console.log("Super admin seeding session signed out.");
                } else {
                     console.error("Error during super admin check/creation:", error);
                }
            }

        } catch (error: any) {
            console.error("Outer error creating super admin:", error);
        } finally {
            sessionStorage.setItem(hasRunKey, 'true');
        }
    };
    
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
           const role = firebaseUser.email === "hello@riaz.com.bd" ? "superadmin" : "customer";

           const newUser: Omit<User, 'uid'> = {
            email: firebaseUser.email!,
            username: extractUsernameFromEmail(firebaseUser.email!),
            firstName: firstName,
            lastName: lastName,
            role: role,
            phone: '',
            photoURL: firebaseUser.photoURL || ''
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), {
             ...newUser,
             createdAt: serverTimestamp(),
          });
           console.log(`User document for ${firebaseUser.email} was missing, recreated with role: ${role}`);
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
       throw new Error("User document not found in Firestore. It will be recreated upon refresh.");
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
      username: extractUsernameFromEmail(email),
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
