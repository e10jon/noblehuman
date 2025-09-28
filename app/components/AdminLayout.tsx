import { ChevronDown, LogOut, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useFetcher } from 'react-router';
import { $path } from 'safe-routes';
import type { User as UserType } from '../../prisma/generated/client';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AdminLayoutProps {
  user: UserType;
  children: ReactNode;
}

export default function AdminLayout({ user, children }: AdminLayoutProps) {
  const fetcher = useFetcher();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-3xl font-bold text-gray-900">
                <Link to="/admin">Admin Panel</Link>
              </h1>
              <nav className="flex gap-6">
                <Link to={$path('/admin/users')} className="text-gray-600 hover:text-gray-900 font-medium">
                  Users
                </Link>
                <Link to={$path('/admin/exercises')} className="text-gray-600 hover:text-gray-900 font-medium">
                  Exercises
                </Link>
                <Link to={$path('/admin/settings')} className="text-gray-600 hover:text-gray-900 font-medium">
                  Settings
                </Link>
              </nav>
            </div>
            <div className="flex gap-2 items-center">
              <Button variant="outline" asChild>
                <Link to="/">← Back to Site</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user.email}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={$path('/profile')} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      fetcher.submit(null, { method: 'post', action: '/logout' });
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">{children}</div>
      </main>
    </div>
  );
}
