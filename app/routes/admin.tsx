import { useLoaderData } from 'react-router';
import AdminLayout from '../components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';
import type { Route } from './+types/admin';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);

  const [userCount, exerciseCount, completionCount] = await Promise.all([
    prisma.user.count(),
    prisma.exercise.count(),
    prisma.completion.count(),
  ]);

  return { user, userCount, exerciseCount, completionCount };
}

export default function AdminDashboard() {
  const { user, userCount, exerciseCount, completionCount } = useLoaderData<typeof loader>();

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your Noble Human application</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Users</CardTitle>
            <CardDescription>Registered users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Exercises</CardTitle>
            <CardDescription>Available exercises</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{exerciseCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Completions</CardTitle>
            <CardDescription>Exercise completions by users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionCount}</div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
