'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import EventForm from '@/components/events/EventForm';

export default function CreateEventPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Event</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create your event
        </p>
      </div>

      <EventForm type="create" />
    </div>
  );
} 