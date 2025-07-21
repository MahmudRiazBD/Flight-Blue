'use server';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirebaseApp } from "./firebase";
import { UserRole } from "@/hooks/use-auth";

type Message = {
  role: "user" | "bot";
  content: string;
};

export async function handleTravelChat(history: Message[], query: string): Promise<string> {
  // The current flow doesn't support history, so we just send the new query.
  // A more advanced implementation would pass the history to the prompt.
  const result = await travelChatbot({ query });
  return result.response;
}

export async function handleCulturalAdvice(destination: string, query: string): Promise<string> {
  const result = await getCulturalAdvice({ destination, query });
  return result.advice;
}


// This is a one-time setup function to ensure the super admin exists.
// In a real production app, this might be handled by a deployment script.
export async function seedSuperAdmin() {
    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail || !superAdminPassword) {
        console.log("Super admin credentials not found in .env, skipping seed.");
        return;
    }

    try {
        const app = getFirebaseApp();
        const db = getFirestore(app);
        const auth = getAuth(app);

        // We can't directly query Auth for an email, so we check our Firestore DB.
        // This is imperfect, as Auth could have a user that Firestore doesn't, but it's a good check.
        // A more robust solution might involve custom claims or a server-side lookup.
        
        // As we can't query users by email client-side, we'll try to create it.
        // If it fails because the email exists, we know it's already there.
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
            const firebaseUser = userCredential.user;
            
            const displayName = "Super Admin";
            await updateProfile(firebaseUser, { displayName });

            const userRef = doc(db, 'users', firebaseUser.uid);
            await setDoc(userRef, {
                email: superAdminEmail,
                firstName: "Super",
                lastName: "Admin",
                role: "superadmin" as UserRole,
                createdAt: serverTimestamp(),
                photoURL: '',
                phone: ''
            });
            console.log("Super admin user created successfully.");

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                console.log("Super admin email already exists in Firebase Auth. Seed process not needed.");
            } else {
                console.error("Error seeding super admin:", error);
            }
        }

    } catch (error) {
        console.error("Error during super admin seed process:", error);
    }
}
