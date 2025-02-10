'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from './context/AuthContext';
import { Calendar, Users, Bell, Shield } from 'lucide-react';

const features = [
  {
    name: 'Event Management',
    description: 'Create and manage events with ease. Set dates, locations, and track attendees.',
    icon: Calendar,
  },
  {
    name: 'Real-time Updates',
    description: 'Get instant notifications when people join your events or when event details change.',
    icon: Bell,
  },
  {
    name: 'User-friendly Interface',
    description: 'An intuitive interface that makes event management a breeze.',
    icon: Users,
  },
  {
    name: 'Secure Platform',
    description: 'Your data is protected with industry-standard security measures.',
    icon: Shield,
  },
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-32 mb-20">
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
            Create and Manage Events with Ease
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A powerful platform for organizing events, managing attendees, and creating memorable experiences.
          </p>
          <div className="flex justify-center gap-4">
            {isAuthenticated ? (
              <Button size="lg" asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Everything You Need</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Our platform provides all the tools you need to create and manage successful events.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative p-6 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20 px-6 border rounded-2xl bg-primary/5">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of event organizers who are already using our platform to create amazing events.
        </p>
        {!isAuthenticated && (
          <Button size="lg" asChild>
            <Link href="/register">Create Your First Event</Link>
          </Button>
        )}
      </section>
    </div>
  );
}
