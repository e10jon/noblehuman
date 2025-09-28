import { ArrowLeft } from 'lucide-react';
import { Link, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import AdminLayout from '../components/AdminLayout';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';

interface LoaderArgs {
  request: Request;
  params: { id: string };
}

interface MessagePart {
  type: string;
  text: string;
}

export async function loader({ request, params }: LoaderArgs) {
  const admin = await requireAdmin(request);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: params.id },
    select: {
      id: true,
      email: true,
    },
  });

  const completions = await prisma.completion.findMany({
    where: { userId: params.id },
    include: {
      exercise: {
        select: {
          id: true,
          name: true,
        },
      },
      steps: {
        include: {
          exerciseStep: {
            select: {
              id: true,
              title: true,
              order: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              parts: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return { admin, user, completions };
}

export default function AdminUserCompletions() {
  const { admin, user, completions } = useLoaderData<typeof loader>();

  return (
    <AdminLayout user={admin}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to={$path('/admin/users/:id', { id: user.id })}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to User Details
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Completions for {user.email}</h1>
        <p className="text-gray-600">Detailed view of all user completions with steps and conversation messages</p>
      </div>

      <div className="space-y-6">
        {completions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No completions found for this user.</p>
            </CardContent>
          </Card>
        ) : (
          completions.map((completion) => (
            <Card key={completion.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{completion.exercise.name}</CardTitle>
                    <CardDescription>
                      Completed on {new Date(completion.createdAt).toLocaleDateString()} at{' '}
                      {new Date(completion.createdAt).toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{completion.steps.length} steps</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {completion.steps.map((step, stepIndex) => (
                    <div key={step.id} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-sm">
                          Step {stepIndex + 1}: {step.exerciseStep.title}
                        </h4>
                        <Badge variant={step.completed ? 'default' : 'secondary'}>
                          {step.completed ? 'Completed' : 'In Progress'}
                        </Badge>
                      </div>

                      {step.result && (
                        <div className="mb-3 p-3 bg-gray-50 rounded text-sm">
                          <p className="font-medium text-gray-700 mb-1">Result:</p>
                          <p className="text-gray-600">{step.result}</p>
                        </div>
                      )}

                      {step.messages.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-medium text-gray-700 text-sm">Conversation Messages:</p>
                          <div className="space-y-1 max-h-64 overflow-y-auto">
                            {step.messages.map((message) => {
                              const content = Array.isArray(message.parts)
                                ? (message.parts as MessagePart[])
                                    .filter((part) => part.type === 'text')
                                    .map((part) => part.text)
                                    .join('')
                                : '';

                              return (
                                <div
                                  key={message.id}
                                  className={`p-2 rounded text-sm ${
                                    message.role === 'user'
                                      ? 'bg-blue-50 border-l-2 border-blue-200'
                                      : 'bg-green-50 border-l-2 border-green-200'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-xs uppercase tracking-wide text-gray-600">
                                      {message.role}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(message.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Step created: {new Date(step.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
