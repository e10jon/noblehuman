import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowDown, ArrowLeft, ArrowUp, Edit, Plus, Save, Trash2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { data, Link, useFetcher, useLoaderData } from 'react-router';
import { $path } from 'safe-routes';
import type { ActionSchema } from '~/schemas/action';
import AdminLayout from '../components/AdminLayout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';
import {
  type AddBlock,
  type AddStep,
  addBlockSchema,
  addStepSchema,
  type Block,
  exerciseActionSchema,
  type UpdateBlock,
  type UpdateExercise,
  type UpdateStep,
  updateBlockSchema,
  updateExerciseSchema,
  updateStepSchema,
} from '../schemas/admin/exercise';
import type { Route } from './+types/admin.exercises.$id';

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireAdmin(request);

  const exercise = await prisma.exercise.findUniqueOrThrow({
    where: { id: params.id },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return { user, exercise };
}

async function handleUpdateExercise(params: { id: string }, parsed: { name: string }) {
  await prisma.exercise.update({
    where: { id: params.id },
    data: { name: parsed.name.trim() },
  });
  return data({ success: 'Exercise updated successfully!' } satisfies ActionSchema, { status: 200 });
}

async function handleAddStep(
  params: { id: string },
  parsed: { blocks: Array<{ content?: string; systemPrompt?: string; initialUserPrompt?: string }> }
) {
  const maxOrder = await prisma.exerciseStep.findFirst({
    where: { exerciseId: params.id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  const newOrder = (maxOrder?.order || 0) + 1;

  const stepContent = {
    blocks: parsed.blocks.map((block) => ({
      content: block.content || undefined,
      ai:
        block.systemPrompt || block.initialUserPrompt
          ? {
              systemPrompt: block.systemPrompt || undefined,
              initialUserPrompt: block.initialUserPrompt || undefined,
            }
          : undefined,
    })),
  };

  await prisma.exerciseStep.create({
    data: {
      exerciseId: params.id,
      order: newOrder,
      content: stepContent,
    },
  });

  return data({ success: 'Step added successfully!' } satisfies ActionSchema, { status: 200 });
}

async function handleUpdateStep(parsed: {
  stepId: string;
  content?: string;
  systemPrompt?: string;
  initialUserPrompt?: string;
}) {
  const stepContent = {
    blocks: [
      {
        content: parsed.content,
        ai:
          parsed.systemPrompt || parsed.initialUserPrompt
            ? {
                systemPrompt: parsed.systemPrompt,
                initialUserPrompt: parsed.initialUserPrompt,
              }
            : undefined,
      },
    ],
  };

  await prisma.exerciseStep.update({
    where: { id: parsed.stepId },
    data: { content: stepContent },
  });

  return data({ success: 'Step updated successfully!' } satisfies ActionSchema, { status: 200 });
}

async function handleDeleteStep(parsed: { stepId: string }) {
  await prisma.exerciseStep.delete({
    where: { id: parsed.stepId },
  });
  return data({ success: 'Step deleted successfully!' } satisfies ActionSchema, { status: 200 });
}

async function handleReorderStep(params: { id: string }, parsed: { stepId: string; direction: 'up' | 'down' }) {
  const step = await prisma.exerciseStep.findUnique({
    where: { id: parsed.stepId },
    select: { order: true },
  });

  if (!step) {
    return data({ error: 'Step not found' } satisfies ActionSchema, { status: 404 });
  }

  const targetOrder = parsed.direction === 'up' ? step.order - 1 : step.order + 1;

  const targetStep = await prisma.exerciseStep.findFirst({
    where: {
      exerciseId: params.id,
      order: targetOrder,
    },
  });

  if (targetStep) {
    await prisma.exerciseStep.update({
      where: { id: targetStep.id },
      data: { order: step.order },
    });

    await prisma.exerciseStep.update({
      where: { id: parsed.stepId },
      data: { order: targetOrder },
    });

    return data({ success: 'Step reordered successfully!' } satisfies ActionSchema, { status: 200 });
  }

  return data({ error: 'Cannot reorder step' } satisfies ActionSchema, { status: 400 });
}

async function handleAddBlock(parsed: {
  stepId: string;
  content?: string;
  systemPrompt?: string;
  initialUserPrompt?: string;
}) {
  const step = await prisma.exerciseStep.findUnique({
    where: { id: parsed.stepId },
    select: { content: true },
  });

  if (!step) {
    return data({ error: 'Step not found' } satisfies ActionSchema, { status: 404 });
  }

  const currentContent = step.content;
  const blocks = Array.isArray(currentContent?.blocks) ? currentContent.blocks : [];

  const newBlock = {
    content: parsed.content || undefined,
    ai:
      parsed.systemPrompt || parsed.initialUserPrompt
        ? {
            systemPrompt: parsed.systemPrompt || undefined,
            initialUserPrompt: parsed.initialUserPrompt || undefined,
          }
        : undefined,
  };

  blocks.push(newBlock);

  await prisma.exerciseStep.update({
    where: { id: parsed.stepId },
    data: {
      content: { blocks },
    },
  });

  return data({ success: 'Block added successfully!' } satisfies ActionSchema, { status: 200 });
}

async function handleUpdateBlock(parsed: {
  stepId: string;
  blockIndex: number;
  content?: string;
  systemPrompt?: string;
  initialUserPrompt?: string;
}) {
  const step = await prisma.exerciseStep.findUnique({
    where: { id: parsed.stepId },
    select: { content: true },
  });

  if (!step) {
    return data({ error: 'Step not found' } satisfies ActionSchema, { status: 404 });
  }

  const currentContent = step.content;
  const blocks = Array.isArray(currentContent?.blocks) ? [...currentContent.blocks] : [];

  if (parsed.blockIndex >= blocks.length) {
    return data({ error: 'Block not found' } satisfies ActionSchema, { status: 404 });
  }

  blocks[parsed.blockIndex] = {
    content: parsed.content || undefined,
    ai:
      parsed.systemPrompt || parsed.initialUserPrompt
        ? {
            systemPrompt: parsed.systemPrompt || undefined,
            initialUserPrompt: parsed.initialUserPrompt || undefined,
          }
        : undefined,
  };

  await prisma.exerciseStep.update({
    where: { id: parsed.stepId },
    data: {
      content: { blocks },
    },
  });

  return data({ success: 'Block updated successfully!' } satisfies ActionSchema, { status: 200 });
}

async function handleDeleteBlock(parsed: { stepId: string; blockIndex: number }) {
  const step = await prisma.exerciseStep.findUnique({
    where: { id: parsed.stepId },
    select: { content: true },
  });

  if (!step) {
    return data({ error: 'Step not found' } satisfies ActionSchema, { status: 404 });
  }

  const currentContent = step.content;
  const blocks = Array.isArray(currentContent?.blocks) ? [...currentContent.blocks] : [];

  if (parsed.blockIndex >= blocks.length) {
    return data({ error: 'Block not found' } satisfies ActionSchema, { status: 404 });
  }

  if (blocks.length <= 1) {
    return data({ error: 'Cannot delete the last block' } satisfies ActionSchema, { status: 400 });
  }

  blocks.splice(parsed.blockIndex, 1);

  await prisma.exerciseStep.update({
    where: { id: parsed.stepId },
    data: {
      content: { blocks },
    },
  });

  return data({ success: 'Block deleted successfully!' } satisfies ActionSchema, { status: 200 });
}

async function handleReorderBlock(parsed: { stepId: string; blockIndex: number; direction: 'up' | 'down' }) {
  const step = await prisma.exerciseStep.findUnique({
    where: { id: parsed.stepId },
    select: { content: true },
  });

  if (!step) {
    return data({ error: 'Step not found' } satisfies ActionSchema, { status: 404 });
  }

  const currentContent = step.content;
  const blocks = Array.isArray(currentContent?.blocks) ? [...currentContent.blocks] : [];

  if (parsed.blockIndex >= blocks.length) {
    return data({ error: 'Block not found' } satisfies ActionSchema, { status: 404 });
  }

  const targetIndex = parsed.direction === 'up' ? parsed.blockIndex - 1 : parsed.blockIndex + 1;

  if (targetIndex < 0 || targetIndex >= blocks.length) {
    return data({ error: 'Cannot reorder block' } satisfies ActionSchema, { status: 400 });
  }

  [blocks[parsed.blockIndex], blocks[targetIndex]] = [blocks[targetIndex], blocks[parsed.blockIndex]];

  await prisma.exerciseStep.update({
    where: { id: parsed.stepId },
    data: {
      content: { blocks },
    },
  });

  return data({ success: 'Block reordered successfully!' } satisfies ActionSchema, { status: 200 });
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireAdmin(request);

  try {
    const json = await request.json();
    const parsed = exerciseActionSchema.parse(json);

    switch (parsed.action) {
      case 'updateExercise':
        return handleUpdateExercise(params, parsed);
      case 'addStep':
        return handleAddStep(params, parsed);
      case 'updateStep':
        return handleUpdateStep(parsed);
      case 'deleteStep':
        return handleDeleteStep(parsed);
      case 'reorderStep':
        return handleReorderStep(params, parsed);
      case 'addBlock':
        return handleAddBlock(parsed);
      case 'updateBlock':
        return handleUpdateBlock(parsed);
      case 'deleteBlock':
        return handleDeleteBlock(parsed);
      case 'reorderBlock':
        return handleReorderBlock(parsed);
      default:
        return data({ error: 'Invalid action' } satisfies ActionSchema, { status: 400 });
    }
  } catch {
    return data({ error: 'Failed to process request' } satisfies ActionSchema, { status: 400 });
  }
}

function UpdateExerciseForm({ exerciseName }: { exerciseName: string }) {
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);

  const form = useForm<UpdateExercise>({
    resolver: zodResolver(updateExerciseSchema),
    defaultValues: { name: exerciseName },
  });

  const onSubmit = (formData: UpdateExercise) => {
    fetcher.submit(
      { action: 'updateExercise', ...formData },
      {
        method: 'POST',
        encType: 'application/json',
      }
    );
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setActionData(fetcher.data);
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise Name *</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {actionData && 'success' in actionData && <div className="text-green-600 text-sm">{actionData.success}</div>}

        {actionData && 'error' in actionData && <div className="text-red-600 text-sm">{actionData.error}</div>}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {form.formState.isSubmitting ? 'Saving...' : 'Save Exercise'}
        </Button>
      </fetcher.Form>
    </Form>
  );
}

type BlockWithId = Block & { id: string };

function AddStepForm() {
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);
  const [blocks, setBlocks] = useState<BlockWithId[]>([
    { id: crypto.randomUUID(), content: '', systemPrompt: '', initialUserPrompt: '' },
  ]);

  const form = useForm<AddStep>({
    resolver: zodResolver(addStepSchema),
    defaultValues: { blocks: [{ content: '', systemPrompt: '', initialUserPrompt: '' }] },
  });

  const onSubmit = (_formData: AddStep) => {
    const cleanBlocks = blocks.map(({ id, ...block }) => block);
    fetcher.submit(
      { action: 'addStep', blocks: cleanBlocks },
      {
        method: 'POST',
        encType: 'application/json',
      }
    );
    form.reset();
    setBlocks([{ id: crypto.randomUUID(), content: '', systemPrompt: '', initialUserPrompt: '' }]);
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setActionData(fetcher.data);
    }
  }, [fetcher.data, fetcher.state]);

  const addBlock = () => {
    setBlocks([...blocks, { id: crypto.randomUUID(), content: '', systemPrompt: '', initialUserPrompt: '' }]);
  };

  const removeBlock = (index: number) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((_, i) => i !== index));
    }
  };

  const updateBlock = (index: number, field: keyof Block, value: string) => {
    const updatedBlocks = [...blocks];
    updatedBlocks[index] = { ...updatedBlocks[index], [field]: value };
    setBlocks(updatedBlocks);
  };

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-6">
          {blocks.map((block, index) => (
            <div key={block.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Block {index + 1}</h4>
                {blocks.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeBlock(index)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>

              <div>
                <label htmlFor={`block-content-${index}`} className="text-sm font-medium">
                  Content (Markdown)
                </label>
                <Textarea
                  id={`block-content-${index}`}
                  placeholder="Enter block content in markdown..."
                  rows={3}
                  value={block.content || ''}
                  onChange={(e) => updateBlock(index, 'content', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor={`block-system-${index}`} className="text-sm font-medium">
                  AI System Prompt
                </label>
                <Textarea
                  id={`block-system-${index}`}
                  placeholder="Enter system prompt for AI conversation..."
                  rows={2}
                  value={block.systemPrompt || ''}
                  onChange={(e) => updateBlock(index, 'systemPrompt', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor={`block-initial-${index}`} className="text-sm font-medium">
                  AI Initial User Prompt
                </label>
                <Textarea
                  id={`block-initial-${index}`}
                  placeholder="Enter initial user prompt for AI conversation..."
                  rows={2}
                  value={block.initialUserPrompt || ''}
                  onChange={(e) => updateBlock(index, 'initialUserPrompt', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" onClick={addBlock}>
          <Plus className="h-4 w-4 mr-2" />
          Add Block
        </Button>

        {actionData && 'success' in actionData && <div className="text-green-600 text-sm">{actionData.success}</div>}

        {actionData && 'error' in actionData && <div className="text-red-600 text-sm">{actionData.error}</div>}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {form.formState.isSubmitting ? 'Adding...' : 'Add Step'}
        </Button>
      </fetcher.Form>
    </Form>
  );
}

function EditStepForm({
  step,
  onCancel,
}: {
  step: {
    id: string;
    content?: { blocks?: Array<{ content?: string; ai?: { systemPrompt?: string; initialUserPrompt?: string } }> };
  };
  onCancel: () => void;
}) {
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);

  const block = step.content?.blocks?.[0];

  const form = useForm<UpdateStep>({
    resolver: zodResolver(updateStepSchema),
    defaultValues: {
      stepId: step.id,
      content: block?.content || '',
      systemPrompt: block?.ai?.systemPrompt || '',
      initialUserPrompt: block?.ai?.initialUserPrompt || '',
    },
  });

  const onSubmit = (formData: UpdateStep) => {
    fetcher.submit(
      { action: 'updateStep', ...formData },
      {
        method: 'POST',
        encType: 'application/json',
      }
    );
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setActionData(fetcher.data);
      if (fetcher.data && 'success' in fetcher.data) {
        onCancel();
      }
    }
  }, [fetcher.data, fetcher.state, onCancel]);

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter step content in markdown..." rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI System Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter system prompt for AI conversation..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialUserPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Initial User Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter initial user prompt for AI conversation..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {actionData && 'success' in actionData && <div className="text-green-600 text-sm">{actionData.success}</div>}

        {actionData && 'error' in actionData && <div className="text-red-600 text-sm">{actionData.error}</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </fetcher.Form>
    </Form>
  );
}

function AddBlockForm({ stepId }: { stepId: string }) {
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);

  const form = useForm<AddBlock>({
    resolver: zodResolver(addBlockSchema),
    defaultValues: { stepId, content: '', systemPrompt: '', initialUserPrompt: '' },
  });

  const onSubmit = (formData: AddBlock) => {
    fetcher.submit(
      { action: 'addBlock', ...formData },
      {
        method: 'POST',
        encType: 'application/json',
      }
    );
    form.reset();
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setActionData(fetcher.data);
    }
  }, [fetcher.data, fetcher.state]);

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter block content in markdown..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI System Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter system prompt for AI conversation..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialUserPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Initial User Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter initial user prompt for AI conversation..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {actionData && 'success' in actionData && <div className="text-green-600 text-sm">{actionData.success}</div>}

        {actionData && 'error' in actionData && <div className="text-red-600 text-sm">{actionData.error}</div>}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          <Plus className="h-4 w-4 mr-2" />
          {form.formState.isSubmitting ? 'Adding...' : 'Add Block'}
        </Button>
      </fetcher.Form>
    </Form>
  );
}

function EditBlockForm({
  stepId,
  blockIndex,
  block,
  onCancel,
}: {
  stepId: string;
  blockIndex: number;
  block: { content?: string; ai?: { systemPrompt?: string; initialUserPrompt?: string } };
  onCancel: () => void;
}) {
  const fetcher = useFetcher<ActionSchema>();
  const [actionData, setActionData] = useState<ActionSchema | null>(null);

  const form = useForm<UpdateBlock>({
    resolver: zodResolver(updateBlockSchema),
    defaultValues: {
      stepId,
      blockIndex,
      content: block.content || '',
      systemPrompt: block.ai?.systemPrompt || '',
      initialUserPrompt: block.ai?.initialUserPrompt || '',
    },
  });

  const onSubmit = (formData: UpdateBlock) => {
    fetcher.submit(
      { action: 'updateBlock', ...formData },
      {
        method: 'POST',
        encType: 'application/json',
      }
    );
  };

  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      setActionData(fetcher.data);
      if (fetcher.data && 'success' in fetcher.data) {
        onCancel();
      }
    }
  }, [fetcher.data, fetcher.state, onCancel]);

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content (Markdown)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter block content in markdown..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="systemPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI System Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter system prompt for AI conversation..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialUserPrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Initial User Prompt</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter initial user prompt for AI conversation..." rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {actionData && 'success' in actionData && <div className="text-green-600 text-sm">{actionData.success}</div>}

        {actionData && 'error' in actionData && <div className="text-red-600 text-sm">{actionData.error}</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {form.formState.isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </fetcher.Form>
    </Form>
  );
}

