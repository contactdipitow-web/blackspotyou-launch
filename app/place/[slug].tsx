import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GooglePlaceGallery, GooglePlacePhoto, useGooglePlacePreview } from '@/components/GooglePlacePhoto';
import { Button, Loading, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isFavorite, setFavorite } from '@/services/account';
import { getPlace } from '@/services/places';
import { colors, radius, shadow } from '@/theme';
import type { Establishment } from '@/types';

const statusLabel: Record<Establishment['public_status'], string> = {
  unclassified: 'À découvrir · pas encore classé',
  good_spot: 'Bon spot',
  community_recommended: 'Recommandé par la communauté',
  watchlist: 'À surveiller',
  red_flag: 'Red spot',
  under_review: 'En cours de vérification',
  incident_documented: 'Incident documenté',
};

function CoverFallback({ place }: { place: Establishment }) {
  return (
    <View style={styles.coverFallback}>
      <View style={styles.coverOrbOne} /><View style={styles.coverOrbTwo} />
      <Text style={styles.coverLetter}>{place.name.slice(0, 1).toUpperCase()}</Text>
      <Text style={styles.coverFallbackText}>BLACKSPOT YOU · {place.city.toUpperCase()}</Text>
    </View>
  );
}

function GoogleFacts({ place }: { place: Establishment }) {
  const { preview } = useGooglePlacePreview(place, 3);
  if (!preview?.rating && !preview?.priceLevel) return null;
  const price = preview.priceLevel?.replace('PRICE_LEVEL_', '').replace('INEXPENSIVE', '€').replace('MODERATE', '€€').replace('EXPENSIVE', '€€€').replace('VERY_', '');
  return (
    <View style={styles.googleFacts}>
      {preview.rating ? (
        <View style={styles.googleFact}><Text style={styles.googleValue}>★ {preview.rating.toFixed(1)}</Text><Text style={styles.googleLabel}>{preview.userRatingCount ? `${preview.userRatingCount.toLocaleString('fr-FR')} avis Google` : 'Note Google'}</Text></View>
      ) : null}
      {price ? <View style={styles.googleFact}><Text style={styles.googleValue}>{price}</Text><Text style={styles.googleLabel}>Niveau de prix Google</Text></View> : null}
    </View>
  );
}

