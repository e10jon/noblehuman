import { useId } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { Form, Link, redirect, useLoaderData } from 'react-router';
import type { CompletionStep, ExerciseStep } from '../../prisma/generated/client';
import { requireUser } from '../lib/auth';
import { prisma } from '../lib/db';

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
  return [
    { title: `${loaderData?.exercise.name || 'Exercise'} - Noble Human` },
    { name: 'description', content: 'Complete your Noble Human exercise' },
  ];
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const exerciseId = params.id;

  if (!exerciseId) {
    throw new Response('Not Found', { status: 404 });
  }

  const url = new URL(request.url);
  const stepParam = url.searchParams.get('step');

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exercise) {
    throw new Response('Not Found', { status: 404 });
  }

  let completion = await prisma.completion.findFirst({
    where: {
      userId: user.id,
      exerciseId: exercise.id,
    },
    include: {
      steps: {
        include: {
          exerciseStep: true,
        },
      },
    },
  });

  if (!completion) {
    completion = await prisma.completion.create({
      data: {
        userId: user.id,
        exerciseId: exercise.id,
      },
      include: {
        steps: {
          include: {
            exerciseStep: true,
          },
        },
      },
    });
  }

  const completedStepIds = completion.steps.filter((s) => s.completed).map((s) => s.exerciseStepId);

  let currentStepIndex: number;
  if (stepParam !== null) {
    const requestedIndex = parseInt(stepParam, 10);
    if (!Number.isNaN(requestedIndex) && requestedIndex >= 0 && requestedIndex < exercise.steps.length) {
      currentStepIndex = requestedIndex;
    } else {
      const firstIncompleteIndex = exercise.steps.findIndex((step) => !completedStepIds.includes(step.id));
      currentStepIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : exercise.steps.length - 1;
    }
  } else {
    const firstIncompleteIndex = exercise.steps.findIndex((step) => !completedStepIds.includes(step.id));
    currentStepIndex = firstIncompleteIndex !== -1 ? firstIncompleteIndex : exercise.steps.length - 1;
  }

  const currentStep = exercise.steps[currentStepIndex];
  const isLastStep = currentStepIndex === exercise.steps.length - 1;
  const isCompleted = completedStepIds.length === exercise.steps.length;

  const currentCompletionStep = completion.steps.find((cs) => cs.exerciseStepId === currentStep.id);

  return {
    exercise,
    currentStep,
    currentStepIndex,
    isLastStep,
    isCompleted,
    completion,
    currentCompletionStep,
    completedStepIds,
    user,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const exerciseId = params.id;

  if (!exerciseId) {
    throw new Response('Not Found', { status: 404 });
  }

  const formData = await request.formData();
  const action = formData.get('_action') as string;
  const stepId = formData.get('stepId') as string;
  const responseType = formData.get('responseType') as string;

  if (action === 'navigate') {
    const targetStep = formData.get('targetStep') as string;
    return redirect(`/exercise/${exerciseId}?step=${targetStep}`);
  }

  const completion = await prisma.completion.findFirst({
    where: {
      userId: user.id,
      exerciseId,
    },
  });

  if (!completion) {
    throw new Response('Completion not found', { status: 404 });
  }

  let responses: PrismaJson.StepResponses;

  switch (responseType) {
    case 'text':
    case 'shortPhrase':
      responses = {
        type: responseType as 'text' | 'shortPhrase',
        content: formData.get('response') as string,
      };
      break;

    case 'statement':
      responses = {
        type: 'statement',
        content: formData.get('statement') as string,
      };
      break;

    case 'multiPrompt': {
      const promptResponses: Array<{ promptId: string; question: string; answer: string }> = [];
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('prompt-')) {
          const promptId = key.replace('prompt-', '');
          const question = formData.get(`question-${promptId}`) as string;
          promptResponses.push({
            promptId,
            question,
            answer: value as string,
          });
        }
      }
      responses = {
        type: 'multiPrompt',
        responses: promptResponses,
      };
      break;
    }

    case 'ikigaiGrid':
      responses = {
        type: 'ikigaiGrid',
        passion: formData.get('passion') as string,
        dislikes: formData.get('dislikes') as string,
        competency: formData.get('competency') as string,
        ineptitude: formData.get('ineptitude') as string,
        financialSuccess: formData.get('financialSuccess') as string,
        financialMissed: formData.get('financialMissed') as string,
        impact: formData.get('impact') as string,
        indifference: formData.get('indifference') as string,
      };
      break;

    default:
      responses = { type: 'text', content: '' };
  }

  const completionStep = await prisma.completionStep.findFirst({
    where: {
      completionId: completion.id,
      exerciseStepId: stepId,
    },
  });

  if (completionStep) {
    await prisma.completionStep.update({
      where: { id: completionStep.id },
      data: {
        responses,
        completed: true,
      },
    });
  } else {
    await prisma.completionStep.create({
      data: {
        completionId: completion.id,
        exerciseStepId: stepId,
        responses,
        completed: true,
      },
    });
  }

  const url = new URL(request.url);
  const currentStepParam = url.searchParams.get('step');
  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!exercise) {
    throw new Response('Not Found', { status: 404 });
  }

  const updatedCompletion = await prisma.completion.findFirst({
    where: {
      userId: user.id,
      exerciseId,
    },
    include: {
      steps: true,
    },
  });

  const completedStepIds = updatedCompletion?.steps.filter((s) => s.completed).map((s) => s.exerciseStepId) || [];
  const currentStepIndex = currentStepParam
    ? parseInt(currentStepParam, 10)
    : exercise.steps.findIndex((s) => s.id === stepId);
  const allStepsCompleted = completedStepIds.length === exercise.steps.length;

  // If all steps are completed, stay on the current step to allow further edits
  if (allStepsCompleted) {
    return redirect(`/exercise/${exerciseId}?step=${currentStepIndex}`);
  }

  // Find the next incomplete step
  const nextIncompleteIndex = exercise.steps.findIndex(
    (step, index) => index > currentStepIndex && !completedStepIds.includes(step.id)
  );

  if (nextIncompleteIndex !== -1) {
    return redirect(`/exercise/${exerciseId}?step=${nextIncompleteIndex}`);
  } else if (currentStepIndex < exercise.steps.length - 1) {
    return redirect(`/exercise/${exerciseId}?step=${currentStepIndex + 1}`);
  }

  return redirect(`/exercise/${exerciseId}?step=${currentStepIndex}`);
}

