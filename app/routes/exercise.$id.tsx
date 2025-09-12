import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { useForm } from 'react-hook-form';
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, useFetcher, useLoaderData, useSearchParams } from 'react-router';
import { requireUser } from '../lib/auth';
import { prisma } from '../lib/db';
import {
  completionActionSchema,
  ikigaiResponseSchema,
  type StepResponse,
  shortPhraseResponseSchema,
  textResponseSchema,
} from '../schemas/completion';

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

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const json = await request.json();
  const result = completionActionSchema.safeParse(json);

  if (!result.success) {
    return data({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }

  const { stepId, exerciseId, action: actionType, responses } = result.data;

  let completionStep = await prisma.completionStep.findFirst({
    where: {
      exerciseStepId: stepId,
      completion: {
        userId: user.id,
        exerciseId,
      },
    },
    include: {
      completion: true,
    },
  });

  if (!completionStep) {
    const completion = await prisma.completion.findFirst({
      where: {
        userId: user.id,
        exerciseId,
      },
    });

    if (!completion) {
      return data({ error: 'Completion not found' }, { status: 404 });
    }

    completionStep = await prisma.completionStep.create({
      data: {
        exerciseStepId: stepId,
        completionId: completion.id,
        responses,
        completed: actionType === 'complete',
      },
      include: {
        completion: true,
      },
    });
  } else {
    completionStep = await prisma.completionStep.update({
      where: { id: completionStep.id },
      data: {
        responses,
        completed: actionType === 'complete' || completionStep.completed,
      },
      include: {
        completion: true,
      },
    });
  }

  if (actionType === 'next') {
    const url = new URL(request.url);
    const currentStep = parseInt(url.searchParams.get('step') || '0', 10);
    return data({ success: true, nextStep: currentStep + 1 });
  }

  if (actionType === 'previous') {
    const url = new URL(request.url);
    const currentStep = parseInt(url.searchParams.get('step') || '0', 10);
    return data({ success: true, nextStep: Math.max(0, currentStep - 1) });
  }

  return data({ success: true });
}

interface StepWithPrompts {
  conversationConfig?: PrismaJson.ConversationConfig | null;
  id: string;
  title: string;
  description: string;
  responseType: string;
  instructionSections?: PrismaJson.InstructionSections | null;
  questionSet?: PrismaJson.QuestionSet | null;
  worksheetTemplates?: PrismaJson.WorksheetTemplates | null;
  resources?: PrismaJson.Resources | null;
}

function TextResponseForm({ step, onSubmit }: { step: StepWithPrompts; onSubmit: (data: StepResponse) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(textResponseSchema),
  });
  const conversationConfig = step.conversationConfig;
  const textareaId = useId();

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
      {conversationConfig ? (
        <>
          <div>
            <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-2">
              {conversationConfig.initialPrompt}
            </label>
          </div>
          <textarea
            id={textareaId}
            {...register('content')}
            placeholder="Type your response here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content?.message}</p>}
        </>
      ) : (
        <div>
          <textarea
            {...register('content')}
            placeholder="Enter your response"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content?.message}</p>}
        </div>
      )}
      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Save Response
      </button>
    </form>
  );
}

function ShortPhraseResponseForm({
  step,
  onSubmit,
}: {
  step: StepWithPrompts;
  onSubmit: (data: StepResponse) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shortPhraseResponseSchema),
  });
  const conversationConfig = step.conversationConfig;
  const inputId = 'short-phrase-input';

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-4">
      {conversationConfig && (
        <div>
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
            {conversationConfig.initialPrompt}
          </label>
          <input
            id={inputId}
            {...register('content', { required: 'Response is required' })}
            type="text"
            placeholder="Type your phrase here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>}
        </div>
      )}
      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Save Response
      </button>
    </form>
  );
}

interface StepWithQuestionnaire {
  questionSet?: PrismaJson.QuestionSet | null;
  id: string;
  title: string;
  description: string;
  responseType: string;
  instructionSections?: PrismaJson.InstructionSections | null;
  conversationConfig?: PrismaJson.ConversationConfig | null;
  worksheetTemplates?: PrismaJson.WorksheetTemplates | null;
  resources?: PrismaJson.Resources | null;
}

