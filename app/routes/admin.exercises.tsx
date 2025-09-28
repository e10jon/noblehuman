import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { data, Link, useFetcher, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import type { ActionSchema } from '~/schemas/action';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem } from '../components/ui/form';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';
import { type AdminExerciseAction, adminExerciseActionSchema } from '../schemas/admin/exercise';
import type { Route } from './+types/admin.exercises';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireAdmin(request);

  const exercises = await prisma.exercise.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      steps: {
        select: { id: true },
      },
      completions: {
        select: { id: true },
      },
    },
  });

  return { user, exercises };
}

export async function action({ request }: Route.ActionArgs) {
  await requireAdmin(request);

  try {
    const json = await request.json();
    const parsed = adminExerciseActionSchema.parse(json);

    if (parsed.action === 'deleteExercise') {
      await prisma.exercise.delete({
        where: { id: parsed.exerciseId },
      });

      return data({ success: 'Exercise deleted successfully!' } satisfies ActionSchema, { status: 200 });
    }

    return data({ error: 'Invalid action' } satisfies ActionSchema, { status: 400 });
  } catch {
    return data({ error: 'Failed to process request' } satisfies ActionSchema, { status: 400 });
  }
}

function DeleteExerciseForm({ exerciseId, children }: { exerciseId: string; children: React.ReactNode }) {
  const fetcher = useFetcher<ActionSchema>();

  const form = useForm<AdminExerciseAction>({
    resolver: zodResolver(adminExerciseActionSchema),
    defaultValues: { action: 'deleteExercise', exerciseId },
  });

  const onSubmit = (formData: AdminExerciseAction) => {
    fetcher.submit(formData, {
      method: 'POST',
      encType: 'application/json',
    });
  };

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="inline">
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        {children}
      </fetcher.Form>
    </Form>
  );
}

export default function AdminExercises() {
  const { user, exercises } = useLoaderData<typeof loader>();

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Exercise Management</h1>
            <p className="text-gray-600">Manage exercises and their steps</p>
          </div>
          <Button asChild>
            <Link to={$path('/admin/exercises/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Exercise
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Exercises ({exercises.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {exercises.map((exercise) => (
              <div key={exercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-sm text-gray-600">
                    {exercise.steps.length} steps • {exercise.completions.length} completions
                  </div>
                  <div className="text-xs text-gray-500">
                    Created {new Date(exercise.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={$path('/admin/exercises/:id', { id: exercise.id })}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteExerciseForm exerciseId={exercise.id}>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        if (
                          !confirm(
                            `Are you sure you want to delete "${exercise.name}"? This will also delete all steps and completions.`
                          )
                        ) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </DeleteExerciseForm>
                </div>
              </div>
            ))}
            {exercises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No exercises found.{' '}
                <Link to={$path('/admin/exercises/new')} className="text-blue-600 hover:underline">
                  Create your first exercise
                </Link>
                .
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
