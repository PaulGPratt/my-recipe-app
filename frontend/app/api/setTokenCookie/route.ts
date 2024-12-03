import { serialize } from 'cookie';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  if(!body["token"]) {
    return NextResponse.json({ message: 'Token is required' });
  }

  const token = body["token"];

  // Set the cookie with the token
  serialize('firebaseToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60, // 1 hour
    path: '/',
  });

  return NextResponse.json({ message: 'Cookie set successfully' });
}