function StepForm({
  step,
  currentCompletionStep,
}: {
  step: ExerciseStep;
  currentCompletionStep: CompletionStep | null | undefined;
}) {
  const statementId = useId();
  const responseId = useId();
  const shortResponseId = useId();
  const prompts = step.prompts as PrismaJson.ExercisePrompts | null;
  const savedResponses = currentCompletionStep?.responses as PrismaJson.StepResponses | null;

  switch (step.responseType) {
    case 'multiPrompt':
      return (
        <div className="space-y-6">
          {prompts?.map((prompt) => (
            <div key={prompt.id}>
              <label htmlFor={`prompt-${prompt.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                {prompt.question}
              </label>
              {prompt.helpText && <p className="text-sm text-gray-500 mb-2">{prompt.helpText}</p>}
              <input type="hidden" name={`question-${prompt.id}`} value={prompt.question} />
              <textarea
                id={`prompt-${prompt.id}`}
                name={`prompt-${prompt.id}`}
                rows={4}
                required
                defaultValue={
                  savedResponses?.type === 'multiPrompt'
                    ? savedResponses.responses.find((r) => r.promptId === prompt.id)?.answer
                    : ''
                }
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder={prompt.placeholder}
              />
              {prompt.type === 'ai' && (
                <p className="mt-1 text-xs text-gray-500">
                  AI prompt - Consider using ChatGPT or Claude for this question
                </p>
              )}
            </div>
          ))}
        </div>
      );

    case 'ikigaiGrid':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {prompts?.map((prompt) => (
            <div key={prompt.id}>
              <label htmlFor={prompt.id} className="block text-sm font-medium text-gray-700 mb-2">
                {prompt.question}
              </label>
              <textarea
                id={prompt.id}
                name={prompt.id}
                rows={3}
                required
                defaultValue={
                  savedResponses?.type === 'ikigaiGrid'
                    ? ((savedResponses as PrismaJson.IkigaiGridResponse)[
                        prompt.id as keyof PrismaJson.IkigaiGridResponse
                      ] as string) || ''
                    : ''
                }
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          ))}
        </div>
      );

    case 'statement':
      return (
        <div>
          <label htmlFor={statementId} className="block text-sm font-medium text-gray-700 mb-2">
            Your Best Life Statement
          </label>
          <p className="text-sm text-gray-500 mb-4">
            Write your Best Life vision in 1-2 sentences. Be bold and authentic.
          </p>
          <textarea
            id={statementId}
            name="statement"
            rows={4}
            required
            defaultValue={savedResponses?.type === 'statement' ? savedResponses.content : ''}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="In my best life, I..."
          />
        </div>
      );

    case 'shortPhrase':
      return (
        <div>
          <label htmlFor={shortResponseId} className="block text-sm font-medium text-gray-700 mb-2">
            {prompts?.[0]?.question || 'Your Response'}
          </label>
          {prompts?.[0]?.helpText && <p className="text-sm text-gray-500 mb-2">{prompts[0].helpText}</p>}
          <input
            type="text"
            id={shortResponseId}
            name="response"
            required
            defaultValue={savedResponses?.type === 'shortPhrase' ? savedResponses.content : ''}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Enter a short phrase..."
          />
        </div>
      );

    default:
      return (
        <div>
          <label htmlFor={responseId} className="block text-sm font-medium text-gray-700 mb-2">
            Your Response
          </label>
          <textarea
            id={responseId}
            name="response"
            rows={6}
            required
            defaultValue={savedResponses?.type === 'text' ? savedResponses.content : ''}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
        </div>
      );
  }
}

export default function Exercise() {
  const { exercise, currentStep, currentStepIndex, isLastStep, isCompleted, currentCompletionStep, completedStepIds } =
    useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {isCompleted && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Completed"
              >
                <title>Completed</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-800">Exercise Completed!</h3>
                <p className="text-sm text-green-700 mt-1">
                  You've completed all steps. You can still review and edit your responses below.
                </p>
              </div>
              <Link
                to="/"
                className="ml-4 px-3 py-1.5 text-sm font-medium text-green-800 bg-green-100 rounded-md hover:bg-green-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
        <div className="mb-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 text-sm">
            ← Back to exercises
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">{exercise.name}</h1>
          {exercise.weekNumber && <p className="mt-2 text-gray-600">Week {exercise.weekNumber}</p>}
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <span>
              Step {currentStepIndex + 1} of {exercise.steps.length}
            </span>
            <span>{Math.round((completedStepIds.length / exercise.steps.length) * 100)}% Complete</span>
          </div>

          <div className="flex gap-2 mb-4">
            {exercise.steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isComplete = completedStepIds.includes(step.id);

              return (
                <Form key={step.id} method="post" className="flex-1">
                  <input type="hidden" name="_action" value="navigate" />
                  <input type="hidden" name="targetStep" value={index} />
                  <button
                    type="submit"
                    className={`
                      w-full py-2 px-3 text-xs font-medium rounded-md transition-colors
                      ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : isComplete
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                    title={step.title}
                  >
                    {index + 1}. {isComplete && '✓'}
                  </button>
                </Form>
              );
            })}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedStepIds.length / exercise.steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{currentStep.title}</h2>
          </div>

          <div className="p-6">
            {currentStep.description && (
              <div className="mb-6 prose prose-sm max-w-none">
                <p style={{ whiteSpace: 'pre-wrap' }}>{currentStep.description}</p>
              </div>
            )}

            <Form method="post" className="space-y-6">
              <input type="hidden" name="stepId" value={currentStep.id} />
              <input type="hidden" name="responseType" value={currentStep.responseType} />

              <StepForm step={currentStep} currentCompletionStep={currentCompletionStep} />

              <div className="flex justify-between pt-4 gap-4">
                <Form method="post">
                  <input type="hidden" name="_action" value="navigate" />
                  <input type="hidden" name="targetStep" value={currentStepIndex - 1} />
                  <button
                    type="submit"
                    disabled={currentStepIndex === 0}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>
                </Form>

                <div className="flex gap-2">
                  {currentStepIndex < exercise.steps.length - 1 && (
                    <Form method="post">
                      <input type="hidden" name="_action" value="navigate" />
                      <input type="hidden" name="targetStep" value={currentStepIndex + 1} />
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Skip →
                      </button>
                    </Form>
                  )}

                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isCompleted
                      ? 'Update Response'
                      : completedStepIds.includes(currentStep.id)
                        ? 'Update & Continue'
                        : isLastStep && completedStepIds.length === exercise.steps.length - 1
                          ? 'Complete Exercise'
                          : 'Save & Next'}
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
