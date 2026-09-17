import type { Establishment } from '@/types';
import { supabase } from '@/lib/supabase';

export type GooglePhoto = {
  uri: string;
  authorName?: string;
  authorUri?: string;
};

export type GooglePlacePreview = {
  placeId: string;
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  photos: GooglePhoto[];
};

type PlaceTarget = Pick<Establishment, 'id'>;

const previewCache = new Map<string, Promise<GooglePlacePreview | null>>();
async function loadPreview(target: PlaceTarget, photoLimit: number): Promise<GooglePlacePreview | null> {
  try {
    const { data, error } = await supabase.functions.invoke<GooglePlacePreview>('google-place-preview', {
      body: { establishmentId: target.id, photoLimit },
    });
    if (error || !data?.placeId) return null;
    return data;
  } catch (error) {
    console.info('BLACKSPOT_GOOGLE_PLACE_PREVIEW_UNAVAILABLE', error);
    return null;
  }
}

export function getGooglePlacePreview(target: PlaceTarget, requestedPhotoLimit = 1) {
  const photoLimit = Math.max(1, Math.min(3, Math.floor(requestedPhotoLimit)));
  const key = `${target.id}:${photoLimit}`;
  const existing = previewCache.get(key);
  if (existing) return existing;
  const request = loadPreview(target, photoLimit);
  previewCache.set(key, request);
  return request;
}
