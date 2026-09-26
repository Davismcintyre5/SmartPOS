import { Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'What were my top products this week?',
  'Which items are low on stock?',
  'How much did I sell today?',
  'Who is my best cashier this month?',
];

export interface ChatSuggestionsProps {
  onPick: (text: string) => void;
}

export function ChatSuggestions({ onPick }: ChatSuggestionsProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">How can I help?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask anything about your sales, stock, or customers.
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-lg border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}