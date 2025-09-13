import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, Link, useFetcher, useLoaderData } from 'react-router';
import type { ActionSchema } from '~/schemas/action';
import { requireUser } from '../lib/auth';
import { prisma } from '../lib/db';
import { type UserData, userDataSchema } from '../schemas/user';

export const meta: MetaFunction = () => {
  return [{ title: 'Profile - Noble Human' }, { name: 'description', content: 'Manage your Noble Human profile' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);

  try {
    const json = await request.json();
    const parsed = userDataSchema.parse(json);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        data: parsed,
      },
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

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<UserData>({
    resolver: zodResolver(userDataSchema),
    defaultValues: user.data,
  });

  const {
    fields: urlFields,
    append: appendUrl,
    remove: removeUrl,
  } = useFieldArray({
    control,
    name: 'urls',
  });

  const onSubmit = async (formData: UserData) => {
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
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 text-sm">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Your Profile</h1>
          <p className="mt-2 text-gray-600">{user.email}</p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          </div>

          <div className="p-6">
            <fetcher.Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                  <textarea
                    {...register('bio')}
                    rows={4}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mt-2"
                    placeholder="Tell us about yourself..."
                  />
                </label>
                {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
              </div>

              <fieldset>
                <legend className="block text-sm font-medium text-gray-700 mb-2">Links</legend>
                <div className="space-y-2">
                  {urlFields.map((field, index) => (
                    <div key={field.id}>
                      <div className="flex gap-2">
                        <input
                          {...register(`urls.${index}.description`)}
                          type="text"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Description"
                        />
                        <input
                          {...register(`urls.${index}.url`)}
                          type="url"
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="https://example.com"
                        />
                        {urlFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeUrl(index)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {errors.urls?.[index]?.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.urls[index]?.description?.message}</p>
                      )}
                      {errors.urls?.[index]?.url && (
                        <p className="mt-1 text-sm text-red-600">{errors.urls[index]?.url?.message}</p>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendUrl({ description: '', url: '' })}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    + Add link
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">Add your personal or social media links</p>
              </fieldset>

              {actionData && 'success' in actionData && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{actionData.success}</p>
                    </div>
                  </div>
                </div>
              )}

              {actionData && 'error' in actionData && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{actionData.error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      </div>
    </div>
  );
}