function BlockActionForm({
  stepId,
  blockIndex,
  action,
  direction,
  children,
}: {
  stepId: string;
  blockIndex: number;
  action: 'deleteBlock' | 'reorderBlock';
  direction?: 'up' | 'down';
  children: ReactNode;
}) {
  const fetcher = useFetcher<ActionSchema>();

  const onSubmit = () => {
    const formData = { action, stepId, blockIndex, ...(direction && { direction }) };

    fetcher.submit(formData, {
      method: 'POST',
      encType: 'application/json',
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {children}
    </form>
  );
}

function StepActionForm({
  stepId,
  action,
  direction,
  children,
}: {
  stepId: string;
  action: 'deleteStep' | 'reorderStep';
  direction?: 'up' | 'down';
  children: ReactNode;
}) {
  const fetcher = useFetcher<ActionSchema>();

  const onSubmit = () => {
    const formData = { action, stepId, ...(direction && { direction }) };

    fetcher.submit(formData, {
      method: 'POST',
      encType: 'application/json',
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {children}
    </form>
  );
}

export default function AdminExerciseEdit() {
  const { user, exercise } = useLoaderData<typeof loader>();
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingBlockKey, setEditingBlockKey] = useState<string | null>(null);
  const [showAddBlockForm, setShowAddBlockForm] = useState<string | null>(null);

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link to={$path('/admin/exercises')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exercises
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Exercise</h1>
        <p className="text-gray-600">Manage exercise details and steps</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Exercise Details</CardTitle>
            <CardDescription>Basic exercise information</CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateExerciseForm exerciseName={exercise.name} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercise Steps ({exercise.steps.length})</CardTitle>
            <CardDescription>Manage the steps in this exercise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {exercise.steps.map((step, stepIndex) => {
              const blocks = Array.isArray(step.content?.blocks) ? step.content.blocks : [];
              const isEditing = editingStepId === step.id;

              return (
                <div key={step.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">
                      Step {step.order} ({blocks.length} block{blocks.length !== 1 ? 's' : ''})
                    </h4>
                    <div className="flex gap-2">
                      {!isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setEditingStepId(step.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {stepIndex > 0 && (
                        <StepActionForm stepId={step.id} action="reorderStep" direction="up">
                          <Button type="submit" variant="outline" size="sm">
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                        </StepActionForm>
                      )}
                      {stepIndex < exercise.steps.length - 1 && (
                        <StepActionForm stepId={step.id} action="reorderStep" direction="down">
                          <Button type="submit" variant="outline" size="sm">
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </StepActionForm>
                      )}
                      <StepActionForm stepId={step.id} action="deleteStep">
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            if (!confirm('Are you sure you want to delete this step?')) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </StepActionForm>
                    </div>
                  </div>

                  {isEditing ? (
                    <EditStepForm step={step} onCancel={() => setEditingStepId(null)} />
                  ) : (
                    <div className="space-y-4">
                      {blocks.length > 0 ? (
                        <div className="space-y-4">
                          {blocks.map((block, blockIndex) => {
                            const blockKey = `${step.id}-${blockIndex}`;
                            const isEditingBlock = editingBlockKey === blockKey;

                            return (
                              <div
                                key={`${step.id}-block-${blockIndex}`}
                                className="border border-gray-200 rounded p-3"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <h5 className="font-medium text-sm">Block {blockIndex + 1}</h5>
                                  <div className="flex gap-1">
                                    {!isEditingBlock && (
                                      <Button variant="outline" size="sm" onClick={() => setEditingBlockKey(blockKey)}>
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    )}
                                    {blockIndex > 0 && (
                                      <BlockActionForm
                                        stepId={step.id}
                                        blockIndex={blockIndex}
                                        action="reorderBlock"
                                        direction="up"
                                      >
                                        <Button type="submit" variant="outline" size="sm">
                                          <ArrowUp className="h-3 w-3" />
                                        </Button>
                                      </BlockActionForm>
                                    )}
                                    {blockIndex < blocks.length - 1 && (
                                      <BlockActionForm
                                        stepId={step.id}
                                        blockIndex={blockIndex}
                                        action="reorderBlock"
                                        direction="down"
                                      >
                                        <Button type="submit" variant="outline" size="sm">
                                          <ArrowDown className="h-3 w-3" />
                                        </Button>
                                      </BlockActionForm>
                                    )}
                                    {blocks.length > 1 && (
                                      <BlockActionForm stepId={step.id} blockIndex={blockIndex} action="deleteBlock">
                                        <Button
                                          type="submit"
                                          variant="outline"
                                          size="sm"
                                          onClick={(e) => {
                                            if (!confirm('Are you sure you want to delete this block?')) {
                                              e.preventDefault();
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-3 w-3 text-red-600" />
                                        </Button>
                                      </BlockActionForm>
                                    )}
                                  </div>
                                </div>

                                {isEditingBlock ? (
                                  <EditBlockForm
                                    stepId={step.id}
                                    blockIndex={blockIndex}
                                    block={block}
                                    onCancel={() => setEditingBlockKey(null)}
                                  />
                                ) : (
                                  <div className="space-y-3">
                                    {block?.content && (
                                      <div>
                                        <div className="text-xs font-medium text-gray-600 mb-1">Content</div>
                                        <div className="bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">
                                          {block.content}
                                        </div>
                                      </div>
                                    )}
                                    {block?.ai?.systemPrompt && (
                                      <div>
                                        <div className="text-xs font-medium text-gray-600 mb-1">AI System Prompt</div>
                                        <div className="bg-blue-50 p-2 rounded text-xs whitespace-pre-wrap">
                                          {block.ai.systemPrompt}
                                        </div>
                                      </div>
                                    )}
                                    {block?.ai?.initialUserPrompt && (
                                      <div>
                                        <div className="text-xs font-medium text-gray-600 mb-1">
                                          AI Initial User Prompt
                                        </div>
                                        <div className="bg-green-50 p-2 rounded text-xs whitespace-pre-wrap">
                                          {block.ai.initialUserPrompt}
                                        </div>
                                      </div>
                                    )}
                                    {!(block?.content || block?.ai?.systemPrompt || block?.ai?.initialUserPrompt) && (
                                      <div className="text-gray-400 text-xs italic">
                                        This block has no content. Click Edit to add content.
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          <div className="mt-4 pt-4 border-t border-gray-200">
                            {showAddBlockForm === step.id ? (
                              <div>
                                <div className="flex justify-between items-center mb-3">
                                  <h5 className="font-medium text-sm">Add New Block</h5>
                                  <Button variant="outline" size="sm" onClick={() => setShowAddBlockForm(null)}>
                                    Cancel
                                  </Button>
                                </div>
                                <AddBlockForm stepId={step.id} />
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => setShowAddBlockForm(step.id)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Block
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm italic">
                          This step has no blocks. Use the legacy step editor above or add blocks below.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Step</CardTitle>
              </CardHeader>
              <CardContent>
                <AddStepForm />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
