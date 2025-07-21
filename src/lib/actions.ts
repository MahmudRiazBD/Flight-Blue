'use server';

import { travelChatbot } from "@/ai/flows/travel-chatbot";
import { getCulturalAdvice } from "@/ai/flows/cultural-advice-chatbot";
import { getFirestore, collection, writeBatch, getDocs } from "firebase/firestore";
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
    // Check if seeding has already been done to avoid duplicates
    const packagesCollection = collection(db, "packages");
    const packagesSnapshot = await getDocs(packagesCollection);
    if (!packagesSnapshot.empty) {
      console.log("Database already seeded.");
      return { success: true, message: "Database already contains data. No new data was added." };
    }

    // Seed Packages
    packages.forEach((pkg) => {
      const docRef = collection(db, "packages");
      batch.set(doc(docRef, pkg.id), pkg);
    });

    // Seed Posts
    posts.forEach((post) => {
      const docRef = collection(db, "posts");
      batch.set(doc(docRef, post.id), post);
    });

    // Seed Categories
    categories.forEach((cat) => {
      const docRef = collection(db, "categories");
      batch.set(doc(docRef, cat.id), cat);
    });

    // Seed Destinations
    destinations.forEach((dest) => {
      const docRef = collection(db, "destinations");
      batch.set(doc(docRef, dest.id), dest);
    });

    // Seed Package Types
    packageTypes.forEach((type) => {
      const docRef = collection(db, "packageTypes");
      batch.set(doc(docRef, type.id), type);
    });

    await batch.commit();
    console.log("Database seeded successfully!");
    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, message: "Error seeding database." };
  }
}
