
'use server';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";
import { getFirestore, collection, writeBatch, getDocs, doc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "./firebase";
import { packages, posts, categories, destinations, packageTypes } from "./data";

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
  const db = getFirestore(getFirebaseApp());
  const batch = writeBatch(db);

  try {
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
    
    // Seed default settings
    const settingsRef = doc(db, "settings", "global");
    batch.set(settingsRef, {
        siteTitle: "Flight Blu",
        logoUrl: "/logo.svg",
        faviconUrl: "/favicon.ico",
        heroImageUrl: "https://placehold.co/1920x1080.png",
        heroTitle: "Your Adventure Awaits",
        heroSubtitle: "Discover breathtaking destinations and create unforgettable memories with Flight Blu.",
        heroButtonLabel: "Explore Packages",
        heroButtonLink: "/packages",
        footerDescription: "Your adventure starts here. Discover breathtaking destinations with us.",
        quickLinks: {
            title: "Quick Links",
            links: [
                { id: "fl1-1", label: "About Us", url: "/about" },
                { id: "fl1-2", label: "Packages", url: "/packages" },
                { id: "fl1-3", label: "Blog", url: "/blog" },
                { id: "fl1-4", label: "Contact", url: "/contact" },
            ]
        },
        supportLinks: {
            title: "Support",
            links: [
                { id: "fl2-1", label: "FAQ", url: "/faq" },
                { id: "fl2-2", label: "Terms of Service", url: "/terms" },
                { id: "fl2-3", label: "Privacy Policy", url: "/privacy" },
            ]
        },
        socialLinks: [],
        googleMapEmbedCode: ''
    });


    await batch.commit();
    console.log("Database seeded successfully!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    if (error instanceof Error && 'code' in error && (error as any).code === 'permission-denied') {
        return { success: false, message: "Seeding failed due to Firestore permissions. Please check your security rules." };
    }
    return { success: false, message: "An unexpected error occurred during seeding." };
  }
}
