export type AiType =
  | 'summarize'
  | 'chat'
  | 'forecast'
  | 'anomaly'
  | 'stock'
  | 'public_chat';

export interface AiUsageLog {
  _id: string;
  tenantId?: string;
  type: AiType;
  tokensUsed: number;
  latencyMs: number;
  provider?: string;
  success: boolean;
  error?: string;
  promptPreview?: string;
  createdAt: string;
}

export interface AiUsageSummary {
  since: string;
  totals: {
    calls: number;
    tokens: number;
    avgLatencyMs: number;
  };
  byTenant: Array<{
    _id: string;
    calls: number;
    tokens: number;
  }>;
  byType: Array<{
    _id: AiType;
    calls: number;
    tokens: number;
  }>;
}