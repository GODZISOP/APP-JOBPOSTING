import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Hardcoded credentials
    const adminEmail = 'bkjadmin@gmail.com';
    const adminPassword = 'admin';

    if (email.toLowerCase() === adminEmail && password === adminPassword) {
      const response = NextResponse.json({ success: true }, { status: 200 });
      
      // Set HttpOnly cookie for 30 days
      response.cookies.set({
        name: 'admin_session',
        value: 'authenticated',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      
      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
