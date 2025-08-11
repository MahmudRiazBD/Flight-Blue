
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function checkSetupStatus(request: NextRequest): Promise<boolean> {
    try {
        // Use an absolute URL for the fetch request to ensure it works correctly.
        const url = new URL('/api/setup-check', request.url);
        
        // Use fetch with its default caching behavior. Next.js is smart about this.
        // It will cache the result but revalidate it if the data source changes.
        const response = await fetch(url.toString(), {
            cache: 'no-store', // Ensures we always get the latest status from the server on every navigation.
        });

        if (!response.ok) {
            console.error(`Middleware setup check failed with status: ${response.status}`);
            // To be safe, if the API fails, we assume setup is complete to avoid locking out users.
            return true;
        }

        const data = await response.json();
        return data.isSetupComplete;

    } catch (error: any) {
        console.error("Middleware error fetching setup status:", error);
        // If there's an error (e.g., server not running), we default to true to avoid locking out the site.
        return true; 
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Ignore static files, images, and API routes to avoid unnecessary checks
    if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)) {
        return NextResponse.next();
    }
    
    const isSetupComplete = await checkSetupStatus(request);
    
    // If setup is NOT complete and the user is NOT on the setup page, redirect them there.
    if (!isSetupComplete && pathname !== '/setup') {
        return NextResponse.redirect(new URL('/setup', request.url));
    }

    // If setup IS complete and the user tries to access the setup page, redirect them away.
    if (isSetupComplete && pathname === '/setup') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Otherwise, continue to the requested page.
    return NextResponse.next();
}

export const config = {
  matcher: [
    // This matcher ensures the middleware runs on all pages except for specific assets.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
