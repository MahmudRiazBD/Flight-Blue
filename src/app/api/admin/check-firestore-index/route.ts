
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getAdminFirestore();
    // This query is now more comprehensive to cover the most complex query in the app (in MediaPicker).
    // This ensures the generated index link from Firebase will cover all necessary fields.
    const mediaCollection = db.collectionGroup('media');
    const q = mediaCollection
        .where('deletedAt', '==', null)
        .where('type', '==', 'image') // This makes the query more specific
        .orderBy('uploadedAt', 'desc')
        .limit(1);

    await q.get();
    
    // If we reach here, the query was successful, meaning the index likely exists.
    return NextResponse.json({ needsIndex: false });
  } catch (error: any) {
    // Firestore throws a 'failed-precondition' error code if an index is missing.
    if (error.code === 'failed-precondition' || (error.details && error.details.includes('index'))) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'your-firebase-project-id';
      
      const errorMessage = error.message || "An error occured";
      // Firebase often includes the direct creation link in the error message.
      const linkFromError = errorMessage.match(/https:\/\/[^\s]+/);

      if (linkFromError) {
        return NextResponse.json({ 
          needsIndex: true, 
          indexCreationLink: linkFromError[0]
        });
      }

      // Fallback to a manually constructed link if the error message doesn't contain one.
      const collectionGroupId = "media"; // The collection group for the index
      const fields = [
        { fieldPath: 'deletedAt', order: 'ASCENDING' },
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'uploadedAt', order: 'DESCENDING' }
      ];

      // Manually construct the URL for Firebase console
      const base_url = `https://console.firebase.google.com/project/${projectId}/firestore/indexes`;
      const params = new URLSearchParams();
      params.append('create_composite', `projects/${projectId}/databases/(default)/collectionGroups/${collectionGroupId}/indexes/__random_name__`);
      
      // JSON stringify the fields and encode them for the URL
      params.append('fields', JSON.stringify(fields));

      const indexCreationLink = `${base_url}?${params.toString()}`;


      return NextResponse.json({ 
        needsIndex: true, 
        indexCreationLink: indexCreationLink
      });
    }
    
    // For any other errors, we'll assume the index is fine and log the error.
    console.error("Error checking Firestore index:", error);
    return NextResponse.json({ error: 'An unexpected error occurred while checking setup.' }, { status: 500 });
  }
}
