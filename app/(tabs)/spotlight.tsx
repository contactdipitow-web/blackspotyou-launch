import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '@/components/BrandHeader';
import { GooglePlacePhoto } from '@/components/GooglePlacePhoto';
import { Empty, Eyebrow, Loading, Title } from '@/components/ui';
import { listSpotlight } from '@/services/spotlight';
import { colors, radius, shadow } from '@/theme';
import type { SpotlightItem } from '@/types';

type Filter = 'all' | 'places' | 'news' | 'events' | 'partners';
const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'places', label: 'Adresses' },
  { id: 'news', label: 'Actus' },
  { id: 'events', label: 'Événements' },
  { id: 'partners', label: 'Partenaires' },
];
const kindLabel: Record<SpotlightItem['kind'], string> = {
  favorite: 'Adresse',
  partner: 'Partenaire',
  event: 'Événement',
  news: 'Actualité',
  sponsored: 'Sponsorisé',
};

function matches(item: SpotlightItem, filter: Filter) {
  if (filter === 'all') return true;
  if (filter === 'places') return item.kind === 'favorite';
  if (filter === 'news') return item.kind === 'news';
  if (filter === 'events') return item.kind === 'event';
  return item.kind === 'partner' || item.kind === 'sponsored';
}

function openItem(item: SpotlightItem) {
  if (item.establishments?.slug) {
    router.push({ pathname: '/place/[slug]', params: { slug: item.establishments.slug } });
  } else if (item.link_url) {
    void Linking.openURL(item.link_url);
  }
}

function Fallback({ title }: { title: string }) {
  return (
    <View style={s.fallback}>
      <View style={s.fallbackOrbOne} /><View style={s.fallbackOrbTwo} />
      <Text style={s.fallbackLetter}>{title.slice(0, 1)}</Text>
    </View>
  );
}

function Media({ item, style }: { item: SpotlightItem; style: object }) {
  if (item.image_url) return <View style={style}><Image source={{ uri: item.image_url }} style={StyleSheet.absoluteFill} resizeMode="cover" /></View>;
  if (item.establishments) {
    return <GooglePlacePhoto place={item.establishments} style={style} fallback={<Fallback title={item.title} />} />;
  }
  return <View style={style}><Fallback title={item.title} /></View>;
}

