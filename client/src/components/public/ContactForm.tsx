import { useState, type FormEvent } from 'react';
import { Mail, User, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { useToast } from '@/hooks/useNotification';

export function ContactForm() {
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSending(true);

    // Placeholder — replace with real endpoint when ready.
    await new Promise((r) => setTimeout(r, 800));

    toast.success({
      title: 'Message sent',
      description: "We'll get back to you within 24 hours.",
    });

    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setSending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Your name" htmlFor="name" required>
          <Input
            id="name"
            placeholder="Jane Doe"
            leftIcon={<User className="h-4 w-4" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={sending}
          />
        </FormField>

        <FormField label="Email" htmlFor="email" required>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
          />
        </FormField>
      </div>

      <FormField label="Subject" htmlFor="subject">
        <Input
          id="subject"
          placeholder="How can we help?"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={sending}
        />
      </FormField>

      <FormField label="Message" htmlFor="message" required>
        <Textarea
          id="message"
          rows={6}
          placeholder="Tell us what's on your mind…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={sending}
        />
      </FormField>

      <Button type="submit" fullWidth size="lg" loading={sending}>
        Send message
      </Button>
    </form>
  );
}