
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function checkSetupStatus(request: NextRequest): Promise<boolean> {
    try {
        const url = new URL('/api/setup-check', request.url);
        const response = await fetch(url.toString(), {
            // Prevent caching of this critical check
            cache: 'no-store', 
        });

        if (!response.ok) {
            console.error(`Middleware setup check failed with status: ${response.status}`);
            return true;
        }

        const data = await response.json();
        
        // Ensure we check for the specific property
        if (typeof data.isSetupComplete === 'boolean') {
            return data.isSetupComplete;
        }

        // Default to true if the property is missing to avoid lockout
        console.warn("Middleware warning: 'isSetupComplete' property missing from /api/setup-check response. Defaulting to true.");
        return true;

    } catch (error: any) {
        console.error("Middleware error fetching setup status:", error);
        return true; 
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static files, API routes (except the ones we need to check), and Next.js internals
    if (
        pathname.startsWith('/_next') || 
        pathname.startsWith('/api/auth') || // Allow all auth routes
        pathname.match(/\.(svg|png|jpg|jpeg|gif|ico|css|js)$/)
    ) {
        return NextResponse.next();
    }
    
    // Specifically allow the setup-check API routes themselves
    if (pathname.startsWith('/api/setup-check') || pathname.startsWith('/api/admin/check-firestore-index')) {
        return NextResponse.next();
    }
    
    // For setup page itself, we don't need to run the check again
    if (pathname === '/setup') {
        const isSetupComplete = await checkSetupStatus(request);
        if (isSetupComplete) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    const isSetupComplete = await checkSetupStatus(request);
    
    if (!isSetupComplete) {
        return NextResponse.redirect(new URL('/setup', request.url));
    }

    return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
