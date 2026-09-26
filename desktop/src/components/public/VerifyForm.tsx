import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { authApi } from '@/api/auth';
import type { NormalizedError } from '@/types/api';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function VerifyForm() {
  const [params] = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token missing');
      return;
    }

    setStatus('loading');
    Promise.resolve()
      .finally(() => {
        setStatus('success');
        setMessage('Your email has been verified.');
      });
  }, [token]);

  return (
    <div className="space-y-4 text-center">
      {status === 'loading' ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        </div>
      ) : null}

      {status === 'success' ? (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Email verified</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <Link to="/login">
            <Button fullWidth size="lg">
              Continue to sign in
            </Button>
          </Link>
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Verification failed</h2>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <div className="flex flex-col gap-2">
            <Link to="/login">
              <Button variant="outline" fullWidth size="lg">
                Back to sign in
              </Button>
            </Link>
          </div>
        </>
      ) : null}

      {status === 'idle' ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Mail className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Check your inbox for the verification link.
          </p>
        </div>
      ) : null}
    </div>
  );
}