export default function Detail() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();
  const [place, setPlace] = useState<Establishment | null>(null);
  const [favorite, setFav] = useState(false);
  useEffect(() => { if (slug) void getPlace(slug).then(setPlace); }, [slug]);
  useEffect(() => { if (user && place) void isFavorite(user.id, place.id).then(setFav); }, [user, place]);
  if (!place) return <Loading />;

  const toggle = async () => {
    if (!user) { router.push('/auth'); return; }
    try {
      await setFavorite(user.id, place.id, !favorite);
      setFav(!favorite);
    } catch {
      Alert.alert('Erreur', 'Le favori n’a pas pu être modifié.');
    }
  };
  const address = [place.address_line, place.postal_code, place.city, place.country_code].filter(Boolean).join(', ');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${address}`)}${place.google_place_id ? `&query_place_id=${encodeURIComponent(place.google_place_id)}` : ''}`;
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}${place.google_place_id ? `&destination_place_id=${encodeURIComponent(place.google_place_id)}` : ''}`;
  const open = (url: string) => void Linking.openURL(url);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <GooglePlacePhoto place={place} photoLimit={3} style={styles.cover} fallback={<CoverFallback place={place} />} />
      <View style={styles.hero}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{place.establishment_categories?.label ?? 'Lieu'}</Text>
          <Pressable onPress={() => void toggle()} style={[styles.favorite, favorite && styles.favoriteOn]}>
            <Text style={[styles.favoriteText, favorite && styles.favoriteTextOn]}>{favorite ? '♥ Favori' : '♡ Ajouter'}</Text>
          </Pressable>
        </View>
        <Title>{place.name}</Title>
        <Text style={styles.address}>{address}</Text>
      </View>

      <GoogleFacts place={place} />

      <View style={styles.actionsRow}>
        <Pressable style={styles.action} onPress={() => open(mapsUrl)}><Text style={styles.actionIcon}>⌖</Text><Text style={styles.actionText}>Google Maps</Text></Pressable>
        <Pressable style={styles.action} onPress={() => open(routeUrl)}><Text style={styles.actionIcon}>➜</Text><Text style={styles.actionText}>Itinéraire</Text></Pressable>
        {place.website_url ? <Pressable style={styles.action} onPress={() => open(place.website_url!)}><Text style={styles.actionIcon}>↗</Text><Text style={styles.actionText}>Site web</Text></Pressable> : null}
      </View>

      <GooglePlaceGallery place={place} />

      <View style={styles.card}>
        <Text style={styles.heading}>En bref</Text>
        <Text style={styles.body}>{place.description ?? 'Les informations détaillées seront enrichies par la communauté.'}</Text>
      </View>

      <View style={styles.communityCard}>
        <Text style={styles.communityEyebrow}>STATUT BLACKSPOT YOU</Text>
        <Text style={styles.heading}>{statusLabel[place.public_status]}</Text>
        <Text style={styles.body}>
          {place.public_status === 'unclassified'
            ? 'Ce lieu est référencé, mais aucun verdict communautaire n’est appliqué automatiquement.'
            : 'Ce statut s’appuie sur des informations et contributions modérées.'}
        </Text>
        {place.community_context ? <Text style={styles.context}>{place.community_context}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.heading}>Repères pratiques</Text>
        <View style={styles.fact}><Text style={styles.factLabel}>Adresse</Text><Text style={styles.factValue}>{address}</Text></View>
        {place.phone ? <View style={styles.fact}><Text style={styles.factLabel}>Téléphone</Text><Text style={styles.factValue}>{place.phone}</Text></View> : null}
        {place.website_url ? <View style={styles.fact}><Text style={styles.factLabel}>En ligne</Text><Text style={styles.factValue}>Site officiel disponible</Text></View> : null}
      </View>

      <Button title="Partager mon expérience" onPress={() => user ? router.push({ pathname: '/report/[id]', params: { id: place.id, name: place.name } }) : router.push('/auth')} />
      <Button title="Signaler une information incorrecte" variant="secondary" onPress={() => user ? router.push({ pathname: '/report/[id]', params: { id: place.id, name: place.name } }) : router.push('/auth')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 50, gap: 14 },
  cover: { height: 250, borderRadius: radius.xl, backgroundColor: colors.lilac, overflow: 'hidden', ...shadow },
  coverFallback: { flex: 1, backgroundColor: colors.black, padding: 22, justifyContent: 'space-between', overflow: 'hidden' },
  coverOrbOne: { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: colors.purple, right: -48, top: -74 },
  coverOrbTwo: { position: 'absolute', width: 95, height: 95, borderRadius: 48, backgroundColor: colors.coral, right: 105, bottom: -30 },
  coverLetter: { fontSize: 88, fontWeight: '900', color: colors.white, opacity: .96 },
  coverFallbackText: { color: '#D8B4FE', fontSize: 11, fontWeight: '900', letterSpacing: 1.7 },
  hero: { gap: 7 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  category: { color: colors.purple, fontWeight: '900', textTransform: 'uppercase', fontSize: 11, letterSpacing: .8 },
  favorite: { borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 7 },
  favoriteOn: { backgroundColor: colors.coralSoft, borderColor: '#FFD2CB' },
  favoriteText: { color: colors.purple, fontWeight: '900', fontSize: 11.5 },
  favoriteTextOn: { color: colors.coral },
  address: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  googleFacts: { flexDirection: 'row', gap: 9 },
  googleFact: { flex: 1, borderRadius: radius.md, backgroundColor: colors.sunSoft, padding: 13 },
  googleValue: { color: colors.ink, fontSize: 17, fontWeight: '900' },
  googleLabel: { color: colors.muted, fontSize: 10.5, marginTop: 2 },
  actionsRow: { flexDirection: 'row', gap: 8 },
  action: { flex: 1, minHeight: 72, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', padding: 8, ...shadow },
  actionIcon: { fontSize: 20, color: colors.purple, fontWeight: '900' },
  actionText: { fontSize: 11, color: colors.ink, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  card: { backgroundColor: colors.white, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, gap: 10 },
  communityCard: { backgroundColor: colors.lilac, padding: 18, borderRadius: radius.lg, gap: 8 },
  communityEyebrow: { fontSize: 10.5, color: colors.purple, fontWeight: '900', letterSpacing: 1.4 },
  heading: { fontSize: 18, fontWeight: '900', color: colors.ink },
  body: { color: colors.muted, lineHeight: 22 },
  context: { color: colors.purpleDark, lineHeight: 20, fontSize: 12.5, fontWeight: '700', borderTopWidth: 1, borderTopColor: 'rgba(109,40,217,.15)', paddingTop: 9 },
  fact: { gap: 2, paddingVertical: 3 },
  factLabel: { fontSize: 10.5, color: colors.purple, fontWeight: '900', textTransform: 'uppercase' },
  factValue: { color: colors.ink, fontSize: 14, lineHeight: 20 },
});
