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

export const DEFAULT_POSTER_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23f4f4f5"/><line x1="0" y1="0" x2="600" y2="600" stroke="%23000" stroke-width="1" stroke-dasharray="4,4"/><line x1="0" y1="600" x2="600" y2="0" stroke="%23000" stroke-width="1" stroke-dasharray="4,4"/><circle cx="300" cy="300" r="140" fill="%23000" fill-opacity="0.05"/><circle cx="300" cy="300" r="80" fill="%23000" fill-opacity="0.1"/><text x="300" y="305" font-family="monospace" font-size="16" font-weight="bold" text-anchor="middle" fill="%23000">3D GAUSSIAN SPLAT</text><text x="300" y="335" font-family="monospace" font-size="11" text-anchor="middle" fill="%23666">RADIANCE CAPTURE</text></svg>`;

export function getSplatPosterUrl(splat: SplatItem): string {
  if (splat.posterUrl) return splat.posterUrl;
  // MOTO v2 snapshot on PlayCanvas S3
  if (splat.supersplatId === '300fa8ae') {
    return 'https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/300fa8ae/v2/xl.webp';
  }
  if (splat.supersplatId && /^[a-zA-Z0-9_-]{6,16}$/.test(splat.supersplatId)) {
    return `https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/${splat.supersplatId}/v1/xl.webp`;
  }
  return DEFAULT_POSTER_SVG;
}

export function extractSupersplatId(input: string): { id: string; url: string; posterUrl?: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Case 1: Raw iframe tag passed
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  const targetUrl = iframeSrcMatch ? iframeSrcMatch[1] : trimmed;

  // Case 2: superspl.at/scene/<id> or superspl.at/view/<id> or superspl.at/s/<id>
  const scenePathMatch = targetUrl.match(/(?:superspl\.at|playcanvas\.com)\/(?:scene|view|s|editor)\/([a-zA-Z0-9_-]{6,32})/i);
  if (scenePathMatch && scenePathMatch[1]) {
    const id = scenePathMatch[1];
    return {
      id,
      url: `https://superspl.at/s?id=${id}`,
      posterUrl: `https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/${id}/v1/xl.webp`,
    };
  }

  // Case 3: standard superspl.at/s?id=XXXXX or superspl.at/view?url=...
  const idMatch = targetUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    const id = idMatch[1];
    return {
      id,
      url: `https://superspl.at/s?id=${id}`,
      posterUrl: `https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/${id}/v1/xl.webp`,
    };
  }

  // Case 4: URL ending with slug or just an alphanumeric ID (e.g. 300fa8ae or superspl.at/300fa8ae)
  const slugMatch = targetUrl.match(/(?:^|\/)([a-zA-Z0-9_-]{6,16})$/);
  if (slugMatch && slugMatch[1] && !slugMatch[1].includes('.')) {
    const id = slugMatch[1];
    return {
      id,
      url: `https://superspl.at/s?id=${id}`,
      posterUrl: `https://s3-eu-west-1.amazonaws.com/images.playcanvas.com/splat/${id}/v1/xl.webp`,
    };
  }

  // Case 5: Any valid http(s) URL
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    const cleaned = targetUrl.replace(/[?&]noui/g, '').replace(/[?&]noanim/g, '');
    const customId = 'custom-' + Math.random().toString(36).substring(2, 8);
    return {
      id: customId,
      url: cleaned,
      posterUrl: DEFAULT_POSTER_SVG,
    };
  }

  return null;
}
