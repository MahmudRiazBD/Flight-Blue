
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, type Firestore, getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';
import { signupUser } from '@/lib/actions';

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
  signup: (userData: Omit<User, 'uid'>) => Promise<any>;
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

  const signup = useCallback(async (userData: Omit<User, 'uid'>) => {
    try {
      // We now call the server action to handle user creation securely.
      const result = await signupUser(userData);
      if (result.success) {
        return result.user; // Return the user object on success
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      // Re-throw the error so the calling component can handle it
      throw error;
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
