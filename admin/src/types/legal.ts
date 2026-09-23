export type LegalType = 'terms' | 'privacy' | 'dpa' | 'refund' | 'aup';

export interface LegalDoc {
  _id: string;
  type: LegalType;
  version: number;
  title: string;
  content: string;
  contentHash?: string;
  locale: string;
  effectiveAt?: string;
  publishedAt?: string;
  publishedBy?: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}