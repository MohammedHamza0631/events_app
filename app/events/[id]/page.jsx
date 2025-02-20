'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function EventDetailsPage({ params }) {
  const eventId = params.id;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!eventId) {
      router.push('/events');
      return;
    }

    fetchEvent();

    // Set up SSE connection
    const eventSource = new EventSource(`/api/events/${eventId}/sse`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'attendance') {
        setEvent(data.event);
        toast({
          title: 'Attendance Updated',
          description: `Someone has ${data.action}ed the event.`,
        });
      } else if (data.type === 'update') {
        setEvent(data.event);
        toast({
          title: 'Event Updated',
          description: 'Event details have been updated.',
        });
      } else if (data.type === 'delete') {
        toast({
          title: 'Event Deleted',
          description: 'This event has been deleted by the organizer.',
        });
        router.push('/events');
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setEvent(data);
      setIsAttending(data.attendees.some((attendee) => attendee._id === user?._id));
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

  const handleAttendance = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/attend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: isAttending ? 'unregister' : 'register',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setEvent(data.event);
      setIsAttending(!isAttending);
      
      toast({
        title: 'Success',
        description: data.message,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast({
        title: 'Success',
        description: 'Event deleted successfully',
      });
      
      router.push('/events');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-[400px] rounded-lg bg-muted animate-pulse" />
        <div className="h-8 w-1/3 bg-muted animate-pulse" />
        <div className="h-4 w-1/4 bg-muted animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Event not found</h3>
        <p className="text-muted-foreground">
          The event you're looking for doesn't exist or has been deleted.
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

  const isCreator = user?._id === event.creator._id;

  return (
    <div className="space-y-8">
      {/* Event Image */}
      <div className="relative h-[400px] rounded-lg overflow-hidden">
        <Image
          src={event.imageUrl || '/event-placeholder.jpg'}
          alt={event.name}
          fill
          className="object-cover"
        />
        <Badge
          className="absolute top-4 right-4 text-lg py-2"
          variant={event.status === 'upcoming' ? 'default' : 'secondary'}
        >
          {event.status}
        </Badge>
      </div>

      {/* Event Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold">{event.name}</h1>
          <p className="text-muted-foreground">
            Organized by {event.creator.name}
          </p>
        </div>
        {isCreator && (
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/events/${eventId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold">About this event</h3>
            <p>{event.description}</p>
          </div>

          {/* Attendees */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Attendees</h3>
            <div className="flex flex-wrap gap-4">
              {event.attendees.map((attendee) => (
                <div
                  key={attendee._id}
                  className="flex items-center gap-2"
                >
                  <Avatar>
                    <AvatarFallback>
                      {attendee.name[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{attendee.name}</span>
                </div>
              ))}
              {event.attendees.length === 0 && (
                <p className="text-muted-foreground">
                  No attendees yet. Be the first to join!
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6 space-y-6">
            <Badge>{event.category}</Badge>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(new Date(event.date), 'PPP')}</span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>
                {event.attendees.length}{' '}
                {event.maxAttendees
                  ? `/ ${event.maxAttendees} attendees`
                  : 'attendees'}
              </span>
            </div>

            {!isCreator && (
              <Button
                className="w-full"
                onClick={handleAttendance}
                disabled={event.isFull && !isAttending}
              >
                {isAttending ? 'Cancel Attendance' : 'Attend Event'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and remove all attendee registrations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 