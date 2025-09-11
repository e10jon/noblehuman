import { useId, useRef } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, Form, Link, useActionData, useLoaderData } from 'react-router';
import { requireUser } from '../lib/auth';
import { prisma } from '../lib/db';

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
  const photos = formData.getAll('photos').filter((p) => p !== '') as string[];
  const urls = formData.getAll('urls').filter((u) => u !== '') as string[];

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        data: {
          bio: bio || '',
          photos,
          urls,
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

  const bioId = useId();
  const photosLabelId = useId();
  const urlsLabelId = useId();
  const photoIdCounter = useRef(0);
  const urlIdCounter = useRef(0);

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
            <Form method="post" className="space-y-6">
              <div>
                <label htmlFor={bioId} className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  id={bioId}
                  name="bio"
                  rows={4}
                  defaultValue={userData.bio}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <fieldset>
                <legend id={photosLabelId} className="block text-sm font-medium text-gray-700 mb-2">
                  Photos
                </legend>
                <div className="space-y-2">
                  {userData.photos.map((photo) => {
                    const photoKey = `photo-${photoIdCounter.current++}`;
                    return (
                      <input
                        key={photoKey}
                        type="url"
                        name="photos"
                        defaultValue={photo}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://example.com/photo.jpg"
                        aria-label="Photo URL"
                      />
                    );
                  })}
                  <input
                    type="url"
                    name="photos"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add a new photo URL..."
                    aria-label="Add new photo URL"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Add URLs to your photos</p>
              </fieldset>

              <fieldset>
                <legend id={urlsLabelId} className="block text-sm font-medium text-gray-700 mb-2">
                  Links
                </legend>
                <div className="space-y-2">
                  {userData.urls.map((url) => {
                    const urlKey = `url-${urlIdCounter.current++}`;
                    return (
                      <input
                        key={urlKey}
                        type="url"
                        name="urls"
                        defaultValue={url}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://example.com"
                        aria-label="Link URL"
                      />
                    );
                  })}
                  <input
                    type="url"
                    name="urls"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add a new link..."
                    aria-label="Add new link URL"
                  />
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
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Profile
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
