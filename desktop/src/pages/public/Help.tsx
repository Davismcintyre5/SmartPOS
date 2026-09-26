import { Link } from 'react-router-dom';
import { BookOpen, MessageCircle, Mail, Video, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const TOPICS = [
  {
    icon: BookOpen,
    title: 'Getting started',
    description: 'Set up your store, add products, and make your first sale.',
    href: '/help/getting-started',
  },
  {
    icon: Video,
    title: 'Video tutorials',
    description: 'Short walkthroughs for every major feature.',
    href: '/help/videos',
  },
  {
    icon: MessageCircle,
    title: 'Live chat',
    description: 'Chat with our team during business hours.',
    href: '/contact',
  },
  {
    icon: Mail,
    title: 'Email support',
    description: 'Send us an email and we\'ll respond within 24 hours.',
    href: '/contact',
  },
];

export default function Help() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Help center
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Find answers, guides, and support.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {TOPICS.map(({ icon: Icon, title, description, href }) => (
          <Link
            key={title}
            to={href}
            className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-muted/30 p-6 text-center">
        <h3 className="text-base font-semibold text-foreground">
          Still need help?
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Our team is here for you.
        </p>
        <Link to="/contact" className="mt-4 inline-block">
          <Button>Contact support</Button>
        </Link>
      </div>
    </section>
  );
}