function QuestionnaireResponseForm({
  step,
  onSubmit,
}: {
  step: StepWithQuestionnaire;
  onSubmit: (data: StepResponse) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ responses: Array<{ questionId: string; answer: string }> }>();
  const questions = step.questionSet?.questions || [];

  const onFormSubmit = handleSubmit((data) => {
    const responses = data.responses.map((r, index) => ({
      questionId: r.questionId,
      question: questions[index]?.question || '',
      answer: r.answer,
    }));
    onSubmit({ type: 'questionnaire', responses });
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      {step.questionSet && (
        <div>
          <h3 className="text-lg font-semibold mb-2">{step.questionSet.title}</h3>
          {step.questionSet.description && <p className="text-gray-600 mb-4">{step.questionSet.description}</p>}
        </div>
      )}
      {questions.map((question, index) => {
        const inputId = `question-${question.id}`;
        return (
          <div key={question.id}>
            <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
              {question.number}. {question.question}
            </label>
            {question.type === 'multiline' ? (
              <textarea
                id={inputId}
                {...register(`responses.${index}.answer`, {
                  required: question.required ? 'Answer is required' : false,
                })}
                placeholder={question.placeholder}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <input
                id={inputId}
                {...register(`responses.${index}.answer`, {
                  required: question.required ? 'Answer is required' : false,
                })}
                type="text"
                placeholder={question.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
            <input type="hidden" {...register(`responses.${index}.questionId`)} value={question.id} />
            {errors.responses?.[index]?.answer && (
              <p className="mt-1 text-sm text-red-600">{errors.responses[index]?.answer?.message}</p>
            )}
          </div>
        );
      })}
      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Save Responses
      </button>
    </form>
  );
}

function IkigaiGridResponseForm({ onSubmit }: { step: StepWithPrompts; onSubmit: (data: StepResponse) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ikigaiResponseSchema),
  });

  const ikigaiFields = [
    { name: 'passion', label: 'What You Love (Passion)', placeholder: 'What activities make you lose track of time?' },
    { name: 'dislikes', label: 'What You Dislike', placeholder: 'What activities drain your energy?' },
    {
      name: 'competency',
      label: "What You're Good At (Competency)",
      placeholder: 'What skills come naturally to you?',
    },
    { name: 'ineptitude', label: "What You're Not Good At", placeholder: 'What areas challenge you?' },
    { name: 'financialSuccess', label: 'What You Can Be Paid For', placeholder: 'What skills are marketable?' },
    {
      name: 'financialMissed',
      label: "What You Can't Be Paid For",
      placeholder: 'What activities have no market value?',
    },
    { name: 'impact', label: 'What The World Needs', placeholder: 'How can you make a difference?' },
    { name: 'indifference', label: "What The World Doesn't Need", placeholder: 'What has little impact?' },
  ] as const;

  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ikigaiFields.map((field) => (
          <div key={field.name}>
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <textarea
              id={field.name}
              {...register(field.name as keyof typeof ikigaiResponseSchema.shape)}
              placeholder={field.placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors[field.name] && <p className="mt-1 text-sm text-red-600">{errors[field.name]?.message}</p>}
          </div>
        ))}
      </div>
      <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
        Save Ikigai Grid
      </button>
    </form>
  );
}

export default function Exercise() {
  const { exercise, currentStep, currentStepIndex, isLastStep, completedStepIds } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [, setSearchParams] = useSearchParams();

  const handleSubmit = (responses: StepResponse) => {
    fetcher.submit(
      JSON.stringify({
        stepId: currentStep.id,
        exerciseId: exercise.id,
        action: 'save',
        responses,
      }),
      {
        method: 'post',
        encType: 'application/json',
      }
    );
  };

  const handleNavigation = (action: 'next' | 'previous' | 'complete') => {
    if (action === 'next' && !isLastStep) {
      setSearchParams({ step: String(currentStepIndex + 1) });
    } else if (action === 'previous' && currentStepIndex > 0) {
      setSearchParams({ step: String(currentStepIndex - 1) });
    }
  };

  const renderStepForm = () => {
    switch (currentStep.responseType) {
      case 'text':
      case 'statement':
      case 'narrative':
        return <TextResponseForm step={currentStep} onSubmit={handleSubmit} />;
      case 'shortPhrase':
        return <ShortPhraseResponseForm step={currentStep} onSubmit={handleSubmit} />;
      case 'questionnaire':
        return <QuestionnaireResponseForm step={currentStep} onSubmit={handleSubmit} />;
      case 'multiPrompt':
        return <TextResponseForm step={currentStep} onSubmit={handleSubmit} />;
      case 'ikigaiGrid':
        return <IkigaiGridResponseForm step={currentStep} onSubmit={handleSubmit} />;
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">This response type ({currentStep.responseType}) is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">{exercise.name}</h1>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span>
                Step {currentStepIndex + 1} of {exercise.steps.length}
              </span>
              <span className="mx-2">•</span>
              <span>{Math.round((completedStepIds.length / exercise.steps.length) * 100)}% Complete</span>
            </div>
          </div>

          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{currentStep.title}</h2>
            {currentStep.description && <p className="text-gray-600 mb-6">{currentStep.description}</p>}

            {currentStep.instructionSections?.map((section) => (
              <div key={section.id} className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{section.title}</h3>
                <p className="text-gray-600">{section.content}</p>
              </div>
            ))}

            <div className="mt-6">{renderStepForm()}</div>

            {fetcher.data?.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{fetcher.data.error}</p>
              </div>
            )}

            {fetcher.data?.success && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">Response saved successfully!</p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={() => handleNavigation('previous')}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => handleNavigation('next')}
              disabled={isLastStep}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLastStep ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
