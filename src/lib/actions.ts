
'use server';
import 'dotenv/config';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";
import { getAdminAuth, getAdminFirestore } from './firebase-admin';
import { packages, posts, categories, destinations, packageTypes, bookings, contactMessages } from "./data";
import { CollectionReference, WriteBatch } from "firebase-admin/firestore";
import type { User } from "@/hooks/use-auth";
import type { UserRecord } from "firebase-admin/auth";


export async function handleTravelChat(history: Message[], query: string): Promise<string> {
  const result = await travelChatbot({ query });
  return result.response;
}

export async function handleCulturalAdvice(destination: string, query: string): Promise<string> {
  const result = await getCulturalAdvice({ destination, query });
  return result.advice;
}

type Message = {
  role: "user" | "bot";
  content: string;
};


export async function deleteUser(uid: string) {
    if (!uid) {
        return { success: false, message: "User ID is required." };
    }

    try {
        const adminAuth = getAdminAuth();
        const adminDb = getAdminFirestore();

        await adminAuth.deleteUser(uid);
        
        const userRef = adminDb.collection('users').doc(uid);
        await userRef.delete();

        console.log(`Successfully deleted user ${uid} from Auth and Firestore.`);
        return { success: true, message: `Successfully deleted user ${uid}.`};
    } catch (error: any) {
        console.error(`Failed to delete user ${uid}:`, error);
        
        let message = "An unknown error occurred.";
        if (error.code === 'auth/user-not-found') {
            message = "User not found in Firebase Authentication. They may have already been deleted.";
        } else if (error.code === 'permission-denied' || (error.message && error.message.includes('permission'))) {
            message = "Permission denied. Make sure the server has admin privileges.";
        } else if (error.message && (error.message.includes('access token') || error.message.includes('Credential'))) {
            message = "Could not authenticate to Firebase Admin. " + error.message;
        } else {
            message = error.message;
        }

        return { success: false, message: message };
    }
}

async function seedCollection(collectionName: string, data: any[], db: FirebaseFirestore.Firestore, transform = (item: any) => item) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.limit(1).get();
    
    if (!snapshot.empty) {
        console.log(`Skipping seeding for ${collectionName}: collection is not empty.`);
        return;
    }

    const batch = db.batch();
    data.forEach(item => {
        // Use the item's own ID if it exists, otherwise let Firestore generate one.
        const docRef = item.id ? collectionRef.doc(item.id) : collectionRef.doc();
        // The transform function can be used to modify the item before saving
        const itemData = transform(item);
        // Remove the id from the data object itself before setting
        const { id, ...finalItemData } = itemData;
        batch.set(docRef, finalItemData);
    });

    await batch.commit();
}


export async function emptyTrash(collectionName: string) {
    if (!collectionName) {
        return { success: false, message: "Collection name is required." };
    }
    try {
        const adminDb = getAdminFirestore();
        const collectionRef = adminDb.collection(collectionName);
        const trashQuery = collectionRef.where('deletedAt', '!=', null);
        const snapshot = await trashQuery.get();
        
        if (snapshot.empty) {
            return { success: true, message: "Trash is already empty." };
        }

        const batch = adminDb.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        
        return { success: true, message: `Successfully emptied trash for ${collectionName}.` };
    } catch (error: any) {
        console.error(`Failed to empty trash for ${collectionName}:`, error);
        return { success: false, message: `An error occurred: ${error.message}` };
    }
}

