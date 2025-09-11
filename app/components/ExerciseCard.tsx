import { Link } from 'react-router';
import type { Completion, CompletionStep, Exercise, ExerciseStep } from '../../prisma/generated/client';

interface ExerciseWithSteps extends Exercise {
  steps: ExerciseStep[];
}

interface CompletionWithSteps extends Completion {
  steps: CompletionStep[];
}

interface ExerciseCardProps {
  exercise: ExerciseWithSteps;
  completion?: CompletionWithSteps | null;
}

export function ExerciseCard({ exercise, completion }: ExerciseCardProps) {
  const metadata = exercise.metadata as PrismaJson.ExerciseMetadata | null;
  const completedSteps = completion?.steps.filter((s) => s.completed).length ?? 0;
  const totalSteps = exercise.steps.length;
  const isCompleted = completion && completedSteps === totalSteps;
  const isInProgress = completion && completedSteps > 0 && completedSteps < totalSteps;

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    if (isInProgress) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          In Progress ({completedSteps}/{totalSteps})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Not Started
      </span>
    );
  };

  const getButtonText = () => {
    if (isCompleted) return 'View Results';
    if (isInProgress) return 'Continue';
    return 'Start Exercise';
  };

  const getCompletionPreview = () => {
    if (!(completion && isCompleted)) return null;

    const bestLifeStep = completion.steps.find((cs) => {
      const exerciseStep = exercise.steps.find((es) => es.id === cs.exerciseStepId);
      return exerciseStep?.responseType === 'statement';
    });

    if (bestLifeStep?.responses) {
      const response = bestLifeStep.responses as PrismaJson.StatementResponse;
      if (response.type === 'statement' && response.content) {
        return (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Your Best Life:</h4>
            <p className="text-sm text-blue-700 italic">"{response.content}"</p>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">{exercise.name}</h3>
            {exercise.weekNumber && <p className="mt-1 text-sm text-gray-500">Week {exercise.weekNumber}</p>}
          </div>
          {getStatusBadge()}
        </div>

        {exercise.buddhismConcept && (
          <div className="mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              {exercise.buddhismConcept}
            </span>
          </div>
        )}

        {exercise.steps[0]?.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {exercise.steps[0].description.substring(0, 200)}...
          </p>
        )}

        {metadata?.estimatedMinutes && (
          <p className="text-xs text-gray-500 mb-4">Estimated time: {metadata.estimatedMinutes} minutes</p>
        )}

        {isInProgress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round((completedSteps / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {getCompletionPreview()}

        <div className="mt-5">
          <Link
            to={`/exercise/${exercise.id}`}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {getButtonText()}
          </Link>
        </div>
      </div>
    </div>
  );
}
