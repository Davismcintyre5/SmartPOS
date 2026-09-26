import { Lock } from 'lucide-react';
import { ChatPanel } from '@/components/app/ChatPanel';
import { useClient } from '@/hooks/useClient';

export default function Chat() {
  const { aiFeatures } = useClient();

  if (!aiFeatures.clientAi) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">
            AI Assistant Disabled
          </p>
          <p className="text-xs text-muted-foreground">
            Your administrator has disabled the AI assistant.
          </p>
        </div>
      </div>
    );
  }

  return <ChatPanel />;
}