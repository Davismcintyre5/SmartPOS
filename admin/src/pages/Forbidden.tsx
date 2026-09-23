import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <ShieldAlert size={48} className="text-slate-300 mb-4" />
      <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        You don't have permission to view this page.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
}