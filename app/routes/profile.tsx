import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, Link, useActionData, useLoaderData } from 'react-router';
import { requireUser } from '../lib/auth';
import { prisma } from '../lib/db';
import { type ProfileSchema, profileSchema } from '../schemas/profile';

export const meta: MetaFunction = () => {
  return [{ title: 'Profile - Noble Human' }, { name: 'description', content: 'Manage your Noble Human profile' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  const bio = formData.get('bio') as string;
  const urls = formData.getAll('urls').filter((u) => u !== '') as string[];

  const result = profileSchema.safeParse({
    bio: bio || '',
    urls: urls.map((u) => ({ value: u })),
  });

  if (!result.success) {
    const errors = result.error.issues;
    return data({ error: errors[0]?.message || 'Invalid input' }, { status: 400 });
  }

  const validUrls = result.data.urls.filter((u) => u.value !== '').map((u) => u.value);

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        data: {
          bio: result.data.bio,
          urls: validUrls,
        },
      },
    });

    return data({ success: 'Profile updated successfully!' }, { status: 200 });
  } catch {
    return data({ error: 'Failed to update profile' }, { status: 400 });
  }
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const userData = user.data as PrismaJson.UserData;

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: userData.bio,
      urls: userData.urls.length ? userData.urls.map((u) => ({ value: u })) : [{ value: '' }],
    },
  });

  const {
    fields: urlFields,
    append: appendUrl,
    remove: removeUrl,
  } = useFieldArray({
    control,
    name: 'urls',
  });

  const onSubmit = async (formData: ProfileSchema) => {
    const submitData = new FormData();
    submitData.append('bio', formData.bio);
    for (const url of formData.urls) {
      if (url.value) submitData.append('urls', url.value);
    }

    const response = await fetch('/profile', {
      method: 'POST',
      body: submitData,
    });

    if (!response.ok) {
      console.error('Failed to update profile');
    }
  };

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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                          {...register(`urls.${index}.value`)}
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
                      {errors.urls?.[index]?.value && (
                        <p className="mt-1 text-sm text-red-600">{errors.urls[index]?.value?.message}</p>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => appendUrl({ value: '' })}
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
