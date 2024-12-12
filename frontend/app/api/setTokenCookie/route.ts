import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  if(!body["token"]) {
    return NextResponse.json({ message: 'Token is required' }, { status: 400 });
  }

  const token = body["token"];

  // Create the cookie with the token
  const cookieHeader = serialize('firebaseToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  const response = NextResponse.json({ message: 'Cookie set successfully' });
  response.headers.append('Set-Cookie', cookieHeader);

  return response;
}

export async function DELETE() {
  // Create a cookie with an expired maxAge to clear it
  const clearCookie = serialize('firebaseToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1, // Immediately expires the cookie
    path: '/',
  });

  const response = NextResponse.json({ message: 'Token cookie cleared' });
  response.headers.append('Set-Cookie', clearCookie);

  return response;
}