async function seedDatabase(adminId: string) {
  try {
    const adminDb = getAdminFirestore();

    if (!adminId) {
        const errorMessage = "Cannot seed posts because no superadmin user ID was provided.";
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }

    // Seed all collections
    await seedCollection('packages', packages, adminDb);
    await seedCollection('categories', categories, adminDb);
    await seedCollection('destinations', destinations, adminDb);
    await seedCollection('packageTypes', packageTypes, adminDb);
    await seedCollection('bookings', bookings, adminDb);
    await seedCollection('contactMessages', contactMessages, adminDb);

    // Special handling for posts to include authorId
    const postsWithAuthor = posts.map(post => ({...post, authorId: adminId}));
    await seedCollection('posts', postsWithAuthor, adminDb, item => {
        const { id, ...rest } = item; // Use the transform function to strip the ID from the object being written
        return rest;
    });

    // Seed settings
    const batch = adminDb.batch();
    const globalSettingsRef = adminDb.collection("settings").doc("global");
    batch.set(globalSettingsRef, {
        siteTitle: "TripMate",
        logoUrl: "/logo.svg",
        faviconUrl: "/favicon.svg",
        searchEngineVisibility: true,
        footerDescription: "Your adventure starts here. Discover breathtaking destinations with us.",
        quickLinks: {
            title: "Quick Links",
            links: [
                { id: "fl1-1", label: "About Us", url: "/about-us" },
                { id: "fl1-2", label: "Packages", url: "/packages" },
                { id: "fl1-3", label: "Blog", url: "/blog" },
            ]
        },
        supportLinks: {
            title: "Support",
            links: [
                { id: "fl2-1", label: "FAQ", url: "/faq" },
                { id: "fl2-2", label: "Terms of Service", url: "/terms-of-service" },
                { id: "fl2-3", label: "Privacy Policy", url: "/privacy-policy" },
            ]
        },
        socialLinks: [
            { id: "soc-1", platform: 'facebook', url: 'https://facebook.com' },
            { id: "soc-2", platform: 'twitter', url: 'https://twitter.com' },
            { id: "soc-3", platform: 'instagram', url: 'https://instagram.com' },
        ],
        googleMapEmbedCode: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.889926830737!2d90.3881699154402!3d23.75124979467103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8bcd681372b%3A0x5c2b8755e3624576!2sBashundhara%20City!5e0!3m2!1sen!2sbd!4v1622542023537!5m2!1sen!2sbd" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`
    }, { merge: true });

    const homePageSettingsRef = adminDb.collection("settings").doc("homePage");
    batch.set(homePageSettingsRef, {
      heroImageUrl: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      heroTitle: "Your Adventure Awaits",
      heroSubtitle: "Discover breathtaking destinations and create unforgettable memories with TripMate.",
      heroButtonLabel: "Explore Packages",
      heroButtonLink: "/packages",
    }, { merge: true });

    const sitePagesSettingsRef = adminDb.collection("settings").doc("sitePages");
    batch.set(sitePagesSettingsRef, {
        aboutUs: {
            title: "About TripMate",
            content: "Founded in 2024, TripMate was born from a passion for exploration and a desire to make extraordinary travel experiences accessible to everyone. We believe that travel is more than just visiting new places; it's about creating lasting memories, forging new connections, and discovering the world from a different perspective.\\n\\nOur mission is to provide impeccably planned journeys that blend comfort, adventure, and cultural immersion. From the spiritual serenity of Hajj and Umrah to the romantic streets of Paris and the vibrant energy of Tokyo, our curated packages are designed to cater to a wide range of travel styles and interests. We handle all the details, so you can focus on what truly matters: enjoying your journey."
        },
        faq: {
            title: "Frequently Asked Questions",
            items: [
                {id: "faq-1", question: "How do I book a package?", answer: "You can book a package directly through our website by clicking the 'Book Now' button on any package page and filling out the form. Alternatively, you can contact our customer support team for assistance."},
                {id: "faq-2", question: "What is included in the package price?", answer: "Each package is different. Please refer to the 'Inclusions' and 'Exclusions' sections on the specific package page for detailed information."},
                {id: "faq-3", question: "Can I customize a tour package?", answer: "We may be able to accommodate customization requests for private group tours. Please contact us with your specific requirements, and we will do our best to create a tailored itinerary for you."},
                {id: "faq-4", question: "What are the visa requirements?", answer: "Visa requirements vary by destination and your nationality. While we provide visa processing assistance for many packages (like Hajj and Umrah), you are ultimately responsible for ensuring you have the correct travel documents. We recommend checking with the relevant embassy or consulate."},
            ]
        },
        terms: {
            title: "Terms of Service",
            content: "By accessing and using the TripMate website and its services, you agree to comply with and be bound by the following terms and conditions. All bookings are subject to availability and confirmation. A deposit is required to secure your booking, with the full balance due before the departure date. \\n\\nCancellations made within 30 days of departure are subject to cancellation fees. TripMate acts as an agent for third-party suppliers, such as airlines and hotels, and is not liable for any failure by these third parties to provide their services."
        },
        privacy: {
            title: "Privacy Policy",
            content: "TripMate is committed to protecting your privacy. We collect personal information such as your name, email, and phone number solely for the purpose of processing your bookings and providing you with our services. \\n\\nWe do not share your personal information with third parties, except as necessary to fulfill your travel arrangements (e.g., providing your name to an airline). We use appropriate security measures to protect your data from unauthorized access. By using our services, you consent to the collection and use of your information as described in this policy."
        }
    }, { merge: true });


    await batch.commit();
    
    console.log("Database seeded successfully!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error during database seeding:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Credential') || errorMessage.includes('environment variable')) {
        return { success: false, message: `Seeding failed: Firebase Admin credentials are not configured correctly on the server. ${errorMessage}` };
    }
    return { success: false, message: `An unexpected error occurred during seeding: ${errorMessage}` };
  }
}

