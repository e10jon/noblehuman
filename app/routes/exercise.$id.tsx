import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
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
        <h1 className="text-3xl font-bold mb-8">{exercise.name}</h1>
        <div className="space-y-4">
          {exercise.steps.map((step) => {
            return (
              <div key={step.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Step {step.order}</h3>
                {step.content?.blocks?.map((block, index) => (
                  <div key={`${step.id}-block-${index}`}>
                    {block.content && <p className="text-gray-700 whitespace-pre-wrap mb-4">{block.content}</p>}
                    {block.ai && (
                      <div className="mt-4">
                        <Conversation />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
