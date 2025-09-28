import { zodResolver } from '@hookform/resolvers/zod';
import Handlebars from 'handlebars';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { data, useFetcher, useLoaderData } from 'react-router';
import type { ActionSchema } from '~/schemas/action';
import AdminLayout from '../components/AdminLayout';
import SystemPromptEditor from '../components/SystemPromptEditor';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { requireAdmin } from '../lib/auth';
import { prisma } from '../lib/db';
import { type AdminSettingsAction, adminSettingsActionSchema } from '../schemas/admin/settings';

export async function loader({ request }: { request: Request }) {
  const user = await requireAdmin(request);

  let systemSettings = await prisma.systemSettings.findUnique({
    where: { key: 'systemPromptTemplate' },
  });

  if (!systemSettings) {
    systemSettings = await prisma.systemSettings.create({
      data: { key: 'systemPromptTemplate' },
    });
  }

  return { user, systemSettings };
}

export async function action({ request }: { request: Request }) {
  await requireAdmin(request);

  try {
    const json = await request.json();
    const parsed = adminSettingsActionSchema.parse(json);

    if (parsed.action === 'updateSystemPrompt') {
      await prisma.systemSettings.upsert({
        where: { key: 'systemPromptTemplate' },
        update: { stringValue: parsed.systemPromptTemplate },
        create: {
          key: 'systemPromptTemplate',
          stringValue: parsed.systemPromptTemplate,
        },
      });

      return data({ success: 'System prompt updated successfully!' } satisfies ActionSchema, { status: 200 });
    }

    return data({ error: 'Invalid action' } satisfies ActionSchema, { status: 400 });
  } catch {
    return data({ error: 'Failed to process request' } satisfies ActionSchema, { status: 400 });
  }
}

function UpdateSystemPromptForm({ currentTemplate }: { currentTemplate: string }) {
  const fetcher = useFetcher<ActionSchema>();
  const [showPreview, setShowPreview] = useState(false);
  const [previewOutput, setPreviewOutput] = useState('');

  const form = useForm<AdminSettingsAction>({
    resolver: zodResolver(adminSettingsActionSchema),
    defaultValues: {
      action: 'updateSystemPrompt',
      systemPromptTemplate: currentTemplate,
    },
  });

  const onSubmit = (formData: AdminSettingsAction) => {
    fetcher.submit(formData, {
      method: 'POST',
      encType: 'application/json',
    });
  };

  const handlePreview = () => {
    const template = form.getValues('systemPromptTemplate');
    try {
      const compiled = Handlebars.compile(template);
      const sampleData = {
        bio: 'I am a software developer passionate about AI and machine learning.',
        urls: 'https://github.com/johndoe, https://linkedin.com/in/johndoe',
      };
      setPreviewOutput(compiled(sampleData));
      setShowPreview(true);
    } catch (error) {
      setPreviewOutput(`Error: ${error instanceof Error ? error.message : 'Invalid template'}`);
      setShowPreview(true);
    }
  };

  return (
    <Form {...form}>
      <fetcher.Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="action"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="systemPromptTemplate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt Template</FormLabel>
              <FormControl>
                <SystemPromptEditor value={field.value} onChange={field.onChange} onPreview={handlePreview} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview with Sample Data</CardTitle>
              <CardDescription>This shows how your template will look with sample user data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">{previewOutput}</pre>
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setShowPreview(false)}>
                Hide Preview
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={fetcher.state === 'submitting'}>
            <Save className="h-4 w-4 mr-2" />
            {fetcher.state === 'submitting' ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {fetcher.data?.success && <div className="text-green-600 text-sm">{fetcher.data.success}</div>}
        {fetcher.data?.error && <div className="text-red-600 text-sm">{fetcher.data.error}</div>}
      </fetcher.Form>
    </Form>
  );
}

export default function AdminSettings() {
  const { user, systemSettings } = useLoaderData<typeof loader>();

  return (
    <AdminLayout user={user}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Configure application-wide settings</p>
      </div>

      <div className="space-y-6">
        <UpdateSystemPromptForm currentTemplate={systemSettings.stringValue || ''} />
      </div>
    </AdminLayout>
  );
}
