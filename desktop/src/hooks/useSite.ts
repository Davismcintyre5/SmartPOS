import { useContext } from 'react';
import { SiteContext } from '@/context/SiteContext';

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}