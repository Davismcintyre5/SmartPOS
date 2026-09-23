import { Link, useNavigate } from 'react-router-dom';
import { SearchX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center gap-5 px-4 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <SearchX className="h-8 w-8" />
      </div>

      <div className="space-y-1.5">
        <p className="text-5xl font-bold text-primary">404</p>
        <h1 className="text-xl font-semibold text-foreground">
          Page not found
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, or has been
          moved to a different section.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Go back
        </Button>
        <Link to="/app">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}