import ReactMarkdown from 'react-markdown';
import { Link, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Conversation from '../components/Conversation';
import { requireUser } from '../lib/auth';
import { findOrCreateCompletionWithSteps } from '../lib/chat';
import { prisma } from '../lib/db';
import type { Route } from './+types/exercise.$id';

export async function loader({ params, request }: Route.LoaderArgs) {
  const user = await requireUser(request);

  const exercise = await prisma.exercise.findUniqueOrThrow({
    where: { id: params.id },
    include: { steps: { orderBy: { order: 'asc' } } },
  });

  const completion = await findOrCreateCompletionWithSteps({
    userId: user.id,
    exerciseId: exercise.id,
    exerciseSteps: exercise.steps,
  });

  return { exercise, completion };
}

export default function Exercise() {
  const { exercise, completion } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="link" asChild className="p-0">
            <Link to={$path('/')}>← Back to exercises</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-8">{exercise.name}</h1>
        <div className="space-y-4">
          {exercise.steps.map((step) => {
            const completionStep = completion?.steps.find((cs) => cs.exerciseStepId === step.id);

            return (
              <Card key={step.id} className="mb-12">
                <CardHeader>
                  <CardTitle>Step {step.order}</CardTitle>
                </CardHeader>
                <CardContent>
                  {step.content?.blocks?.map((block, index) => (
                    <div key={`${step.id}-block-${index}`}>
                      {block.content && (
                        <div className="text-gray-700 mb-4 prose">
                          <ReactMarkdown>{block.content}</ReactMarkdown>
                        </div>
                      )}
                      {block.ai && completionStep && (
                        <div className="my-6 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                          <Conversation
                            systemPrompt={block.ai.systemPrompt}
                            initialUserPrompt={block.ai.initialUserPrompt}
                            completionStepId={completionStep.id}
                            initialMessages={completionStep.messages}
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
