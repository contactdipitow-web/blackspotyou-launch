import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GooglePlacePhoto } from '@/components/GooglePlacePhoto';
import type { Establishment } from '@/types';
import { colors, radius, shadow } from '@/theme';

const statusLabel: Record<Establishment['public_status'], string> = {
  unclassified: 'À découvrir',
  good_spot: 'Bon spot',
  watchlist: 'À surveiller',
  red_flag: 'Red spot',
  community_recommended: 'Recommandé',
  under_review: 'En vérification',
  incident_documented: 'Incident documenté',
};

function PhotoFallback({ place }: { place: Establishment }) {
  return (
    <View style={s.art}>
      <View style={s.artOrbPurple} />
      <View style={s.artOrbCoral} />
      <View style={s.artOrbSun} />
      <Text style={s.artLetter}>{place.name.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}

export function PlaceCard({ place, compact = false }: { place: Establishment; compact?: boolean }) {
  const status = statusLabel[place.public_status] ?? 'Lieu';
  return (
    <Link href={{ pathname: '/place/[slug]', params: { slug: place.slug } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Voir ${place.name}`}
        style={({ pressed }) => [s.card, compact && s.compact, pressed && s.pressed]}
      >
        <View style={s.mediaWrap}>
          <GooglePlacePhoto
            place={place}
            style={[s.media, compact && s.mediaCompact]}
            fallback={<PhotoFallback place={place} />}
          />
          <View style={s.categoryPill}>
            <Text style={s.categoryPillText}>{place.establishment_categories?.label ?? 'Spot'}</Text>
          </View>
        </View>
        <View style={s.body}>
          <View style={s.badges}>
            <Text style={s.status}>{status}</Text>
            <Text style={s.arrow}>→</Text>
          </View>
          <Text numberOfLines={1} style={s.name}>{place.name}</Text>
          <Text numberOfLines={1} style={s.city}>
            {[place.address_line, place.postal_code, place.city].filter(Boolean).join(' · ')}
          </Text>
          {!compact ? (
            <Text numberOfLines={2} style={s.desc}>
              {place.description ?? place.community_context ?? 'Découvrez les informations documentées par la communauté.'}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </Link>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow,
  },
  compact: { width: 276, marginRight: 12 },
  pressed: { opacity: .86, transform: [{ scale: .99 }] },
  mediaWrap: { position: 'relative' },
  media: { height: 166 },
  mediaCompact: { height: 152 },
  art: { flex: 1, backgroundColor: colors.black, overflow: 'hidden', justifyContent: 'center', paddingHorizontal: 20 },
  artOrbPurple: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: colors.purple, right: -38, top: -80, opacity: .9 },
  artOrbCoral: { position: 'absolute', width: 96, height: 96, borderRadius: 48, backgroundColor: colors.coral, right: 65, bottom: -50, opacity: .9 },
  artOrbSun: { position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: colors.sun, left: 70, top: 18 },
  artLetter: { color: colors.white, fontSize: 68, fontWeight: '900' },
  categoryPill: { position: 'absolute', right: 10, top: 10, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,.93)' },
  categoryPillText: { color: colors.purpleDark, fontWeight: '900', fontSize: 10, textTransform: 'uppercase', letterSpacing: .6 },
  body: { padding: 15, gap: 6 },
  badges: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  status: { fontSize: 10, fontWeight: '900', color: colors.purple, textTransform: 'uppercase', letterSpacing: .7 },
  arrow: { color: colors.purple, fontSize: 17, fontWeight: '900' },
  name: { fontSize: 20, fontWeight: '900', color: colors.ink },
  city: { color: colors.muted, fontWeight: '600', fontSize: 12.5 },
  desc: { color: colors.muted, lineHeight: 19, fontSize: 13 },
});
