import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { data, Link, redirect, useFetcher, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import type { ActionSchema } from '~/schemas/action';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';
import { type CreateExercise, createExerciseSchema } from '../schemas/admin/exercise';
import type { Route } from './+types/admin.exercises.new';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  try {
    const json = await request.json();
    const parsed = createExerciseSchema.parse(json);

    const exercise = await prisma.exercise.create({
      data: {
        name: parsed.name.trim(),
      },
    });

    return redirect($path('/admin/exercises/:id', { id: exercise.id }));
  } catch {
    return data({ error: 'Failed to create exercise' } satisfies ActionSchema, { status: 400 });
  }
}

export default function AdminExerciseNew() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);

  const form = useForm<CreateExercise>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = (formData: CreateExercise) => {
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
    <AdminLayout user={user}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link to={$path('/admin/exercises')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Exercise</h1>
        <p className="text-gray-600">Create a new exercise and add steps to it</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
            <CardDescription>Enter the basic information for your new exercise</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exercise Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter exercise name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {actionData && 'error' in actionData && <div className="text-red-600 text-sm">{actionData.error}</div>}

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {form.formState.isSubmitting ? 'Creating...' : 'Create Exercise'}
                </Button>
              </fetcher.Form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
