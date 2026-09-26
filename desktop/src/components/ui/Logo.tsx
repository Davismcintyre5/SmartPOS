import { cn } from '@/utils/classNames';

type LogoVariant = 'full' | 'mark' | 'word';

export interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

const BLUE = '#1e3a8a';
const YELLOW = '#facc15';

export function Logo({
  variant = 'full',
  className,
  size = 32,
  showWordmark = true,
}: LogoProps) {
  const tileSize = size;
  const markOnly = variant === 'mark' || (variant === 'full' && !showWordmark);

  if (variant === 'word') {
    return (
      <span
        className={cn('font-sans font-bold tracking-tight', className)}
        style={{ fontSize: size * 0.75, lineHeight: 1 }}
      >
        SmartPOS
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={tileSize}
        height={tileSize}
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="64" height="64" rx="16" fill={BLUE} />
        <path
          d="M20 22h5l3 18h18l2.5-12H28"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="40" y="26" width="11" height="9" rx="2" fill={YELLOW} />
        <circle cx="30" cy="46" r="3" fill="#ffffff" />
        <circle cx="43" cy="46" r="3" fill="#ffffff" />
      </svg>

      {!markOnly ? (
        <span
          className="font-sans font-bold leading-none tracking-tight text-foreground"
          style={{ fontSize: tileSize * 0.6 }}
        >
          SmartPOS
        </span>
      ) : null}
    </span>
  );
}

export default Logo;