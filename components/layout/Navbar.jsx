'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Events', href: '/events' },
];

const userNavigation = [
  { name: 'My Events', href: '/events/my-events' },
  { name: 'Create Event', href: '/events/create', hideForGuest: true },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  const NavLinks = ({ mobile }) => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${
            pathname === item.href
              ? 'text-primary font-semibold'
              : 'text-muted-foreground hover:text-primary'
          } ${mobile ? 'text-lg py-2' : ''}`}
        >
          {item.name}
        </Link>
      ))}
      {isAuthenticated &&
        userNavigation
          .filter(item => !item.hideForGuest || !user?.isGuest)
          .map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-primary'
              } ${mobile ? 'text-lg py-2' : ''}`}
            >
              {item.name}
            </Link>
          ))}
    </>
  );

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center font-bold text-xl">
              EventsApp
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-6 md:items-center">
              <NavLinks />
            </div>
          </div>

          {/* User Menu (Desktop) */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                      <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-red-600 cursor-pointer"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  {isOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col py-4 space-y-4">
                  <NavLinks mobile />
                  {isAuthenticated ? (
                    <Button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      variant="destructive"
                    >
                      Logout
                    </Button>
                  ) : (
                    <div className="flex flex-col space-y-4">
                      <Button asChild variant="outline">
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
} 