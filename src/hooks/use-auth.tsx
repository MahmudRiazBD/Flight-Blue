
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
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, type Firestore, getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import type { FirebaseApp } from 'firebase/app';
import { seedSuperAdmin } from '@/lib/actions';

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
  const [firebaseInstances, setFirebaseInstances] = useState<{ auth: Auth; db: Firestore } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    setFirebaseInstances({ auth, db });

    // Seed the super admin on initial load if not exists
    seedSuperAdmin();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);
        
        const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, 'uid'>;
           if (firebaseUser.email === superAdminEmail && userData.role !== 'superadmin') {
              userData.role = 'superadmin';
              await setDoc(userRef, { role: 'superadmin' }, { merge: true });
           }
          setUser({ uid: firebaseUser.uid, ...userData });
        } else {
           const isSuperAdmin = firebaseUser.email === superAdminEmail;
           const userRole: UserRole = isSuperAdmin ? 'superadmin' : 'customer';
           const nameParts = (firebaseUser.displayName || "New User").split(" ");
           const firstName = nameParts[0] || "New";
           const lastName = nameParts.slice(1).join(" ") || "User";

           const newUser: Omit<User, 'uid'> = {
            email: firebaseUser.email!,
            firstName: firstName,
            lastName: lastName,
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
    if (!firebaseInstances) {
      throw new Error("Firebase is not initialized. Please try again.");
    }
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
    
    const appUser: User = {
        uid: firebaseUser.uid,
        ...userData
    };
    
    setUser(appUser);
    return appUser;
  };

  const signup = async (email: string, password: string, displayName: string, role: UserRole = 'customer') => {
    if (!firebaseInstances) {
      throw new Error("Firebase is not initialized. Please try again.");
    }
    const { auth, db } = firebaseInstances;

    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
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
  };

  const logout = async () => {
    if (!firebaseInstances) {
      return;
    }
    const { auth } = firebaseInstances;
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
