import { Mail, Phone, MapPin } from 'lucide-react';
import { ContactForm } from '@/components/public/ContactForm';
import { useSite } from '@/hooks/useSite';

export default function Contact() {
  const { settings } = useSite();

  const supportEmail = settings?.supportEmail ?? 'support@smartpos.co.ke';
  const supportPhone = settings?.supportPhone ?? '+254 700 000 000';

  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Get in touch
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          We typically respond within 24 hours.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        <div className="space-y-6 md:col-span-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <a
                href={`mailto:${supportEmail}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {supportEmail}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Phone</p>
              <a
                href={`tel:${supportPhone.replace(/\s/g, '')}`}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {supportPhone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Office</p>
              <p className="text-sm text-muted-foreground">
                Nairobi, Kenya
              </p>
            </div>
          </div>
        </div>

        <div className="md:col-span-3">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}