import ReactMarkdown from 'react-markdown';
import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Conversation from '../components/Conversation';
import { prisma } from '../lib/db';

export async function loader({ params }: LoaderFunctionArgs) {
  const exercise = await prisma.exercise.findUnique({
    where: { id: params.id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exercise) {
    throw new Response('Not Found', { status: 404 });
  }

  return { exercise };
}

export default function Exercise() {
  const { exercise } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="link" asChild className="p-0">
            <Link to="/">← Back to exercises</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-8">{exercise.name}</h1>
        <div className="space-y-4">
          {exercise.steps.map((step) => {
            return (
              <Card key={step.id}>
                <CardHeader>
                  <CardTitle>Step {step.order}</CardTitle>
                </CardHeader>
                <CardContent>
                  {step.content?.blocks?.map((block, index) => (
                    <div key={`${step.id}-block-${index}`}>
                      {block.content && (
                        <div className="text-gray-700 whitespace-pre-wrap mb-4">
                          <ReactMarkdown>{block.content}</ReactMarkdown>
                        </div>
                      )}
                      {block.ai && (
                        <div className="mt-4 border rounded-lg">
                          <Conversation
                            systemPrompt={block.ai.systemPrompt}
                            initialUserPrompt={block.ai.initialUserPrompt}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
