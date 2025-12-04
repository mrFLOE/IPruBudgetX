'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const getRoleLinks = () => {
    const links = [
      { href: '/dashboard', label: 'Dashboard' },
    ];

    if (user?.role === 'REQUESTOR' || user?.role === 'SUPER_ADMIN') {
      links.push({ href: '/requests', label: 'My Requests' });
    }

    if (['TECH_LEAD', 'DEPT_HEAD', 'FINANCE_ADMIN', 'FPNA', 'PRINCIPAL_FINANCE', 'CFO', 'SUPER_ADMIN'].includes(user?.role || '')) {
      links.push({ href: '/approvals', label: 'Approvals' });
    }

    if (user?.role === 'SUPER_ADMIN') {
      links.push({ href: '/admin', label: 'Admin' });
    }

    links.push({ href: '/status', label: 'Status' });

    return links;
  };

  return (
    <nav className="bg-primary-600 dark:bg-primary-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold hover:text-primary-100 transition-colors">
              IpruBudgetX
            </Link>
            <div className="hidden md:flex space-x-4">
              {getRoleLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:bg-primary-700 dark:hover:bg-primary-900 px-3 py-2 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/settings"
              className="hover:bg-primary-700 dark:hover:bg-primary-900 p-2 rounded-lg transition-colors"
              title="Settings"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Link>
            <ThemeToggle />
            <div className="text-sm hidden lg:block">
              <div className="font-semibold">{user?.name}</div>
              <div className="text-primary-200 dark:text-primary-300 text-xs">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="bg-primary-700 dark:bg-primary-900 hover:bg-primary-800 dark:hover:bg-primary-950 px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
