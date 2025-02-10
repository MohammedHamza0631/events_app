'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import EventList from '@/components/events/EventList';
import Link from 'next/link';

export default function EventsPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Discover and join amazing events
          </p>
        </div>
        {isAuthenticated && !user?.isGuest && (
          <Button asChild>
            <Link href="/events/create">Create Event</Link>
          </Button>
        )}
      </div>

      <EventList />
    </div>
  );
} 