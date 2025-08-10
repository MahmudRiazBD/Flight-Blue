
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

let isSetupComplete: boolean | null = null;

async function checkSetupStatus(request: NextRequest) {
    // If we've already checked, don't check again to avoid unnecessary API calls on every request
    if (isSetupComplete !== null) {
        return isSetupComplete;
    }

    try {
        // Use an absolute URL for the fetch request
        const url = new URL('/api/setup-check', request.url);
        const response = await fetch(url.toString());

        if (!response.ok) {
            console.error(`Middleware setup check failed with status: ${response.status}`);
            // In case of error, assume setup is complete to avoid locking out the user
            isSetupComplete = true;
            return isSetupComplete;
        }

        const data = await response.json();
        isSetupComplete = data.isSetupComplete;
        return isSetupComplete;

    } catch (error: any) {
        // This can happen on the very first run if the server isn't fully ready.
        console.error("Middleware error fetching setup status:", error);
        // Assume setup is complete to avoid locking out the user in case of a network or other error.
        isSetupComplete = true; 
        return isSetupComplete;
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static files, anext/static, and API routes to pass through without checks
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)) {
        return NextResponse.next();
    }
    
    const setupNeeded = !(await checkSetupStatus(request));
    
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
