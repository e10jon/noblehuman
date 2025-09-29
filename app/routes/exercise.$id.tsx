import { useEffect, useRef, useState } from 'react';
import { Link, useFetcher, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import type { SaveResult } from '~/schemas/exercise-step';
import type { Completion, CompletionStep } from '../../prisma/generated/client';
import Conversation from '../components/Conversation';
import { ResultEditor } from '../components/ResultEditor';
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

function ResultCapture({
  completionStepId,
  resultPrompt,
  initialResult,
  onCompletionUpdate,
}: {
  completionStepId: string;
  resultPrompt: string;
  initialResult?: string;
  onCompletionUpdate?: (completion: Completion & { steps: CompletionStep[] }) => void;
}) {
  const fetcher = useFetcher();
  const [result, setResult] = useState(initialResult || '');
  const [savedResult, setSavedResult] = useState(initialResult || '');
  const lastProcessedDataRef = useRef<unknown>(null);

  const hasChanges = result !== savedResult;
  const isSaving = fetcher.state === 'submitting' || fetcher.state === 'loading';
  const showButtons = hasChanges || isSaving;

  const handleSave = () => {
    fetcher.submit({ completionStepId, result } satisfies SaveResult, {
      method: 'POST',
      action: $path('/api/save-result'),
      encType: 'application/json',
    });
  };

  const handleCancel = () => {
    setResult(savedResult);
  };

  const handleResultChange = (newResult: string) => {
    setResult(newResult);
  };

  useEffect(() => {
    if (
      fetcher.state === 'idle' &&
      fetcher.data &&
      'success' in fetcher.data &&
      fetcher.data !== lastProcessedDataRef.current
    ) {
      setSavedResult(result);
      lastProcessedDataRef.current = fetcher.data;

      // Notify parent component of completion update
      if ('completion' in fetcher.data && onCompletionUpdate) {
        onCompletionUpdate(fetcher.data.completion);
      }
    }
  }, [fetcher.state, fetcher.data, result, onCompletionUpdate]);

  return (
    <div className="mt-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
      <div className="mb-3">
        <p className="text-sm text-purple-700 mt-1">{resultPrompt}</p>
      </div>

      <div className="space-y-3">
        <ResultEditor
          value={result}
          onChange={handleResultChange}
          placeholder="Document your results, insights, and key takeaways..."
          className="min-h-[120px]"
        />

        {showButtons && (
          <div className="flex gap-2">
            <Button type="button" onClick={handleSave} disabled={isSaving || !result.trim() || !hasChanges} size="sm">
              {isSaving ? 'Saving...' : 'Save Result'}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving} size="sm">
              Cancel
            </Button>
          </div>
        )}
      </div>

      {fetcher.data && 'error' in fetcher.data && <div className="mt-2 text-sm text-red-600">{fetcher.data.error}</div>}
    </div>
  );
}

export default function Exercise() {
  const { exercise, completion: initialCompletion } = useLoaderData<typeof loader>();
  const [completion, setCompletion] = useState(initialCompletion);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  const handleCompletionUpdate = (updatedCompletion: Completion & { steps: CompletionStep[] }) => {
    setCompletion((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...updatedCompletion,
        steps: prev.steps.map((step) => {
          const updated = updatedCompletion.steps.find((s) => s.id === step.id);
          return updated ? { ...step, ...updated } : step;
        }),
      };
    });
  };

  const allStepsCompleted = completion?.steps?.every((step) => step.completed);

  useEffect(() => {
    if (allStepsCompleted && completion?.completionMessage) {
      setShowCompletionDialog(true);
    }
  }, [allStepsCompleted, completion?.completionMessage]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button variant="link" asChild className="p-0">
            <Link to={$path('/')}>← Back to exercises</Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-8">{exercise.name}</h1>

        <Dialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog}>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">🎉 Exercise Completed!</DialogTitle>
              <DialogDescription className="sr-only">
                You have successfully completed all steps of this exercise.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 prose prose-green max-w-none">
              {completion?.completionMessage && (
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Server-generated completion message is safe
                <div dangerouslySetInnerHTML={{ __html: completion.completionMessage }} />
              )}
              <div className="mt-4">
                <Link to={$path('/')}>← Back to exercises</Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="space-y-4">
          {exercise.steps.map((step) => {
            const completionStep = completion?.steps.find((cs) => cs.exerciseStepId === step.id);

            return (
              <Card key={step.id} className="mb-12">
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {step.content?.blocks?.map((block, index) => (
                    <div key={`${step.id}-block-${index}`}>
                      {block.content && (
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: We trust this.
                        <div className="text-gray-700 mb-4 prose" dangerouslySetInnerHTML={{ __html: block.content }} />
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
                  {step.content?.resultPrompt && completionStep && (
                    <ResultCapture
                      completionStepId={completionStep.id}
                      resultPrompt={step.content.resultPrompt}
                      initialResult={completionStep.result || undefined}
                      onCompletionUpdate={handleCompletionUpdate}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
