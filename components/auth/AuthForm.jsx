'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthForm({ type = 'login' }) {
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const { login, register, guestLogin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const schema = type === 'login' ? loginSchema : registerSchema;
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Watch password fields for real-time validation
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  useEffect(() => {
    if (type === 'register' && password && confirmPassword) {
      setPasswordMatch(password === confirmPassword);
    }
  }, [password, confirmPassword, type]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (type === 'login') {
        await login(data.email, data.password);
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        });
      } else {
        await register(data.name, data.email, data.password);
        toast({
          title: 'Success',
          description: 'Registered successfully. Please log in.',
        });
      }
      router.push('/events');
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

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await guestLogin();
      toast({
        title: 'Success',
        description: 'Logged in as guest',
      });
      router.push('/events');
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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{type === 'login' ? 'Login' : 'Register'}</CardTitle>
        <CardDescription>
          {type === 'login'
            ? 'Enter your credentials to access your account'
            : 'Create a new account to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...registerField('name')}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...registerField('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...registerField('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {type === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password
                {confirmPassword && (
                  <span className={`ml-2 text-sm ${passwordMatch ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </span>
                )}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                {...registerField('confirmPassword')}
                disabled={isLoading}
                className={confirmPassword && (passwordMatch ? 'border-green-500' : 'border-red-500')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || (type === 'register' && !passwordMatch)}
          >
            {isLoading ? 'Loading...' : type === 'login' ? 'Login' : 'Register'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGuestLogin}
          disabled={isLoading}
        >
          Continue as Guest
        </Button>
      </CardFooter>
    </Card>
  );
} 