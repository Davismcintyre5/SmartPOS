import { Construction } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export interface ComingSoonProps {
  title?: string;
  description?: string;
}

export function ComingSoon({
  title = 'Coming soon',
  description = 'This page is under construction. Check back shortly.',
}: ComingSoonProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16">
      <EmptyState
        icon={<Construction className="h-6 w-6" />}
        title={title}
        description={description}
        action={
          <Link to="/app">
            <Button variant="outline" size="sm">
              Back to dashboard
            </Button>
          </Link>
        }
      />
    </div>
  );
}