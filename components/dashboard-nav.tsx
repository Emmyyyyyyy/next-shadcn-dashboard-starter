'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut, getCsrfToken } from 'next-auth/react';

import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { NavItem } from '@/types';
import { Dispatch, SetStateAction } from 'react';
import { useSidebar } from '@/hooks/useSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip';

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export function DashboardNav({
  items,
  setOpen,
  isMobileNav = false
}: DashboardNavProps) {
  const path = usePathname();
  const router = useRouter();
  const { isMinimized } = useSidebar();
  const { data: session } = useSession();

  if (!items?.length) {
    return null;
  }

  // async function handleLogout() {
  //   console.log('logout...');

  //   const csrfToken = await getCsrfToken();
  //   console.log('csrfToken: ' + csrfToken);

  //   try {
  //     // Call the server-side proxy
  //     console.log('logging out try field...');

  //     const response = await fetch('/api/auth/signout', {
  //       method: 'POST',
  //       headers: {
  //         'X-CSRF-Token': '31352e77dafa7d8f74e060ab4348bd8077672ade74fc8aba7fc06c8697179ce7%7C00178523f630cf6a2210631bb70ef8d69153da6a4ff89e1bdad60d3ba5ba215a',
  //       },
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(`Failed to logout from external service: ${data.error}`);
  //     }

  //     // Proceed with signing out from next-auth
  //     await signOut({ redirect: false }); // Do not redirect, handle it manually
  //     router.push('/'); // Redirect after sign-out
  //   } catch (error) {
  //     console.error('Failed to log out:', error);
  //   }
  // }

  async function handleLogout() {
    console.log('logout...');
    try {
      await signOut({ redirect: false }); // Do not redirect, handle it manually
      router.push('/'); // Redirect after sign-out
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  console.log('isActive', isMobileNav, isMinimized);

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {items.map((item, index) => {
          const Icon = Icons[item.icon || 'arrowRight'];
          return (
            item.href && (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.disabled ? '/' : item.href}
                    className={cn(
                      'flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                      path === item.href ? 'bg-accent' : 'transparent',
                      item.disabled && 'cursor-not-allowed opacity-80'
                    )}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                      if (item.title === 'Logout') {
                        handleLogout();
                      }
                    }}
                  >
                    <Icon className={`ml-3 size-5 flex-none`} />

                    {isMobileNav || (!isMinimized && !isMobileNav) ? (
                      <span className="mr-2 truncate">{item.title}</span>
                    ) : (
                      ''
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  sideOffset={8}
                  className={!isMinimized ? 'hidden' : 'inline-block'}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
          );
        })}
      </TooltipProvider>
    </nav>
  );
}
