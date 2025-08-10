
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic'; // Ensures this route is not statically cached

export async function GET(request: Request) {
    try {
        const adminDb = getAdminFirestore();
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.limit(1).get();
        const isSetupComplete = !snapshot.empty;
        
        return NextResponse.json({ isSetupComplete });

    } catch (error: any) {
        console.error("API error checking setup status:", error.message);
        // This can happen if credentials are not set up.
        // In this case, setup is definitely not complete.
        if (error.message.includes('Credential') || error.message.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
            return NextResponse.json({ isSetupComplete: false });
        }
        
        // For other errors, we default to true to avoid locking out the site.
        return NextResponse.json({ isSetupComplete: true }, { status: 500 });
    }
}
