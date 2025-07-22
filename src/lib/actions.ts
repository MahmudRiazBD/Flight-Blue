

'use server';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";
import { getFirestore, collection, writeBatch, getDocs, doc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "./firebase";
import { packages, posts, categories, destinations, packageTypes } from "./data";
import { getAuth } from "firebase/auth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

type Message = {
  role: "user" | "bot";
  content: string;
};

export async function handleTravelChat(history: Message[], query: string): Promise<string> {
  const result = await travelChatbot({ query });
  return result.response;
}

export async function handleCulturalAdvice(destination: string, query: string): Promise<string> {
  const result = await getCulturalAdvice({ destination, query });
  return result.advice;
}

export async function seedDatabase() {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  // Use a temporary auth instance for seeding to not interfere with any logged-in user
  const auth = getAuth(app);
  const batch = writeBatch(db);

  try {
    // Seed Super Admin
    // This is a special case. We need to create the auth user if they don't exist.
    // This is idempotent - it will only create the user once.
    const superAdminEmail = "hello@riaz.com.bd";
    const superAdminPassword = "2002##flightblue.MHR";
    try {
        const userCredential = await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
        // User exists, ensure their Firestore doc is correct
        const userRef = doc(db, "users", userCredential.user.uid);
        batch.set(userRef, {
            email: superAdminEmail,
            username: 'hello',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'superadmin',
            photoURL: '',
            phone: ''
        }, { merge: true }); // Use merge to avoid overwriting existing fields unnecessarily
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // User does not exist, create them
            const userCredential = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
            const userRef = doc(db, "users", userCredential.user.uid);
            batch.set(userRef, {
                email: superAdminEmail,
                username: 'hello',
                firstName: 'Super',
                lastName: 'Admin',
                role: 'superadmin',
                photoURL: '',
                phone: ''
            });
        } else {
            throw error; // Rethrow other auth errors
        }
    }

    // Seed Packages
    packages.forEach((pkg) => {
      const docRef = doc(db, "packages", pkg.id);
      batch.set(docRef, pkg);
    });

    // Seed Posts
    posts.forEach((post) => {
      const docRef = doc(db, "posts", post.id);
      batch.set(docRef, post);
    });

    // Seed Categories
    categories.forEach((cat) => {
      const docRef = doc(db, "categories", cat.id);
      batch.set(docRef, cat);
    });

    // Seed Destinations
    destinations.forEach((dest) => {
      const docRef = doc(db, "destinations", dest.id);
      batch.set(docRef, dest);
    });

    // Seed Package Types
    packageTypes.forEach((type) => {
      const docRef = doc(db, "packageTypes", type.id);
      batch.set(docRef, type);
    });
    
    // Seed default global settings
    const globalSettingsRef = doc(db, "settings", "global");
    batch.set(globalSettingsRef, {
        siteTitle: "Flight Blu",
        logoUrl: "/logo.svg",
        faviconUrl: "/favicon.ico",
        footerDescription: "Your adventure starts here. Discover breathtaking destinations with us.",
        quickLinks: {
            title: "Quick Links",
            links: [
                { id: "fl1-1", label: "About Us", url: "#" },
                { id: "fl1-2", label: "Packages", url: "/packages" },
                { id: "fl1-3", label: "Blog", url: "/blog" },
            ]
        },
        supportLinks: {
            title: "Support",
            links: [
                { id: "fl2-1", label: "FAQ", url: "#" },
                { id: "fl2-2", label: "Terms of Service", url: "#" },
                { id: "fl2-3", label: "Privacy Policy", url: "#" },
            ]
        },
        socialLinks: [
            { id: "soc-1", platform: 'facebook', url: 'https://facebook.com' },
            { id: "soc-2", platform: 'twitter', url: 'https://twitter.com' },
            { id: "soc-3", platform: 'instagram', url: 'https://instagram.com' },
        ],
        googleMapEmbedCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.889926830737!2d90.3881699154402!3d23.75124979467103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8bcd681372b%3A0x5c2b8755e3624576!2sBashundhara%20City!5e0!3m2!1sen!2sbd!4v162254 Bashundhara City Shopping Complex" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
    }, { merge: true });

    // Seed default homepage settings
    const homePageSettingsRef = doc(db, "settings", "homePage");
    batch.set(homePageSettingsRef, {
      heroImageUrl: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      heroTitle: "Your Adventure Awaits",
      heroSubtitle: "Discover breathtaking destinations and create unforgettable memories with Flight Blu.",
      heroButtonLabel: "Explore Packages",
      heroButtonLink: "/packages",
    }, { merge: true });


    await batch.commit();

    // After seeding, sign out the temporary seeding session if it was active
    if (auth.currentUser?.email === superAdminEmail) {
      await signOut(auth);
    }
    
    console.log("Database seeded successfully!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'permission-denied') {
        return { success: false, message: "Seeding failed due to Firestore permissions. Please check your security rules." };
    }
    return { success: false, message: `An unexpected error occurred during seeding: ${error}` };
  }
}
