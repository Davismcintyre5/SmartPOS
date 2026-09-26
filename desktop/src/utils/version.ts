export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string | null;
  raw: string;
}

export function parseVersion(input: string): ParsedVersion {
  const raw = String(input || '').trim().replace(/^v/i, '');
  const [main, pre] = raw.split('-');
  const parts = main.split('.').map((p) => parseInt(p, 10) || 0);

  return {
    major: parts[0] ?? 0,
    minor: parts[1] ?? 0,
    patch: parts[2] ?? 0,
    prerelease: pre || null,
    raw,
  };
}

export function compareVersions(a: string, b: string): number {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  if (va.major !== vb.major) return va.major > vb.major ? 1 : -1;
  if (va.minor !== vb.minor) return va.minor > vb.minor ? 1 : -1;
  if (va.patch !== vb.patch) return va.patch > vb.patch ? 1 : -1;

  if (va.prerelease && !vb.prerelease) return -1;
  if (!va.prerelease && vb.prerelease) return 1;

  if (va.prerelease && vb.prerelease) {
    const pa = va.prerelease.split('.');
    const pb = vb.prerelease.split('.');
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const sa = pa[i] ?? '';
      const sb = pb[i] ?? '';
      const na = parseInt(sa, 10);
      const nb = parseInt(sb, 10);

      if (!isNaN(na) && !isNaN(nb)) {
        if (na !== nb) return na > nb ? 1 : -1;
      } else {
        if (sa !== sb) return sa > sb ? 1 : -1;
      }
    }
  }

  return 0;
}

export function isNewerVersion(candidate: string, current: string): boolean {
  return compareVersions(candidate, current) > 0;
}

export function isSameVersion(a: string, b: string): boolean {
  return compareVersions(a, b) === 0;
}

export function formatVersion(input: string, includeV = true): string {
  const v = parseVersion(input);
  const base = `${v.major}.${v.minor}.${v.patch}`;
  const pre = v.prerelease ? `-${v.prerelease.split('.')[0]}` : '';
  return `${includeV ? 'v' : ''}${base}${pre}`;
}

export type VersionDelta = 'major' | 'minor' | 'patch' | 'prerelease' | 'same';

export function versionDelta(from: string, to: string): VersionDelta {
  const a = parseVersion(from);
  const b = parseVersion(to);

  if (a.major !== b.major) return 'major';
  if (a.minor !== b.minor) return 'minor';
  if (a.patch !== b.patch) return 'patch';
  if (a.prerelease !== b.prerelease) return 'prerelease';
  return 'same';
}