
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

let isSetupComplete: boolean | null = null;

async function checkSetupStatus() {
    // If we've already checked, don't check again to avoid unnecessary Firestore reads on every request
    if (isSetupComplete !== null) {
        return isSetupComplete;
    }

    try {
        const adminDb = getAdminFirestore();
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.limit(1).get();
        isSetupComplete = !snapshot.empty;
        return isSetupComplete;
    } catch (error: any) {
        // This can happen if the admin credentials aren't set up yet.
        // In this case, we can't check the database, so we'll assume setup is needed.
        if (error.message.includes("Credential")) {
            console.warn("Middleware couldn't connect to Firestore to check setup status. This is expected on first run. Assuming setup is required.");
            isSetupComplete = false;
            return isSetupComplete;
        }
        // For other errors, log them and let the app proceed to avoid blocking it.
        console.error("Middleware error checking setup status:", error);
        isSetupComplete = true; // Assume setup is complete to avoid locking out the user
        return isSetupComplete;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static files, anext/static, and API routes to pass through without checks
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)) {
        return NextResponse.next();
    }
    
    const setupNeeded = !(await checkSetupStatus());
    
    // If setup is needed and the user is not on the setup page, redirect them
    if (setupNeeded && pathname !== '/setup') {
        return NextResponse.redirect(new URL('/setup', request.url));
    }

    // If setup is already complete and the user tries to access the setup page, redirect to home
    if (!setupNeeded && pathname === '/setup') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
