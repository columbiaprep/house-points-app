
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    if (path.startsWith("/_next/") || path.startsWith("/api/")) {
        return NextResponse.next();
    }
    if(request.cookies.get('auth') === null){
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}
