import { Edit, Eye, Shield } from 'lucide-react';
import { Link, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';
import type { Route } from './+types/admin.users';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      completions: {
        select: { id: true },
      },
    },
  });

  return { user, users };
}

export default function AdminUsers() {
  const { user, users } = useLoaderData<typeof loader>();

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600">Manage users and their permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{u.email}</span>
                    {u.isAdmin && <Shield className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="text-sm text-gray-600">
                    Joined {new Date(u.createdAt).toLocaleDateString()} • {u.completions.length} completions
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={$path('/admin/users/:id/completions', { id: u.id })}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={$path('/admin/users/:id', { id: u.id })}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
