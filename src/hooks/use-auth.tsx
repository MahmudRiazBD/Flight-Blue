
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, Dispatch, SetStateAction } from 'react';
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
import { doc, setDoc, getDoc, serverTimestamp, type Firestore, getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import { initializeApp, deleteApp, type FirebaseApp } from 'firebase/app';

export type UserRole = 'customer' | 'staff' | 'admin' | 'superadmin';

export interface User {
  uid: string;
  email: string | null;
  username?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  photoURL?: string | null;
  password?: string; // Only used for creation, not stored
}

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  login: (identifier: string, password: string, rememberMe?: boolean) => Promise<User>;
  signup: (userData: Omit<User, 'uid'>) => Promise<FirebaseUser>;
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
           // This case is for users that exist in Auth but not in Firestore,
           // e.g., after a Firestore clear. We default them to 'customer'.
           const role = "customer";

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

  const login = useCallback(async (identifier: string, password: string, rememberMe: boolean = true): Promise<User> => {
    const app = getFirebaseApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    let loginEmail = identifier;

    // If identifier doesn't look like an email, assume it's a username
    if (!identifier.includes('@')) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error("No user found with that username.");
        }
        
        // Assuming usernames are unique
        const userDoc = querySnapshot.docs[0].data();
        loginEmail = userDoc.email;
    }

    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
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

  const signup = useCallback(async (userData: Omit<User, 'uid'>): Promise<FirebaseUser> => {
    const mainApp = getFirebaseApp();
    const db = getFirestore(mainApp);

    // Create a temporary secondary app instance for user creation
    // This prevents the current user from being signed out
    const tempAppName = `temp-signup-${Date.now()}`;
    const tempApp = initializeApp(mainApp.options, tempAppName);
    const tempAuth = getAuth(tempApp);
    
    try {
        const userCredential = await createUserWithEmailAndPassword(tempAuth, userData.email!, userData.password!);
        const firebaseUser = userCredential.user;
        const displayName = `${userData.firstName} ${userData.lastName}`;

        await updateProfile(firebaseUser, { displayName, photoURL: userData.photoURL || null });

        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Don't save password in firestore
        const { password, ...firestoreData } = userData;

        await setDoc(userRef, {
            ...firestoreData,
            username: userData.username || extractUsernameFromEmail(userData.email!),
            createdAt: serverTimestamp(),
            photoURL: userData.photoURL || '',
            phone: userData.phone || ''
        });
        
        return firebaseUser;

    } catch (error) {
        // Re-throw the error so the calling component can handle it
        throw error;
    } finally {
        // Clean up the temporary app instance
        await deleteApp(tempApp);
    }
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
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
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
