import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Forbidden() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldOff className="h-8 w-8" />
      </div>

      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          You don&apos;t have permission to view this page. If you think this is
          a mistake, contact your account owner.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link to="/app">
          <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to dashboard
          </Button>
        </Link>
      </div>

      <p className="max-w-sm text-xs text-muted-foreground">
        Your role is{' '}
        <span className="font-medium text-foreground">restricted</span>. Some
        pages are only available to owners and managers.
      </p>
    </div>
  );
}