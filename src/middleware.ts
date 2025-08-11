
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory cache for the setup status.
// `null` means we haven't checked yet.
// `true` or `false` is the cached status.
let isSetupComplete: boolean | null = null;

async function checkSetupStatus(request: NextRequest): Promise<boolean> {
    // If we have a cached status, return it immediately to avoid a network call.
    // We only re-check if the status is `false` or `null` on a new request.
    if (isSetupComplete === true) {
        return true;
    }

    try {
        // Use an absolute URL for the fetch request to ensure it works correctly.
        const url = new URL('/api/setup-check', request.url);
        const response = await fetch(url.toString(), {
            // Use 'no-store' to ensure we always get the latest status from the server
            // when we do decide to make a check.
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error(`Middleware setup check failed with status: ${response.status}`);
            return true;
        }

        const data = await response.json();
        
        // Cache the result in memory
        isSetupComplete = data.isSetupComplete;
        return isSetupComplete!;

    } catch (error: any) {
        console.error("Middleware error fetching setup status:", error);
        return true; 
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)) {
        return NextResponse.next();
    }
    
    const setupNeeded = !(await checkSetupStatus(request));
    
    if (setupNeeded && pathname !== '/setup') {
        return NextResponse.redirect(new URL('/setup', request.url));
    }

    if (!setupNeeded && pathname === '/setup') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
