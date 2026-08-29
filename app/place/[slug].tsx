import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Loading, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isFavorite, setFavorite } from '@/services/account';
import { getPlace } from '@/services/places';
import { colors, radius } from '@/theme';
import type { Establishment } from '@/types';

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

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.category}>{place.establishment_categories?.label ?? 'Lieu'}</Text>
        <Title>{place.name}</Title>
        <Text style={styles.address}>{address}</Text>
      </View>
      <Button title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} variant="secondary" onPress={() => void toggle()} />
      <View style={styles.card}>
        <Text style={styles.heading}>À propos</Text>
        <Text style={styles.body}>{place.description ?? 'Les informations détaillées seront enrichies par la communauté.'}</Text>
        {place.community_context && <Text style={styles.body}>{place.community_context}</Text>}
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Statut communautaire</Text>
        <Text style={styles.body}>{place.public_status === 'unclassified' ? 'Non classé — aucun verdict automatique.' : place.public_status.replaceAll('_', ' ')}</Text>
      </View>
      <Button title="Itinéraire" onPress={() => void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&destination_place_id=${place.google_place_id ?? ''}`)} />
      <Button title="Signaler une information incorrecte" variant="secondary" onPress={() => user ? router.push({ pathname: '/report/[id]', params: { id: place.id, name: place.name } }) : router.push('/auth')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 50, gap: 12 },
  hero: { gap: 10 },
  category: { color: colors.purple, fontWeight: '800', marginTop: 8 },
  address: { color: colors.muted, fontSize: 16 },
  card: { backgroundColor: colors.white, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, gap: 8 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.ink },
  body: { color: colors.muted, lineHeight: 23 },
});
