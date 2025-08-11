
import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic'; // Ensures this route is not statically cached

export async function GET(request: Request) {
    try {
        const adminDb = getAdminFirestore();
        const statusRef = adminDb.collection('settings').doc('siteStatus');
        const statusDoc = await statusRef.get();
        
        const isSetupComplete = statusDoc.exists && statusDoc.data()?.isSetupComplete === true;
        
        return NextResponse.json({ isSetupComplete });

    } catch (error: any) {
        console.error("API error checking setup status:", error.message);
        // This can happen if credentials are not set up.
        // In this case, setup is definitely not complete.
        if (error.message.includes('Credential') || error.message.includes('GOOGLE_APPLICATION_CREDENTIALS')) {
            return NextResponse.json({ isSetupComplete: false });
        }
        
        // For other errors, we default to assuming setup is not complete to be safe.
        return NextResponse.json({ isSetupComplete: false });
    }
}
