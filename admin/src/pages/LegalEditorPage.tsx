import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { legalApi } from '@/api/legal';
import type { LegalType } from '@/types/legal';

export default function LegalEditorPage() {
  const { type = 'terms' } = useParams<{ type: LegalType }>();
  const navigate = useNavigate();
  const { toast } = useNotifications();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    legalApi
      .getCurrent(type as LegalType)
      .then((doc) => {
        setTitle(doc.title);
        setContent(doc.content);
      })
      .catch(() => {
        setTitle(type.charAt(0).toUpperCase() + type.slice(1));
      })
      .finally(() => setLoading(false));
  }, [type]);

  const save = async () => {
    if (!content.trim()) {
      toast({ type: 'error', message: 'Content is required' });
      return;
    }
    setSaving(true);
    try {
      await legalApi.publish(type as LegalType, { title, content });
      toast({ type: 'success', message: 'New version published' });
      navigate('/legal');
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate('/legal')}>
          Back
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {type.toUpperCase()} — New version
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publishing creates a new immutable version. The previous version is archived.
          </p>
        </div>
        <Button icon={<Save size={16} />} onClick={save} loading={saving}>
          Publish
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <FormField label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Content (Markdown)">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="font-mono text-sm"
            />
          </FormField>
        </div>
      </Card>
    </div>
  );
}