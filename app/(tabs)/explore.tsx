import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BrandHeader } from '@/components/BrandHeader';
import { PlaceCard } from '@/components/PlaceCard';
import { Empty, Loading, Title } from '@/components/ui';
import { listCategories, listPlaces } from '@/services/places';
import { colors, radius } from '@/theme';
import type { Category, Establishment } from '@/types';

export default function Explore() {
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Establishment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void listCategories().then(setCategories); }, []);
  useEffect(() => {
    const id = setTimeout(() => {
      setLoading(true);
      listPlaces({ query, categoryIds: selected, limit: 100 })
        .then(setPlaces)
        .finally(() => setLoading(false));
    }, 220);
    return () => clearTimeout(id);
  }, [query, selected]);

  const toggle = (id: number) => setSelected((current) => (
    current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
  ));

  return (
    <FlatList
      style={s.page}
      contentContainerStyle={s.list}
      data={places}
      keyExtractor={(place) => place.id}
      renderItem={({ item }) => <PlaceCard place={item} />}
      ListEmptyComponent={loading ? <Loading /> : <Empty text="Aucun résultat. Retirez un filtre ou essayez un autre mot." />}
      ListHeaderComponent={(
        <View style={s.header}>
          <BrandHeader />
          <View style={s.titleRow}>
            <View style={s.titleText}>
              <Title>Trouvez votre spot.</Title>
              <Text style={s.copy}>Recherchez ou cochez plusieurs catégories.</Text>
            </View>
            <Pressable accessibilityLabel="Ouvrir la carte autour de moi" onPress={() => router.push('/(tabs)/map')} style={s.mapButton}>
              <Text style={s.mapIcon}>◎</Text><Text style={s.mapLabel}>Carte</Text>
            </Pressable>
          </View>

          <View style={s.searchWrap}>
            <Text style={s.searchIcon}>⌕</Text>
            <TextInput
              accessibilityLabel="Rechercher un lieu ou une ville"
              placeholder="Nom, quartier ou adresse…"
              placeholderTextColor={colors.muted}
              value={query}
              onChangeText={setQuery}
              style={s.search}
            />
            {query ? <Pressable onPress={() => setQuery('')}><Text style={s.clearSearch}>×</Text></Pressable> : null}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
            <Pressable onPress={() => setSelected([])} style={[s.chip, selected.length === 0 && s.chipOn]}>
              <Text style={[s.checkbox, selected.length === 0 && s.checkboxOn]}>{selected.length === 0 ? '✓' : ''}</Text>
              <Text style={[s.chipText, selected.length === 0 && s.chipTextOn]}>Tout</Text>
            </Pressable>
            {categories.map((category) => {
              const on = selected.includes(category.id);
              return (
                <Pressable key={category.id} onPress={() => toggle(category.id)} style={[s.chip, on && s.chipOn]}>
                  <Text style={[s.checkbox, on && s.checkboxOn]}>{on ? '✓' : ''}</Text>
                  <Text style={[s.chipText, on && s.chipTextOn]}>{category.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={s.resultsRow}>
            <Text style={s.resultCount}>{loading ? 'Recherche…' : `${places.length} lieu${places.length > 1 ? 'x' : ''}`}</Text>
            {selected.length ? <Pressable onPress={() => setSelected([])}><Text style={s.reset}>Effacer les filtres</Text></Pressable> : null}
          </View>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  list: { padding: 20, paddingTop: 58, paddingBottom: 112 },
  header: { gap: 15, marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  titleText: { flex: 1 },
  copy: { color: colors.muted, fontSize: 13.5, lineHeight: 20, marginTop: 5 },
  mapButton: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  mapIcon: { color: colors.white, fontSize: 22, fontWeight: '900', lineHeight: 23 },
  mapLabel: { color: colors.white, fontSize: 9.5, fontWeight: '800' },
  searchWrap: { height: 56, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 17 },
  searchIcon: { fontSize: 24, color: colors.purple, marginRight: 8 },
  search: { flex: 1, fontSize: 16, color: colors.ink },
  clearSearch: { color: colors.muted, fontSize: 25, paddingHorizontal: 4 },
  chips: { gap: 8, paddingRight: 10 },
  chip: { minHeight: 42, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7 },
  chipOn: { backgroundColor: colors.purple, borderColor: colors.purple },
  checkbox: { width: 17, height: 17, lineHeight: 15, borderRadius: 5, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.purple, textAlign: 'center', color: colors.purple, fontSize: 11, fontWeight: '900' },
  checkboxOn: { borderColor: colors.white, color: colors.white },
  chipText: { fontSize: 13, fontWeight: '800', color: colors.ink },
  chipTextOn: { color: colors.white },
  resultsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultCount: { color: colors.ink, fontSize: 13, fontWeight: '900' },
  reset: { color: colors.purple, fontSize: 11.5, fontWeight: '800' },
});
