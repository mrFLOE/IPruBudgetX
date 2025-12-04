'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

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
    <nav className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold">
              IPruBudEx
            </Link>
            <div className="hidden md:flex space-x-4">
              {getRoleLinks().map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:bg-primary-700 px-3 py-2 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <div className="font-semibold">{user?.name}</div>
              <div className="text-primary-200 text-xs">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
