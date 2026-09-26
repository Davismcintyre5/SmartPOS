import { useContext } from 'react';
import { ClientContext } from '@/context/ClientContext';

export function useClient() {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClient must be used inside <ClientProvider>');
  return ctx;
}