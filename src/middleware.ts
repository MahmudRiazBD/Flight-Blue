
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function checkSetupStatus(request: NextRequest): Promise<boolean> {
    try {
        // Use an absolute URL for the fetch request to ensure it works correctly.
        const url = new URL('/api/setup-check', request.url);
        const response = await fetch(url.toString(), {
            // Smartly cache the result for 30 seconds to balance performance and responsiveness.
            next: { revalidate: 30 },
        });

        if (!response.ok) {
            console.error(`Middleware setup check failed with status: ${response.status}`);
            // In case of error, assume setup is complete to avoid locking out the user
            return true;
        }

        const data = await response.json();
        return data.isSetupComplete;

    } catch (error: any) {
        // This can happen on the very first run if the server isn't fully ready.
        console.error("Middleware error fetching setup status:", error);
        // Assume setup is complete to avoid locking out the user in case of a network or other error.
        return true; 
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow static files, _next/static, and API routes to pass through without checks
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)) {
        return NextResponse.next();
    }
    
    const isSetupComplete = await checkSetupStatus(request);
    
    // If setup is needed and the user is not on the setup page, redirect them
    if (!isSetupComplete && pathname !== '/setup') {
        return NextResponse.redirect(new URL('/setup', request.url));
    }

    // If setup is already complete and the user tries to access the setup page, redirect to home
    if (isSetupComplete && pathname === '/setup') {
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
