import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CtaBanner() {
  return (
    <section className="border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ready to get started?
        </h2>
        <p className="max-w-xl text-base text-muted-foreground">
          Join hundreds of businesses using SmartPOS to sell faster and stay organized.
          Free for 14 days, no credit card required.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/register">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start free trial
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline">
              Talk to sales
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}