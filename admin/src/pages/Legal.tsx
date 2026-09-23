import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { legalApi } from '@/api/legal';
import type { LegalDoc, LegalType } from '@/types/legal';
import { formatDate } from '@/utils/date';
import { ROUTES, LEGAL_TYPES } from '@/utils/constants';

export default function Legal() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<Record<string, LegalDoc[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    legalApi
      .list()
      .then((res) => setDocs(res as Record<string, LegalDoc[]>))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Legal documents</h1>
        <p className="text-sm text-slate-500 mt-1">Versioned policies. Published versions are immutable.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEGAL_TYPES.map((type) => {
          const versions = docs[type] || [];
          const current = versions.find((v) => v.isCurrent);
          return (
            <Card key={type} title={type.toUpperCase()}>
              <div className="space-y-3">
                {current ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="success" dot>Published</Badge>
                      <span className="text-xs text-slate-500">v{current.version}</span>
                    </div>
                    <p className="text-sm text-slate-600">{current.title}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Effective {current.effectiveAt ? formatDate(current.effectiveAt) : '—'}
                    </p>
                  </div>
                ) : (
                  <div>
                    <Badge variant="neutral">Not published</Badge>
                    <p className="text-xs text-slate-500 mt-2">No current version</p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<FileText size={14} />}
                    onClick={() => navigate(ROUTES.legalEditor(type))}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    icon={<Plus size={14} />}
                    onClick={() => navigate(ROUTES.legalEditor(type))}
                  >
                    New version
                  </Button>
                </div>

                {versions.length > 1 && (
                  <p className="text-xs text-slate-400 pt-2">
                    {versions.length} versions on file
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}