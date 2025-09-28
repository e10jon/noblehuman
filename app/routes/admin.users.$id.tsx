import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { data, Link, useFetcher, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import type { ActionSchema } from '~/schemas/action';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';
import { type EditUserData, editUserDataSchema } from '../schemas/admin/user';
import type { Route } from './+types/admin.users.$id';

export async function loader({ request, params }: Route.LoaderArgs) {
  const admin = await requireAdmin(request);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      completions: {
        include: {
          exercise: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return { admin, user };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);

  try {
    const json = await request.json();
    const parsed = editUserDataSchema.parse(json);

    const urlArray = parsed.urls
      ? parsed.urls
          .split('\n')
          .filter((url) => url.trim())
          .map((url) => ({ url: url.trim(), description: '' }))
      : [];

    await prisma.user.update({
      where: { id: params.id },
      data: {
        data: {
          bio: parsed.bio,
          urls: urlArray,
        },
      },
    });

    return data({ success: 'User profile updated successfully!' } satisfies ActionSchema, { status: 200 });
  } catch {
    return data({ error: 'Failed to update user profile' } satisfies ActionSchema, { status: 400 });
  }
}

export default function AdminUserEdit() {
  const { admin, user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);

  const form = useForm<EditUserData>({
    resolver: zodResolver(editUserDataSchema),
    defaultValues: {
      bio: user.data.bio || '',
      urls: user.data.urls?.map((u) => u.url).join('\n') || '',
    },
  });

  const onSubmit = (formData: EditUserData) => {
    fetcher.submit(formData, {
      method: 'POST',
      encType: 'application/json',
    });
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setActionData(fetcher.data);
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <AdminLayout user={admin}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link to={$path('/admin/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit User: {user.email}</h1>
        <p className="text-gray-600">Manage user profile and data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Edit user's bio and URLs</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea placeholder="User's bio description..." rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="urls"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URLs (one per line)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="https://example.com&#10;https://another-url.com" rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {actionData && 'success' in actionData && (
                  <div className="text-green-600 text-sm">{actionData.success}</div>
                )}

                {actionData && 'error' in actionData && <div className="text-red-600 text-sm">{actionData.error}</div>}

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </fetcher.Form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={user.email} disabled />
            </div>

            <div>
              <Label>Admin Status</Label>
              <Input value={user.isAdmin ? 'Yes' : 'No'} disabled />
            </div>

            <div>
              <Label>Created At</Label>
              <Input value={new Date(user.createdAt).toLocaleString()} disabled />
            </div>

            <div>
              <Label>Last Updated</Label>
              <Input value={new Date(user.updatedAt).toLocaleString()} disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
