/**
 * Logout button component.
 */

'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface LogoutButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}

export function LogoutButton({ variant = 'secondary', className }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
