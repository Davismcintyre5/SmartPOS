import { FaqAccordion } from '@/components/public/FaqAccordion';
import { CtaBanner } from '@/components/public/CtaBanner';

export default function Faq() {
  return (
    <>
      <section className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Frequently asked questions
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Everything you need to know about SmartPOS.
          </p>
        </div>

        <FaqAccordion />
      </section>

      <CtaBanner />
    </>
  );
}