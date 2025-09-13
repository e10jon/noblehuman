import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, Link, redirect, useActionData, useFetcher, useSearchParams } from 'react-router';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { createSessionCookie, createUser, getUserFromCookie } from '../lib/auth';
import { prisma } from '../lib/db';
import { type SignupSchema, signupSchema } from '../schemas/signup';

export const meta: MetaFunction = () => {
  return [{ title: 'Sign Up - Noble Human' }, { name: 'description', content: 'Create your Noble Human account' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get('Cookie');
  const user = await getUserFromCookie(cookieHeader);

  if (user) {
    return redirect('/');
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const json = await request.json();
  const result = signupSchema.safeParse(json);

  if (!result.success) {
    const errors = result.error.issues;
    return data({ error: errors[0]?.message || 'Invalid input' }, { status: 400 });
  }

  const { email, password, redirectTo = '/' } = result.data;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return data({ error: 'An account with this email already exists' }, { status: 400 });
  }

  try {
    const user = await createUser(email, password);
    const cookie = createSessionCookie(user.id);

    return redirect(redirectTo, {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch {
    return data({ error: 'Failed to create account' }, { status: 400 });
  }
}

export default function SignUp() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/';
  const fetcher = useFetcher();

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: SignupSchema) => {
    fetcher.submit(
      { ...data, redirectTo },
      {
        method: 'post',
        encType: 'application/json',
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Or{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                sign in to your existing account
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" autoComplete="email" placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" placeholder="Create a password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {(actionData?.error || fetcher.data?.error) && (
                  <Alert variant="destructive">
                    <AlertDescription>{actionData?.error || fetcher.data?.error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={fetcher.state === 'submitting'}>
                  {fetcher.state === 'submitting' ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
