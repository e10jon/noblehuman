import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { MetaFunction } from 'react-router';
import { data, Link, useFetcher, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Editor } from '~/components/ui/editor';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import type { ActionSchema } from '~/schemas/action';
import { requireUser } from '../lib/auth';
import { prisma } from '../lib/db';
import { type UserData, userDataSchema } from '../schemas/user';
import type { Route } from './+types/profile';

export const meta: MetaFunction = () => {
  return [{ title: 'Profile - Noble Human' }, { name: 'description', content: 'Manage your Noble Human profile' }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);

  try {
    const json = await request.json();
    const parsed = userDataSchema.parse(json);
    await prisma.user.update({
      where: { id: user.id },
      data: { data: parsed },
    });

    return data({ success: 'Profile updated successfully!' } satisfies ActionSchema, { status: 200 });
  } catch {
    return data({ error: 'Failed to update profile' } satisfies ActionSchema, { status: 400 });
  }
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);

  const form = useForm<UserData>({
    resolver: zodResolver(userDataSchema),
    defaultValues: user.data,
  });

  const {
    fields: urlFields,
    append: appendUrl,
    remove: removeUrl,
  } = useFieldArray({
    control: form.control,
    name: 'urls',
  });

  const onSubmit = (formData: UserData) => {
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="link" asChild className="p-0">
            <Link to={$path('/')}>← Back to home</Link>
          </Button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-gray-600">{user.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Editor value={field.value} onChange={field.onChange} placeholder="Tell us about yourself..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Links</FormLabel>
                  <FormDescription>Add your personal or social media links</FormDescription>
                  <div className="space-y-2">
                    {urlFields.map((field, index) => (
                      <div key={field.id} className="space-y-2">
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`urls.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input type="text" placeholder="Description" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`urls.${index}.url`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input type="url" placeholder="https://example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {urlFields.length > 1 && (
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeUrl(index)}>
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => appendUrl({ description: '', url: '' })}
                      className="p-0"
                    >
                      + Add link
                    </Button>
                  </div>
                </div>

                {actionData && 'success' in actionData && (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">{actionData.success}</AlertDescription>
                  </Alert>
                )}

                {actionData && 'error' in actionData && (
                  <Alert variant="destructive">
                    <AlertDescription>{actionData.error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
                  </Button>
                </div>
              </fetcher.Form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
