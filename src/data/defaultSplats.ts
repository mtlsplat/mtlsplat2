import { SplatItem } from '../types/splat';

export const DEFAULT_SPLATS: SplatItem[] = [
  {
    id: 'splat-300fa8ae',
    supersplatId: '300fa8ae',
    title: 'MOTO',
    description: 'Detailed 3D Gaussian Splat reconstruction of a motorcycle, capturing metallic frame reflections, engine block mechanics, handlebars, wheels, and surrounding ground surface with real-time volumetric radiance.',
    url: 'https://superspl.at/s?id=300fa8ae',
    posterUrl: 'https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/300fa8ae/v2/xl.webp',
    category: 'Motorcycle',
    splatCount: '~1.87M splats (Haute densité)',
    captureNotes: '1.87M radiance field (sans LOD), XR-spatial tracking enabled',
    createdAt: '2026-03-12',
    isUserOriginal: true,
  },
  {
    id: 'splat-374399b7',
    supersplatId: '374399b7',
    title: 'MTB',
    description: 'High-resolution mountain bike (MTB) spatial reconstruction showcasing front suspension forks, frame geometry, knobby tread tires, drivetrain components, and natural outdoor depth in full 6-DoF.',
    url: 'https://superspl.at/s?id=374399b7',
    posterUrl: 'https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/374399b7/v1/xl.webp',
    category: 'Mountain Bike',
    splatCount: '~980K splats (Streaming LOD)',
    captureNotes: 'Optimisé PlayCanvas LOD temps réel',
    createdAt: '2026-03-20',
    isUserOriginal: true,
  },
];

export function getSplatPosterUrl(splat: SplatItem): string {
  if (splat.posterUrl) return splat.posterUrl;
  // MOTO v2 snapshot on PlayCanvas S3
  if (splat.supersplatId === '300fa8ae') {
    return 'https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/300fa8ae/v2/xl.webp';
  }
  return `https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/${splat.supersplatId}/v1/xl.webp`;
}

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
    const cleaned = targetUrl.replace(/[?&]noui/g, '').replace(/[?&]noanim/g, '');
    return {
      id: 'custom-' + Math.random().toString(36).substring(2, 8),
      url: cleaned,
    };
  }

  return null;
}
