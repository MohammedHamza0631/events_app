import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/lib/models/User';
import { generateToken, hashPassword } from '@/lib/auth';
import { withErrorHandler } from '@/lib/middleware';

async function handler(request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  await connectDB();

  try {
    // Generate a random password that meets the minimum length requirement
    const guestPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
    const hashedPassword = await hashPassword(guestPassword);

    // Create a temporary guest user
    const guestUser = await User.create({
      email: `guest_${Date.now()}@temp.com`,
      password: hashedPassword,
      name: `Guest_${Math.random().toString(36).slice(2, 8)}`,
      isGuest: true,
    });

    // Generate token with short expiry for guest
    const token = generateToken(guestUser._id);
    const userResponse = guestUser.toJSON();

    return NextResponse.json({
      message: 'Guest login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { error: 'Failed to create guest session' },
      { status: 500 }
    );
  }
}

export const POST = withErrorHandler(handler); 