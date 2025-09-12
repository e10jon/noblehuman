import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { getUserFromCookie } from '../lib/auth';
import { prisma } from '../lib/db';

export const meta: MetaFunction = () => {
  return [{ title: 'Noble Human' }, { name: 'description', content: 'Welcome to Noble Human!' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
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
  const { exercises, user } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Noble Human</h1>
            <div className="flex gap-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 py-2">Welcome, {user.email}</span>
                  <Link to="/profile" className="text-sm text-indigo-600 hover:text-indigo-700 py-2">
                    Profile
                  </Link>
                  <form method="post" action="/logout">
                    <button type="submit" className="text-sm text-gray-500 hover:text-gray-700">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your 10-Week Journey to Living Your Best Life</h2>
            <p className="text-gray-600">
              Explore the Four Noble Truths through self-inquiry, reflection, and conscious leadership.
            </p>
            {!user && (
              <p className="mt-2 text-sm text-gray-500">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                  Login
                </Link>{' '}
                to track your progress and save your responses.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <div key={exercise.id}>{exercise.name}</div>
            ))}
          </div>

          {exercises.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No exercises available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
