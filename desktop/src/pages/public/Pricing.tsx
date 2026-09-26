import { PricingTable } from '@/components/public/PricingTable';
import { FaqAccordion, DEFAULT_FAQS } from '@/components/public/FaqAccordion';
import { CtaBanner } from '@/components/public/CtaBanner';

export default function Pricing() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Simple, honest pricing
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Start free. Upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mt-12">
          <PricingTable />
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">
            Pricing questions
          </h2>
          <FaqAccordion items={DEFAULT_FAQS.slice(0, 5)} />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}