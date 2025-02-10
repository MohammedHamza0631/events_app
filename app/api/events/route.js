import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import { withAuth, withErrorHandler } from '@/lib/middleware';
import User from '@/lib/models/User';

// GET /api/events - List events with filtering
async function handleGet(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    // Build query based on filters
    const query = {};
    
    // Category filter
    const category = searchParams.get('category');
    if (category && category !== 'all') {
      query.category = category;
    }

    // Date filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Status filter
    const status = searchParams.get('status');
    if (status) {
      query.status = status;
    }

    // Creator filter
    const creator = searchParams.get('creator');
    if (creator) {
      query.creator = creator;
    }

    // Attendee filter
    const attendee = searchParams.get('attendee');
    if (attendee) {
      query.attendees = attendee;
    }

    const events = await Event.find(query)
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .sort({ date: 1 })
      .exec();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event
async function handlePost(request) {
  try {
    const authResponse = await withAuth(request);
    if (authResponse) return authResponse;

    await connectDB();

    // Check if user is a guest
    const user = await User.findById(request.userId);
    if (user.isGuest) {
      return NextResponse.json(
        { error: 'Guest users cannot create events. Please register for a full account.' },
        { status: 403 }
      );
    }

    const data = await request.json();

    const event = await Event.create({
      ...data,
      creator: request.userId,
    });

    await event.populate('creator', 'name email');

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}

export const GET = withErrorHandler(handleGet);
export const POST = withErrorHandler(handlePost); 