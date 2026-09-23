export const LEGAL_TYPES = ['terms', 'privacy', 'dpa', 'refund', 'aup'] as const;

export type LegalType = (typeof LEGAL_TYPES)[number];

export interface LegalCurrentPublic {
  type: LegalType;
  version: number;
  title: string;
  content: string;
  effectiveAt?: string | null;
}