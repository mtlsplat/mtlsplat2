export interface SplatItem {
  id: string; // Internal unique identifier or supersplat ID
  supersplatId: string; // The ID for superspl.at (e.g. 300fa8ae)
  title: string;
  description: string;
  url: string; // Full URL https://superspl.at/s?id=...
  posterUrl?: string; // Preview snapshot image
  category: string;
  splatCount?: string;
  captureNotes?: string;
  createdAt: string;
  isUserOriginal?: boolean;
}

export type ViewMode = 'grid' | 'compare' | 'cinema';
