import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { withAuth, withErrorHandler } from '@/lib/middleware';
import { broadcastUpdate } from '../sse/route';

// POST /api/events/[id]/attend - Register/unregister attendance
async function handler(request, { params }) {
  const authResponse = await withAuth(request);
  if (authResponse) return authResponse;

  await connectDB();
  const { action } = await request.json(); // 'register' or 'unregister'

  try {
    const event = await Event.findById(params?.id);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'register') {
      // Check if user is already registered
      if (event.attendees.includes(request.userId)) {
        return NextResponse.json(
          { error: 'Already registered for this event' },
          { status: 400 }
        );
      }

      // Check if event can accept more attendees
      if (!event.canAcceptMoreAttendees()) {
        return NextResponse.json(
          { error: 'Event is full' },
          { status: 400 }
        );
      }

      // Register attendance
      event.attendees.push(request.userId);
      user.attendingEvents.push(event._id);
    } else if (action === 'unregister') {
      // Check if user is registered
      if (!event.attendees.includes(request.userId)) {
        return NextResponse.json(
          { error: 'Not registered for this event' },
          { status: 400 }
        );
      }

      // Unregister attendance
      event.attendees = event.attendees.filter(
        id => id.toString() !== request.userId
      );
      user.attendingEvents = user.attendingEvents.filter(
        id => id.toString() !== event._id.toString()
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    await event.save();
    await user.save();
    await event.populate('attendees', 'name email');

    // Broadcast update using SSE
    broadcastUpdate(params?.id, {
      type: 'attendance',
      event,
      action,
      userId: request.userId
    });

    return NextResponse.json({
      message: `Successfully ${action}ed for the event`,
      event
    });
  } catch (error) {
    console.error('Error handling attendance:', error);
    return NextResponse.json(
      { error: 'Failed to handle attendance' },
      { status: 500 }
    );
  }
}

export const POST = withErrorHandler(handler); 