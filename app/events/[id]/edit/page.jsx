'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import EventForm from '@/components/events/EventForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { use } from 'react';

export default function EditEventPage({ params }) {
  // Resolve params promise
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!eventId) {
      router.push('/events');
      return;
    }

    fetchEvent();
  }, [isAuthenticated, eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      // Check if user is the creator
      if (data.creator._id !== user?._id) {
        toast({
          title: 'Access Denied',
          description: 'You can only edit events that you created.',
          variant: 'destructive',
        });
        router.push(`/events/${eventId}`);
        return;
      }

      setEvent(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      router.push('/events');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <div className="h-8 w-1/3 bg-muted animate-pulse" />
        <div className="h-4 w-1/4 bg-muted animate-pulse" />
        <div className="h-[600px] bg-muted animate-pulse mt-8" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Event not found</h3>
        <p className="text-muted-foreground">
          The event you're trying to edit doesn't exist or has been deleted.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push('/events')}
        >
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Event</h1>
        <p className="text-muted-foreground">
          Update your event details below
        </p>
      </div>

      <EventForm type="edit" event={event} />
    </div>
  );
} 