
import { NextResponse } from 'next/server';
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getFirestore(getFirebaseApp());
    const mediaCollection = collection(db, 'media');
    
    // This query specifically requires the composite index that was causing the error.
    const q = query(
        mediaCollection, 
        where('deletedAt', '==', null), 
        orderBy('uploadedAt', 'desc'), 
        limit(1)
    );

    await getDocs(q);
    
    // If we reach here, the query was successful, meaning the index likely exists.
    return NextResponse.json({ needsIndex: false });
  } catch (error: any) {
    // Firestore throws a 'failed-precondition' error code if an index is missing.
    if (error.code === 'failed-precondition' || (error.details && error.details.includes('index'))) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-firebase-project-id';
      const databaseId = '(default)';
      
      // This is a generic link structure that pre-fills the fields for creating the required index.
      // NOTE: The fields in the create_composite query param must be in the correct order.
      const indexDefinition = 'CkVwcm9qZWN0cy9' + projectId + '/databases/' + databaseId + '/collectionGroups/media/indexes/firebase-auto-index-' + Date.now();
      const indexCreationLink = `https://console.firebase.google.com/project/${projectId}/firestore/indexes?create_composite=${btoa(indexDefinition)}`;

      const errorMessage = error.message || "An error occured";
      const linkFromError = errorMessage.match(/https:\/\/[^\s]+/);

      return NextResponse.json({ 
        needsIndex: true, 
        indexCreationLink: linkFromError ? linkFromError[0] : indexCreationLink
      });
    }
    
    // For any other errors, we'll assume the index is fine and log the error.
    console.error("Error checking Firestore index:", error);
    return NextResponse.json({ error: 'An unexpected error occurred while checking setup.' }, { status: 500 });
  }
}
