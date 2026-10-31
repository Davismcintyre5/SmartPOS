const KEY = 'smartpos_device_id';

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    localStorage.setItem(KEY, id);
    return id;
  } catch {
    return 'unknown-device';
  }
}

export function detectClientType(): 'desktop' | 'web' | 'mobile' {
  if (typeof window === 'undefined') return 'web';

  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod|mobile/.test(ua)) return 'mobile';

  const standalone =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    // @ts-expect-error iOS Safari standalone flag
    window.navigator.standalone === true;

  if (standalone) return 'mobile';

  return 'web';
}

export function getDeviceLabel(): string {
  if (typeof navigator === 'undefined') return 'Unknown device';
  const ua = navigator.userAgent;
  if (/iPhone/.test(ua)) return 'iPhone';
  if (/iPad/.test(ua)) return 'iPad';
  if (/Android/.test(ua)) return 'Android device';
  if (/Windows/.test(ua)) return 'Windows PC';
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux PC';
  return 'Browser';
}