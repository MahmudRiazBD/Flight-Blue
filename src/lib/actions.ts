'use server';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";
import { getFirestore, collection, writeBatch, getDocs, doc } from "firebase/firestore";
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
    // To prevent duplicates but avoid a failing list call, we check just one document.
    // If it exists, we assume the database is seeded.
    const sentinelDocRef = doc(db, "packages", packages[0].id);
    const sentinelDoc = await getDocs(collection(db, "packages"));
    if (!sentinelDoc.empty) {
        console.log("Database already contains data. Seeding skipped.");
        return { success: true, message: "Database already contains data. No new data was added." };
    }

    // Seed Packages
    packages.forEach((pkg) => {
      const docRef = doc(collection(db, "packages"), pkg.id);
      batch.set(docRef, pkg);
    });

    // Seed Posts
    posts.forEach((post) => {
      const docRef = doc(collection(db, "posts"), post.id);
      batch.set(docRef, post);
    });

    // Seed Categories
    categories.forEach((cat) => {
      const docRef = doc(collection(db, "categories"), cat.id);
      batch.set(docRef, cat);
    });

    // Seed Destinations
    destinations.forEach((dest) => {
      const docRef = doc(collection(db, "destinations"), dest.id);
      batch.set(docRef, dest);
    });

    // Seed Package Types
    packageTypes.forEach((type) => {
      const docRef = doc(collection(db, "packageTypes"), type.id);
      batch.set(docRef, type);
    });

    await batch.commit();
    console.log("Database seeded successfully!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    // It's very likely a permissions issue if it fails here.
    if (error instanceof Error && 'code' in error && (error as any).code === 'permission-denied') {
        return { success: false, message: "Seeding failed due to Firestore permissions. Please check your security rules." };
    }
    return { success: false, message: "An unexpected error occurred during seeding." };
  }
}
