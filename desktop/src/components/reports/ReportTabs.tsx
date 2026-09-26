import type { ComponentType } from 'react';
import { cn } from '@/utils/classNames';
import type { UserRole } from '@/types/auth';

export interface ReportTabDef {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  roles: UserRole[];
}

export interface ReportTabsProps {
  tabs: ReportTabDef[];
  activeTab: string;
  onChange: (key: string) => void;
}

export function ReportTabs({ tabs, activeTab, onChange }: ReportTabsProps) {
  return (
    <nav className="flex flex-shrink-0 gap-1 overflow-x-auto pb-2 lg:w-56 lg:flex-col lg:pb-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}