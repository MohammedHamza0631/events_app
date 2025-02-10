'use client';

import { formatDistanceToNow, format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';

export default function EventCard({ event }) {
  const { user } = useAuth();
  const {
    _id,
    name,
    description,
    date,
    location,
    category,
    imageUrl,
    creator,
    attendees,
    status,
  } = event;

  const isCreator = user?._id === creator._id;
  const isAttending = attendees?.some((attendee) => attendee._id === user?._id);

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500';
      case 'ongoing':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl || '/event-placeholder.jpg'}
          alt={name}
          fill
          className="object-cover"
        />
        <Badge
          className={`absolute top-2 right-2 ${getStatusColor(status)}`}
          variant="secondary"
        >
          {status}
        </Badge>
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="line-clamp-1">{name}</CardTitle>
            <CardDescription className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4" />
              {format(new Date(date), 'PPP')}
            </CardDescription>
          </div>
          <Badge variant="outline">{category}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{location}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{attendees?.length || 0} attending</span>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/events/${_id}`}>View Details</Link>
        </Button>
        {isCreator ? (
          <Button variant="outline" asChild>
            <Link href={`/events/${_id}/edit`}>Edit Event</Link>
          </Button>
        ) : (
          <Badge variant={isAttending ? 'default' : 'outline'}>
            {isAttending ? 'Attending' : 'Not Attending'}
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
} 