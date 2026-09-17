import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '@/components/BrandHeader';
import { PlaceCard } from '@/components/PlaceCard';
import { Eyebrow, Loading, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { listEditorialSelection, listPlaces } from '@/services/places';
import { colors, radius, shadow } from '@/theme';
import type { Establishment } from '@/types';

export default function Home() {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEditorialSelection('Time Out Paris')
      .then(async (selection) => setPlaces(selection.length ? selection : await listPlaces({ limit: 7 })))
      .catch(() => listPlaces({ limit: 7 }).then(setPlaces))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <View style={s.topRow}>
        <BrandHeader />
        <Pressable accessibilityLabel="Ouvrir mon espace" onPress={() => router.push('/(tabs)/profile')} style={s.profileButton}>
          <Text style={s.profileGlyph}>{user ? '●' : '○'}</Text>
        </Pressable>
      </View>

      <View style={s.hero}>
        <View style={s.heroOrbOne} /><View style={s.heroOrbTwo} /><View style={s.heroOrbThree} />
        <View style={s.heroContent}>
          <Eyebrow inverse>PARIS · PAR NOUS, POUR NOUS</Eyebrow>
          <Title inverse>Trouvez votre prochain spot.</Title>
          <Text style={s.heroCopy}>Une recherche, des repères clairs, puis à vous de choisir.</Text>
          <Pressable onPress={() => router.push('/(tabs)/explore')} style={s.searchBar}>
            <Text style={s.searchIcon}>⌕</Text>
            <Text style={s.searchText}>Un restaurant, un bar, un quartier…</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.actionRow}>
        <Pressable onPress={() => router.push('/(tabs)/map')} style={[s.actionCard, s.nearbyCard]}>
          <Text style={s.actionIcon}>◎</Text>
          <Text style={s.actionTitle}>Autour de moi</Text>
          <Text style={s.actionCopy}>100 m à 2 km</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(tabs)/explore')} style={[s.actionCard, s.exploreCard]}>
          <Text style={s.actionIconDark}>⌕</Text>
          <Text style={s.actionTitleDark}>Tous les lieux</Text>
          <Text style={s.actionCopyDark}>Filtres simples</Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push('/propose')} style={s.missionCard}>
        <View style={s.missionCoin}><Text style={s.missionCoinText}>+25</Text></View>
        <View style={s.missionText}>
          <Text style={s.missionEyebrow}>MISSION B-COINS</Text>
          <Text style={s.missionTitle}>Faites découvrir une bonne adresse</Text>
          <Text style={s.missionCopy}>Gagnez 25 B-coins après validation par l’équipe.</Text>
        </View>
        <Text style={s.missionArrow}>→</Text>
      </Pressable>

      <View style={s.sectionHead}>
        <View>
          <Eyebrow>SÉLECTION TIME OUT</Eyebrow>
          <Text style={s.sectionTitle}>7 adresses africaines à Paris</Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/spotlight')}><Text style={s.link}>Voir tout</Text></Pressable>
      </View>
      {loading ? <Loading /> : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carousel}>
          {places.map((place) => <PlaceCard key={place.id} place={place} compact />)}
        </ScrollView>
      )}

      <Pressable onPress={() => router.push('/mission')} style={s.aboutCard}>
        <View style={s.aboutBadge}><Text style={s.aboutBadgeText}>?</Text></View>
        <View style={s.aboutText}>
          <Text style={s.aboutTitle}>Pourquoi BLACKSPOT YOU ?</Text>
          <Text style={s.aboutCopy}>Comprendre la mission et les statuts en 1 minute.</Text>
        </View>
        <Text style={s.aboutArrow}>→</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingTop: 58, paddingBottom: 112, gap: 17 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileButton: { width: 40, height: 40, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  profileGlyph: { color: colors.purple, fontSize: 20 },
  hero: { minHeight: 310, borderRadius: radius.xl, backgroundColor: colors.black, overflow: 'hidden', justifyContent: 'flex-end', ...shadow },
  heroOrbOne: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: colors.purple, right: -65, top: -95 },
  heroOrbTwo: { position: 'absolute', width: 118, height: 118, borderRadius: 59, backgroundColor: colors.coral, right: 98, top: 62 },
  heroOrbThree: { position: 'absolute', width: 62, height: 62, borderRadius: 31, backgroundColor: colors.sun, left: 26, top: 26 },
  heroContent: { padding: 21, gap: 10, backgroundColor: 'rgba(15,13,18,.25)' },
  heroCopy: { color: 'rgba(255,255,255,.76)', fontSize: 14, lineHeight: 20 },
  searchBar: { minHeight: 54, borderRadius: radius.pill, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 4 },
  searchIcon: { color: colors.purple, fontWeight: '900', fontSize: 23, marginRight: 9 },
  searchText: { color: colors.muted, fontSize: 14, flex: 1 },
  actionRow: { flexDirection: 'row', gap: 11 },
  actionCard: { flex: 1, minHeight: 126, borderRadius: radius.lg, padding: 16, justifyContent: 'flex-end' },
  nearbyCard: { backgroundColor: colors.purple },
  exploreCard: { backgroundColor: colors.sun },
  actionIcon: { position: 'absolute', top: 14, right: 14, color: colors.white, fontSize: 26, fontWeight: '900' },
  actionIconDark: { position: 'absolute', top: 14, right: 14, color: colors.black, fontSize: 26, fontWeight: '900' },
  actionTitle: { color: colors.white, fontSize: 17, fontWeight: '900' },
  actionTitleDark: { color: colors.black, fontSize: 17, fontWeight: '900' },
  actionCopy: { color: 'rgba(255,255,255,.70)', fontSize: 11.5, marginTop: 3 },
  actionCopyDark: { color: 'rgba(15,13,18,.62)', fontSize: 11.5, marginTop: 3 },
  missionCard: { borderRadius: radius.lg, backgroundColor: colors.mintSoft, borderWidth: 1, borderColor: '#C5EFE0', padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  missionCoin: { width: 52, height: 52, borderRadius: 19, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center' },
  missionCoinText: { color: colors.black, fontWeight: '900', fontSize: 16 },
  missionText: { flex: 1 },
  missionEyebrow: { color: colors.success, fontSize: 9.5, fontWeight: '900', letterSpacing: 1 },
  missionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900', marginTop: 2 },
  missionCopy: { color: colors.muted, fontSize: 11.5, marginTop: 2 },
  missionArrow: { color: colors.success, fontSize: 22, fontWeight: '900' },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: colors.ink, marginTop: 4 },
  link: { color: colors.purple, fontWeight: '900', fontSize: 12 },
  carousel: { paddingRight: 10 },
  aboutCard: { borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  aboutBadge: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.lilac, alignItems: 'center', justifyContent: 'center' },
  aboutBadgeText: { color: colors.purpleDark, fontSize: 18, fontWeight: '900' },
  aboutText: { flex: 1 },
  aboutTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  aboutCopy: { color: colors.muted, fontSize: 11.5, marginTop: 2 },
  aboutArrow: { color: colors.purple, fontSize: 20, fontWeight: '900' },
});
