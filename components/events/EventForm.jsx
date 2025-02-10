'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const eventSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.date().refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    return selectedDate.getTime() >= today.getTime();
  }, 'Date must not be in the past'),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  category: z.enum(['music', 'sports', 'technology', 'business', 'arts', 'other']),
  maxAttendees: z.string().transform((val) => (val === '' ? null : Number(val))),
});

const categories = [
  { value: 'music', label: 'Music' },
  { value: 'sports', label: 'Sports' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'arts', label: 'Arts' },
  { value: 'other', label: 'Other' },
];

export default function EventForm({ event, type = 'create' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    event ? new Date(event.date) : new Date()
  );
  const [imageFile, setImageFile] = useState(null);
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name || '',
      description: event?.description || '',
      date: event ? new Date(event.date) : new Date(),
      location: event?.location || '',
      category: event?.category || '',
      maxAttendees: event?.maxAttendees?.toString() || '',
    },
  });

  // Set initial category if editing
  useEffect(() => {
    if (event?.category) {
      setValue('category', event.category);
    }
  }, [event, setValue]);

  // Set initial date if editing
  useEffect(() => {
    if (event?.date) {
      const date = new Date(event.date);
      setValue('date', date);
      setSelectedDate(date);
    }
  }, [event, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Error',
          description: 'Image size should be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setImageFile(file);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      let imageUrl = event?.imageUrl;

      // Upload image if a new one is selected
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('upload_preset', 'events_app'); // Make sure this matches your Cloudinary upload preset
        formData.append('cloud_name', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

        try {
          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!uploadRes.ok) {
            const errorData = await uploadRes.json();
            throw new Error(errorData.error?.message || 'Failed to upload image');
          }

          const imageData = await uploadRes.json();
          imageUrl = imageData.secure_url;
        } catch (error) {
          console.error('Image upload error:', error);
          toast({
            title: 'Error',
            description: `Failed to upload image: ${error.message}`,
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      }

      // Ensure date is properly formatted
      const formattedData = {
        ...data,
        date: data.date.toISOString(),
        imageUrl,
      };

      // Create or update event
      const url = type === 'create' ? '/api/events' : `/api/events/${event._id}`;
      const method = type === 'create' ? 'POST' : 'PUT';

      const eventRes = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formattedData),
      });

      const eventResult = await eventRes.json();
      if (!eventRes.ok) throw new Error(eventResult.error || 'Failed to save event');

      toast({
        title: 'Success',
        description: `Event ${type === 'create' ? 'created' : 'updated'} successfully`,
      });

      router.push(`/events/${eventResult._id}`);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Event Name</Label>
        <Input
          id="name"
          {...register('name')}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setValue('date', date);
              }}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          {...register('location')}
          disabled={isLoading}
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          onValueChange={(value) => setValue('category', value)}
          defaultValue={event?.category}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-500">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="maxAttendees">Maximum Attendees (Optional)</Label>
        <Input
          id="maxAttendees"
          type="number"
          {...register('maxAttendees')}
          disabled={isLoading}
        />
        {errors.maxAttendees && (
          <p className="text-sm text-red-500">{errors.maxAttendees.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Event Image</Label>
        <div className="flex items-center gap-4">
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isLoading}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {imageFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {imageFile.name}
            </p>
          )}
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Saving...' : type === 'create' ? 'Create Event' : 'Update Event'}
      </Button>
    </form>
  );
} 