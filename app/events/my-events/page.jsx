'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/events/EventCard';
import { useToast } from '@/hooks/use-toast';

export default function MyEventsPage() {
  const [createdEvents, setCreatedEvents] = useState([]);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchEvents();
  }, [isAuthenticated]);

  const fetchEvents = async () => {
    try {
      // Fetch created events
      const createdRes = await fetch('/api/events?creator=' + user._id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const createdData = await createdRes.json();
      if (!createdRes.ok) throw new Error(createdData.error);
      setCreatedEvents(createdData);

      // Fetch attending events
      const attendingRes = await fetch('/api/events?attendee=' + user._id, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const attendingData = await attendingRes.json();
      if (!attendingRes.ok) throw new Error(attendingData.error);
      setAttendingEvents(attendingData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">
            Manage your events and view your RSVPs
          </p>
        </div>
        <Button onClick={() => router.push('/events/create')}>
          Create Event
        </Button>
      </div>

      <Tabs defaultValue="created" className="space-y-6">
        <TabsList>
          <TabsTrigger value="created">Created Events</TabsTrigger>
          <TabsTrigger value="attending">Attending Events</TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : createdEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {createdEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">No events created yet</h3>
              <p className="text-muted-foreground">
                Start by creating your first event
              </p>
              <Button
                onClick={() => router.push('/events/create')}
                className="mt-4"
              >
                Create Event
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="attending" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-[400px] rounded-lg bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : attendingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendingEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold">
                Not attending any events
              </h3>
              <p className="text-muted-foreground">
                Browse events and RSVP to see them here
              </p>
              <Button
                onClick={() => router.push('/events')}
                className="mt-4"
              >
                Browse Events
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 