import { Sparkles, User as UserIcon } from 'lucide-react';
import { cn } from '@/utils/classNames';
import { formatTime } from '@/utils/format';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

export interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex w-full gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
      ) : null}

      <div className={cn('flex max-w-[75%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-br-md bg-primary text-primary-foreground'
              : 'rounded-bl-md bg-muted text-foreground',
            message.error && 'border border-destructive/30 bg-destructive/10 text-destructive'
          )}
        >
          {message.pending ? (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60 [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current opacity-60" />
            </span>
          ) : (
            message.content
          )}
        </div>
        {!message.pending ? (
          <span className="mt-1 text-[10px] text-muted-foreground">
            {formatTime(message.ts)}
          </span>
        ) : null}
      </div>

      {isUser ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <UserIcon className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}