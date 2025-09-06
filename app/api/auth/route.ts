import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import connectDB from '@/app/lib/db';
import User from '@/app/models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { id_token } = await request.json();
    
    if (!id_token) {
      return NextResponse.json({ error: 'No ID token provided' }, { status: 400 });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required user information' }, { status: 400 });
    }

    // Connect to database
    await connectDB();

    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (user) {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        email,
        name,
        photo: picture || '',
        googleId,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(), 
        email: user.email,
        googleId: user.googleId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Prepare user state
    const userState = {
      freeTrialsRemaining: user.usage.freeTrialsRemaining,
      totalTransformations: user.usage.totalTransformations,
    };

    return NextResponse.json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        photo: user.photo,
      },
      userState,
    });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
