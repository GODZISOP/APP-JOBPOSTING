import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl;
  
  // Exclude auth routes and assets
  if (url.pathname.startsWith('/login') || url.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get('admin_session');

  // Simple token validation (we will just set it to 'authenticated' on login)
  if (!sessionCookie || sessionCookie.value !== 'authenticated') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