function HeroCard({ item }: { item: SpotlightItem }) {
  return (
    <Pressable onPress={() => openItem(item)} style={({ pressed }) => [s.heroCard, pressed && s.pressed]}>
      <Media item={item} style={StyleSheet.absoluteFill} />
      <View style={s.heroShade} />
      <View style={s.heroCardContent}>
        <Text style={s.heroTag}>{item.is_sponsored ? 'SPONSORISÉ' : item.eyebrow ?? kindLabel[item.kind].toUpperCase()}</Text>
        <Text style={s.heroTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={s.heroSummary}>{item.summary}</Text>
        <Text style={s.heroCta}>{item.cta_label ?? 'Découvrir'} →</Text>
      </View>
    </Pressable>
  );
}

function FeedCard({ item }: { item: SpotlightItem }) {
  return (
    <Pressable onPress={() => openItem(item)} style={({ pressed }) => [s.feed, pressed && s.pressed]}>
      <Media item={item} style={s.feedMedia} />
      <View style={s.feedBody}>
        <Text style={s.feedTag}>{item.is_sponsored ? 'Sponsorisé' : item.eyebrow ?? kindLabel[item.kind]}</Text>
        <Text numberOfLines={2} style={s.feedTitle}>{item.title}</Text>
        <Text numberOfLines={2} style={s.feedCopy}>{item.summary}</Text>
        <Text style={s.feedCta}>{item.cta_label ?? 'Voir'} →</Text>
      </View>
    </Pressable>
  );
}

export default function Spotlight() {
  const [items, setItems] = useState<SpotlightItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => {
    setLoading(true);
    return listSpotlight().then(setItems).finally(() => setLoading(false));
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => items.filter((item) => matches(item, filter)), [items, filter]);
  const hero = filtered.find((item) => item.is_priority) ?? filtered[0];
  const feed = hero ? filtered.filter((item) => item.id !== hero.id) : [];

  return (
    <FlatList
      style={s.page}
      contentContainerStyle={s.content}
      data={feed}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <FeedCard item={item} />}
      ListHeaderComponent={(
        <View style={s.header}>
          <BrandHeader />
          <View>
            <Eyebrow>À LA UNE</Eyebrow>
            <Title>Le meilleur, sans le bruit.</Title>
            <Text style={s.intro}>Adresses, actus, événements et collaborations sélectionnés par l’équipe.</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
            {filters.map((entry) => {
              const active = filter === entry.id;
              return (
                <Pressable key={entry.id} onPress={() => setFilter(entry.id)} style={[s.filter, active && s.filterOn]}>
                  <Text style={[s.filterText, active && s.filterTextOn]}>{entry.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {loading ? <Loading /> : hero ? <HeroCard item={hero} /> : null}
          {!loading && feed.length ? (
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>{filter === 'all' ? 'À parcourir' : filters.find((entry) => entry.id === filter)?.label}</Text>
              <Text style={s.sectionCount}>{filtered.length} contenu{filtered.length > 1 ? 's' : ''}</Text>
            </View>
          ) : null}
        </View>
      )}
      ListEmptyComponent={!loading && !hero ? <Empty text="Aucun contenu dans cette rubrique pour le moment." /> : null}
    />
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingTop: 58, paddingBottom: 112 },
  header: { gap: 16, marginBottom: 8 },
  intro: { color: colors.muted, fontSize: 13.5, lineHeight: 20, marginTop: 6 },
  filters: { gap: 8, paddingRight: 10 },
  filter: { minHeight: 39, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  filterOn: { backgroundColor: colors.purple, borderColor: colors.purple },
  filterText: { color: colors.ink, fontWeight: '800', fontSize: 12.5 },
  filterTextOn: { color: colors.white },
  heroCard: { height: 320, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.black, ...shadow },
  heroShade: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(11,8,14,.50)' },
  heroCardContent: { position: 'absolute', left: 18, right: 18, bottom: 18, gap: 6 },
  heroTag: { alignSelf: 'flex-start', color: '#E4D7FF', fontWeight: '900', fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { color: colors.white, fontSize: 27, lineHeight: 30, fontWeight: '900' },
  heroSummary: { color: 'rgba(255,255,255,.80)', fontSize: 13, lineHeight: 18 },
  heroCta: { color: colors.white, fontSize: 12.5, fontWeight: '900', marginTop: 3 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  sectionCount: { color: colors.muted, fontSize: 11 },
  feed: { minHeight: 146, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden', marginVertical: 7, flexDirection: 'row', ...shadow },
  feedMedia: { width: 112, minHeight: 146, backgroundColor: colors.black },
  feedBody: { flex: 1, padding: 13, gap: 5 },
  feedTag: { color: colors.purple, fontSize: 9.5, fontWeight: '900', textTransform: 'uppercase', letterSpacing: .7 },
  feedTitle: { color: colors.ink, fontSize: 17, lineHeight: 20, fontWeight: '900' },
  feedCopy: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  feedCta: { color: colors.purple, fontSize: 11.5, fontWeight: '900', marginTop: 2 },
  fallback: { flex: 1, backgroundColor: colors.black, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fallbackOrbOne: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: colors.purple, right: -58, top: -72 },
  fallbackOrbTwo: { position: 'absolute', width: 92, height: 92, borderRadius: 46, backgroundColor: colors.coral, left: -26, bottom: -38 },
  fallbackLetter: { color: colors.white, fontSize: 72, fontWeight: '900' },
  pressed: { opacity: .86 },
});
