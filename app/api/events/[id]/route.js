import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/lib/models/Event';
import User from '@/lib/models/User';
import { withAuth, withErrorHandler } from '@/lib/middleware';
import { emitEventUpdate } from '@/lib/socket';

// GET /api/events/[id] - Get event details
async function handleGet(request, context) {
  // Ensure params is resolved
  const params = await context.params;
  const id = params.id;
  
  await connectDB();

  try {
    const event = await Event.findById(id)
      .populate('creator', 'name email')
      .populate('attendees', 'name email')
      .exec();

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update event
async function handlePut(request, context) {
  const authResponse = await withAuth(request);
  if (authResponse) return authResponse;

  await connectDB();
  const params = await context.params;
  const { id } = params;

  // Check if user is a guest
  const user = await User.findById(request.userId);
  if (user.isGuest) {
    return NextResponse.json(
      { error: 'Guest users cannot modify events. Please register for a full account.' },
      { status: 403 }
    );
  }

  const data = await request.json();
  const event = await Event.findById(id);

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.creator.toString() !== request.userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { ...data },
    { new: true }
  ).populate('creator', 'name email');

  // Emit update event
  emitEventUpdate(id, { type: 'update', event });

  return NextResponse.json(updatedEvent);
}

// DELETE /api/events/[id] - Delete event
async function handleDelete(request, context) {
  const authResponse = await withAuth(request);
  if (authResponse) return authResponse;

  await connectDB();
  const params = await context.params;
  const { id } = params;

  // Check if user is a guest
  const user = await User.findById(request.userId);
  if (user.isGuest) {
    return NextResponse.json(
      { error: 'Guest users cannot delete events. Please register for a full account.' },
      { status: 403 }
    );
  }

  const event = await Event.findById(id);

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (event.creator.toString() !== request.userId) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  await event.deleteOne();
  
  // Emit delete event
  emitEventUpdate(id, { type: 'delete', eventId: id });

  return NextResponse.json({ message: 'Event deleted successfully' });
}

export const GET = withErrorHandler(handleGet);
export const PUT = withErrorHandler(handlePut);
export const DELETE = withErrorHandler(handleDelete); 