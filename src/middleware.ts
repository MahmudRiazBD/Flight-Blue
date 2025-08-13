
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function checkSetupStatus(request: NextRequest): Promise<boolean> {
    try {
        const url = new URL('/api/setup-check', request.url);
        
        // Use fetch with Next.js's default caching. 
        // It intelligently caches but revalidates if the data source changes.
        const response = await fetch(url.toString());

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

    // Skip middleware for static files, API routes, and Next.js internals
    if (pathname.startsWith('/_next') || pathname.startsWith('/api/') || pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)) {
        return NextResponse.next();
    }
    
    // Specifically allow the /api/setup-check route to be accessed
    if (pathname === '/api/setup-check') {
        return NextResponse.next();
    }
    
    const isSetupComplete = await checkSetupStatus(request);
    
    if (!isSetupComplete && pathname !== '/setup') {
        return NextResponse.redirect(new URL('/setup', request.url));
    }

    if (isSetupComplete && pathname === '/setup') {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
