import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('firebaseToken');
  return NextResponse.json({ message: 'Logged out successfully' });
}

export const runtime = 'nodejs';
