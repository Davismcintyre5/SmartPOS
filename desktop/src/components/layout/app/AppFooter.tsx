import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const YEAR = new Date().getFullYear();

export function AppFooter() {
  const { tenant, plan } = useAuth();

  return (
    <footer className="border-t border-border bg-card px-4 py-3">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span>© {YEAR} SmartPOS</span>
          {tenant?.name ? (
            <>
              <span className="text-border">·</span>
              <span className="truncate">{tenant.name}</span>
            </>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          {plan?.name ? (
            <span className="capitalize">
              Plan: <span className="text-foreground">{plan.name}</span>
            </span>
          ) : null}
          <Link to="/legal/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/legal/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}