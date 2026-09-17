import { useEffect, useState, type ReactNode } from 'react';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { getGooglePlacePreview, type GooglePlacePreview } from '@/services/googlePlaces';
import { colors } from '@/theme';
import type { Establishment } from '@/types';

type PlacePhotoTarget = Pick<
  Establishment,
  | 'id'
  | 'name'
  | 'address_line'
  | 'postal_code'
  | 'city'
  | 'latitude'
  | 'longitude'
  | 'google_place_id'
  | 'cover_image_path'
>;

export function useGooglePlacePreview(place: PlacePhotoTarget, photoLimit = 1) {
  const [preview, setPreview] = useState<GooglePlacePreview | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    void getGooglePlacePreview(place, photoLimit).then((next) => {
      if (active) setPreview(next);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [place.id, photoLimit]);
  return { preview, loading };
}

export function GooglePlacePhoto({
  place,
  style,
  fallback,
  showAttribution = true,
  photoLimit = 1,
}: {
  place: PlacePhotoTarget;
  style?: StyleProp<ViewStyle>;
  fallback?: ReactNode;
  showAttribution?: boolean;
  photoLimit?: number;
}) {
  const { preview } = useGooglePlacePreview(place, photoLimit);
  const photo = preview?.photos[0];
  const ownImage = place.cover_image_path?.startsWith('http') ? place.cover_image_path : null;
  const uri = photo?.uri ?? ownImage;

  if (!uri) return <View style={style}>{fallback}</View>;

  const attribution = photo
    ? `Photo Google Maps${photo.authorName ? ` · ${photo.authorName}` : ''}`
    : 'Photo BLACKSPOT YOU';
  return (
    <View style={[styles.frame, style]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {showAttribution ? (
        <Pressable
          disabled={!photo?.authorUri}
          onPress={() => photo?.authorUri && void Linking.openURL(photo.authorUri)}
          style={styles.attribution}
        >
          <Text numberOfLines={1} style={styles.attributionText}>{attribution}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function GooglePlaceGallery({ place }: { place: PlacePhotoTarget }) {
  const { preview, loading } = useGooglePlacePreview(place, 3);
  if (loading || !preview?.photos.length) return null;
  return (
    <View style={styles.galleryWrap}>
      <Text style={styles.galleryTitle}>Photos Google Maps</Text>
      <View style={styles.gallery}>
        {preview.photos.map((photo, index) => (
          <View key={photo.uri} style={[styles.galleryPhoto, index === 0 && styles.galleryPhotoMain]}>
            <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <Pressable
              disabled={!photo.authorUri}
              onPress={() => photo.authorUri && void Linking.openURL(photo.authorUri)}
              style={styles.galleryCredit}
            >
              <Text numberOfLines={1} style={styles.galleryCreditText}>
                Google Maps{photo.authorName ? ` · ${photo.authorName}` : ''}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: colors.black },
  attribution: {
    position: 'absolute', left: 8, bottom: 7, maxWidth: '88%',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: 'rgba(15,13,18,.76)',
  },
  attributionText: { color: colors.white, fontSize: 8.5, fontWeight: '700' },
  galleryWrap: { gap: 9 },
  galleryTitle: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  galleryPhoto: {
    width: '48.5%', height: 124, borderRadius: 16, overflow: 'hidden',
    backgroundColor: colors.lilac,
  },
  galleryPhotoMain: { width: '100%', height: 210 },
  galleryCredit: {
    position: 'absolute', left: 7, right: 7, bottom: 7,
    borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4,
    backgroundColor: 'rgba(15,13,18,.74)',
  },
  galleryCreditText: { color: colors.white, fontSize: 8.5, fontWeight: '700' },
});
