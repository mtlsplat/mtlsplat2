import { SplatItem } from '../types/splat';

export const DEFAULT_SPLATS: SplatItem[] = [
  {
    id: 'splat-300fa8ae',
    supersplatId: '300fa8ae',
    title: 'Gaussian Splat Scene 01',
    description: 'High-fidelity 3D radiance field capture featuring intricate geometry, realistic lighting reflections, and 6-DoF volumetric presence.',
    url: 'https://superspl.at/s?id=300fa8ae',
    category: 'Spatial Capture',
    splatCount: '~1.4M splats',
    captureNotes: 'Optimized radiance field, XR-spatial tracking enabled',
    createdAt: '2026-03-12',
    isUserOriginal: true,
  },
  {
    id: 'splat-374399b7',
    supersplatId: '374399b7',
    title: 'Gaussian Splat Scene 02',
    description: 'Detailed point-cloud and Gaussian ellipsoids reconstruction with accurate spatial depth and view-dependent radiance.',
    url: 'https://superspl.at/s?id=374399b7',
    category: 'Environment',
    splatCount: '~980K splats',
    captureNotes: 'Real-time WebGL rendering via SuperSplat engine',
    createdAt: '2026-03-20',
    isUserOriginal: true,
  },
];

export function extractSupersplatId(input: string): { id: string; url: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Case 1: Raw iframe tag passed
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

  // Case 2: standard superspl.at/s?id=XXXXX or superspl.at/view?url=...
  const idMatch = targetUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    const id = idMatch[1];
    return {
      id,
      url: `https://superspl.at/s?id=${id}`,
    };
  }

  // Case 3: URL ending with slug or just an alphanumeric ID (e.g. 300fa8ae)
  if (/^[a-zA-Z0-9_-]{6,16}$/.test(targetUrl)) {
    return {
      id: targetUrl,
      url: `https://superspl.at/s?id=${targetUrl}`,
    };
  }

  // Case 4: Any valid http(s) URL
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return {
      id: 'custom-' + Math.random().toString(36).substring(2, 8),
      url: targetUrl,
    };
  }

  return null;
}
