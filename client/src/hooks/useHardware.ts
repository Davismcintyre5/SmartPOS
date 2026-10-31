import { useContext } from 'react';
import { HardwareContext } from '@/context/HardwareContext';

export function useHardware() {
  const ctx = useContext(HardwareContext);
  if (!ctx) throw new Error('useHardware must be used inside <HardwareProvider>');
  return ctx;
}