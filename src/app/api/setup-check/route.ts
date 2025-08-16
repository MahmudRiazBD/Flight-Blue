
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const db = getAdminFirestore();
    const statusRef = db.collection('settings').doc('siteStatus');
    const doc = await statusRef.get();

    if (doc.exists && doc.data()?.isSetupComplete === true) {
      return NextResponse.json({ isSetupComplete: true });
    } else {
      return NextResponse.json({ isSetupComplete: false });
    }
  } catch (error: any) {
    console.error("Error checking setup status:", error);
    // In case of DB error (e.g., permissions), assume not set up to be safe.
    // This could happen on a fresh project before Firestore rules are set.
    return NextResponse.json({ isSetupComplete: false });
  }
}
