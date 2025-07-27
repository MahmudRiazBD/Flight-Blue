
'use server';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";
import { getFirestore, collection, writeBatch, getDocs, doc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "./firebase";
import { packages, posts, categories, destinations, packageTypes } from "./data";
import { getAuth } from "firebase/auth";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getAdminAuth, getAdminFirestore } from './firebase-admin';

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

export async function deleteUser(uid: string) {
    if (!uid) {
        return { success: false, message: "User ID is required." };
    }

    try {
        const adminAuth = getAdminAuth();
        const adminDb = getAdminFirestore();

        const batch = adminDb.batch();
        const userRef = adminDb.collection('users').doc(uid);
        batch.delete(userRef);
        
        await adminAuth.deleteUser(uid);
        await batch.commit();

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

export async function seedDatabase() {
  const auth = getAuth(getFirebaseApp());
  const adminDb = getAdminFirestore();
  const batch = adminDb.batch();

  try {
    const superAdminEmail = "hello@riaz.com.bd";
    const superAdminPassword = "2002##flightblue.MHR";
    try {
        await signInWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            const userCredential = await createUserWithEmailAndPassword(auth, superAdminEmail, superAdminPassword);
            const userRef = doc(getFirestore(getFirebaseApp()), "users", userCredential.user.uid);
            await setDoc(userRef, {
                email: superAdminEmail,
                username: 'hello',
                firstName: 'Super',
                lastName: 'Admin',
                role: 'superadmin',
                photoURL: '',
                phone: ''
            });
        } else {
            throw error;
        }
    } finally {
       if (auth.currentUser) {
          await signOut(auth);
       }
    }

    packages.forEach((pkg) => {
      const docRef = adminDb.collection("packages").doc(pkg.id);
      batch.set(docRef, pkg);
    });

    posts.forEach((post) => {
      const docRef = adminDb.collection("posts").doc(post.id);
      batch.set(docRef, post);
    });

    categories.forEach((cat) => {
      const docRef = adminDb.collection("categories").doc(cat.id);
      batch.set(docRef, cat);
    });

    destinations.forEach((dest) => {
      const docRef = adminDb.collection("destinations").doc(dest.id);
      batch.set(docRef, dest);
    });

    packageTypes.forEach((type) => {
      const docRef = adminDb.collection("packageTypes").doc(type.id);
      batch.set(docRef, type);
    });
    
    const globalSettingsRef = adminDb.collection("settings").doc("global");
    batch.set(globalSettingsRef, {
        siteTitle: "Flight Blu",
        logoUrl: "/logo.svg",
        faviconUrl: "/favicon.ico",
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
        googleMapEmbedCode: '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.889926830737!2d90.3881699154402!3d23.75124979467103!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8bcd681372b%3A0x5c2b8755e3624576!2sBashundhara%20City!5e0!3m2!1sen!2sbd!4v162254 Bashundhara City Shopping Complex" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy"></iframe>'
    }, { merge: true });

    const homePageSettingsRef = adminDb.collection("settings").doc("homePage");
    batch.set(homePageSettingsRef, {
      heroImageUrl: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
      heroTitle: "Your Adventure Awaits",
      heroSubtitle: "Discover breathtaking destinations and create unforgettable memories with Flight Blu.",
      heroButtonLabel: "Explore Packages",
      heroButtonLink: "/packages",
    }, { merge: true });

    const sitePagesSettingsRef = adminDb.collection("settings").doc("sitePages");
    batch.set(sitePagesSettingsRef, {
        aboutUs: {
            title: "About Flight Blu",
            content: "Founded in 2024, Flight Blu was born from a passion for exploration and a desire to make extraordinary travel experiences accessible to everyone. We believe that travel is more than just visiting new places; it's about creating lasting memories, forging new connections, and discovering the world from a different perspective.\\n\\nOur mission is to provide impeccably planned journeys that blend comfort, adventure, and cultural immersion. From the spiritual serenity of Hajj and Umrah to the romantic streets of Paris and the vibrant energy of Tokyo, our curated packages are designed to cater to a wide range of travel styles and interests. We handle all the details, so you can focus on what truly matters: enjoying your journey."
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
            content: "By accessing and using the Flight Blu website and its services, you agree to comply with and be bound by the following terms and conditions. All bookings are subject to availability and confirmation. A deposit is required to secure your booking, with the full balance due before the departure date. \\n\\nCancellations made within 30 days of departure are subject to cancellation fees. Flight Blu acts as an agent for third-party suppliers, such as airlines and hotels, and is not liable for any failure by these third parties to provide their services."
        },
        privacy: {
            title: "Privacy Policy",
            content: "Flight Blu is committed to protecting your privacy. We collect personal information such as your name, email, and phone number solely for the purpose of processing your bookings and providing you with our services. \\n\\nWe do not share your personal information with third parties, except as necessary to fulfill your travel arrangements (e.g., providing your name to an airline). We use appropriate security measures to protect your data from unauthorized access. By using our services, you consent to the collection and use of your information as described in this policy."
        }
    }, { merge: true });


    await batch.commit();
    
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