// Helper function to create user in Auth. Extracted for reuse.
async function createUserInAuth(adminData: Omit<User, 'uid'>): Promise<UserRecord> {
  const adminAuth = getAdminAuth();
  return await adminAuth.createUser({
    email: adminData.email,
    password: adminData.password,
    displayName: `${adminData.firstName} ${adminData.lastName}`,
    photoURL: adminData.photoURL || undefined,
  });
}

export async function signupUser(userData: Omit<User, 'uid'>) {
    try {
        const userRecord = await createUserInAuth(userData);

        const adminDb = getAdminFirestore();
        const userRef = adminDb.collection('users').doc(userRecord.uid);
        
        const { password, ...firestoreData } = userData;
        
        await userRef.set({
            ...firestoreData,
            createdAt: new Date().toISOString(),
        });

        return { success: true, user: { uid: userRecord.uid, ...firestoreData } };
    } catch (error: any) {
        console.error("Error during signup:", error);
        // Provide more specific error messages to the client
        if (error.code === 'auth/email-already-exists') {
            return { success: false, message: "This email is already registered. Please login or use a different email." };
        }
        return { success: false, message: `An unexpected error occurred during signup: ${error.message}` };
    }
}


export async function setupSuperAdminAndSeed(adminData: Omit<User, 'uid'>) {
    try {
        const adminDb = getAdminFirestore();

        const statusRef = adminDb.collection('settings').doc('siteStatus');
        const statusDoc = await statusRef.get();
        if (statusDoc.exists && statusDoc.data()?.isSetupComplete === true) {
            return { success: false, message: "Setup has already been completed. A superadmin exists." };
        }

        const userRecord = await createUserInAuth(adminData);
        
        const userRef = adminDb.collection('users').doc(userRecord.uid);
        await userRef.set({
            ...adminData,
            role: 'superadmin',
            createdAt: new Date().toISOString(),
        });
        
        await seedDatabase(userRecord.uid);
        
        await statusRef.set({ isSetupComplete: true });

        return { success: true, message: "Superadmin created and database seeded successfully." };
    } catch (error: any) {
        console.error("Error during setup:", error);
        return { success: false, message: `An unexpected error occurred during setup: ${error.message}` };
    }
}

async function deleteCollection(db: FirebaseFirestore.Firestore, collectionPath: string, batchSize: number) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.orderBy('__name__').limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db: FirebaseFirestore.Firestore, query: FirebaseFirestore.Query, resolve: (value: unknown) => void) {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
        return resolve(0);
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}


export async function resetApplication() {
    try {
        const adminDb = getAdminFirestore();
        const adminAuth = getAdminAuth();
        const collectionsToDelete = ['users', 'packages', 'posts', 'categories', 'destinations', 'packageTypes', 'bookings', 'contactMessages', 'media'];

        // Batch delete all documents in specified collections
        for (const collectionName of collectionsToDelete) {
             await deleteCollection(adminDb, collectionName, 50);
        }
        
        // Delete the settings documents in a final batch
        const settingsBatch = adminDb.batch();
        settingsBatch.delete(adminDb.collection('settings').doc('global'));
        settingsBatch.delete(adminDb.collection('settings').doc('homePage'));
        settingsBatch.delete(adminDb.collection('settings').doc('sitePages'));
        settingsBatch.delete(adminDb.collection('settings').doc('siteStatus'));
        await settingsBatch.commit();


        // Delete all users from Firebase Auth
        const listUsersResult = await adminAuth.listUsers(1000);
        if (listUsersResult.users.length > 0) {
          const uidsToDelete = listUsersResult.users.map(user => user.uid);
          await adminAuth.deleteUsers(uidsToDelete);
        }

        console.log("Application has been successfully reset.");
        return { success: true, message: "Application has been successfully reset. You will be logged out." };
    } catch (error: any) {
        console.error("Error resetting application:", error);
        return { success: false, message: `Failed to reset application: ${error.message}` };
    }
}
    