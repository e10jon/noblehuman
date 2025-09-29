import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import type { MetaFunction } from 'react-router';
import { Link, useFetcher, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { getUserFromCookie } from '../lib/auth';
import { prisma } from '../lib/db';
import type { Route } from './+types/home';

export const meta: MetaFunction = () => {
  return [{ title: 'Noble Human' }, { name: 'description', content: 'Welcome to Noble Human!' }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const user = await getUserFromCookie(cookieHeader);

  const exercises = await prisma.exercise.findMany({
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  let completions = null;
  if (user) {
    completions = await prisma.completion.findMany({
      where: { userId: user.id },
      include: {
        steps: {
          include: {
            exerciseStep: true,
          },
        },
      },
    });
  }

  return { exercises, completions, user };
}

export default function Index() {
  const { exercises, completions, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Noble Human</h1>
            <div className="flex gap-2 items-center">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.email}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to={$path('/admin')} className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
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
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <Link to={$path('/login')}>Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to={$path('/signup')}>Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your 10-Week Journey to Living Your Best Life</CardTitle>
              <CardDescription>
                Explore the Four Noble Truths through self-inquiry, reflection, and conscious leadership.
                {!user && (
                  <span className="block mt-2">
                    <Link to={$path('/login')} className="text-indigo-600 hover:text-indigo-500">
                      Login
                    </Link>{' '}
                    to track your progress and save your responses.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => {
              const completion = completions?.find((c) => c.exerciseId === exercise.id);
              const completedSteps = completion?.steps.filter((s) => s.completed).length || 0;
              const totalSteps = exercise.steps.length;
              const isCompleted = completedSteps === totalSteps && totalSteps > 0;

              return (
                <Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      <Link
                        to={$path('/exercise/:id', { id: exercise.id })}
                        className="text-indigo-600 hover:text-indigo-700"
                      >
                        {exercise.name}
                      </Link>
                    </CardTitle>
                    {user && (
                      <CardDescription>
                        {isCompleted ? (
                          <span className="text-green-600 font-medium">✓ Completed</span>
                        ) : totalSteps > 0 ? (
                          <span className="text-gray-600">
                            Progress: {completedSteps}/{totalSteps} steps
                          </span>
                        ) : (
                          <span className="text-gray-500">Not started</span>
                        )}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {exercises.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">No exercises available yet. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
