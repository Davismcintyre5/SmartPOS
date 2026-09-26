import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { legalApi } from '@/api/legal';
import { Link } from 'react-router-dom';
import type { LegalType } from '@/types/legal';

const VALID: LegalType[] = ['terms', 'privacy', 'dpa', 'refund', 'aup'];

export default function Legal() {
  const { type } = useParams<{ type: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!type || !VALID.includes(type as LegalType)) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    legalApi
      .getCurrent(type as LegalType)
      .then((doc) => {
        setTitle(doc.title);
        setContent(doc.content);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [type]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo size={28} />
        </Link>
        <Link to="/">
          <Button variant="ghost" size="sm">
            Back to home
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
          <h1 className="text-lg font-semibold text-foreground">Document unavailable</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            This legal document could not be loaded or does not exist.
          </p>
        </div>
      ) : (
        <>
          <h1 className="mb-6 text-2xl font-bold text-foreground">{title}</h1>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {content}
          </div>
        </>
      )}
    </div>
  );
}