'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import EventCard from './EventCard';
import { useToast } from '@/hooks/use-toast';

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'arts', label: 'Arts' },
  { value: 'other', label: 'Other' },
];

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const category = searchParams.get('category') || 'all';
  const date = searchParams.get('date');

  useEffect(() => {
    fetchEvents();
  }, [category, date]);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      let url = '/api/events?';
      if (category !== 'all') {
        url += `category=${category}&`;
      }
      if (date) {
        url += `startDate=${date}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setEvents(data);
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

  const updateFilters = (type, value) => {
    const params = new URLSearchParams(searchParams);
    
    if (value) {
      params.set(type, type === 'date' ? format(value, 'yyyy-MM-dd') : value);
    } else {
      params.delete(type);
    }

    router.push(`/events?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={category}
          onValueChange={(value) => updateFilters('category', value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full sm:w-[240px] justify-start text-left font-normal',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(new Date(date), 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date ? new Date(date) : selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                updateFilters('date', date);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(category !== 'all' || date) && (
          <Button
            variant="ghost"
            onClick={() => {
              router.push('/events');
              setSelectedDate(null);
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[400px] rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later
          </p>
        </div>
      )}
    </div>
  );
} 