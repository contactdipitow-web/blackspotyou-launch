import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '@/components/BrandHeader';
import { Button, Eyebrow, Loading, Title } from '@/components/ui';
import { colors, radius } from '@/theme';

const steps = [
  { icon: '⌕', title: 'Trouvez', copy: 'Des adresses utiles par envie ou à proximité.', color: colors.sun },
  { icon: '✓', title: 'Comprenez', copy: 'Des statuts simples, sans verdict automatique.', color: colors.mint },
  { icon: 'B', title: 'Contribuez', copy: 'Des B-coins quand vos apports sont validés.', color: colors.coral },
];

export default function Onboarding() {
  const [seen, setSeen] = useState<boolean | null>(null);
  useEffect(() => { AsyncStorage.getItem('onboarding:v2').then((value) => setSeen(value === '1')); }, []);
  if (seen === null) return <Loading />;
  if (seen) return <Redirect href="/(tabs)" />;

  const go = async (path: '/(tabs)' | '/auth') => {
    await AsyncStorage.setItem('onboarding:v2', '1');
    router.replace(path);
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <BrandHeader />
      <View style={s.hero}>
        <View style={s.orbOne} /><View style={s.orbTwo} /><View style={s.orbThree} />
        <View style={s.heroText}>
          <Eyebrow inverse>LE GUIDE COMMUNAUTAIRE BLACK-FRIENDLY</Eyebrow>
          <Title inverse>Les bonnes adresses, avec le contexte qui compte.</Title>
          <Text style={s.body}>
            BLACKSPOT YOU rend visibles les lieux utiles à la communauté noire et transforme les expériences
            vérifiées en repères simples pour mieux choisir.
          </Text>
        </View>
      </View>

      <View style={s.steps}>
        {steps.map((step) => (
          <View key={step.title} style={s.step}>
            <Text style={[s.stepIcon, { backgroundColor: step.color }]}>{step.icon}</Text>
            <View style={s.stepText}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepCopy}>{step.copy}</Text>
            </View>
          </View>
        ))}
      </View>

      <Button title="Explorer sans compte" onPress={() => void go('/(tabs)')} />
      <Button title="Créer mon compte" variant="secondary" onPress={() => void go('/auth')} />
      <Text style={s.note}>
        Le compte n’est requis que pour enregistrer des favoris, proposer un lieu, contribuer et gagner des B-coins.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 22, paddingTop: 58, paddingBottom: 34, gap: 15 },
  hero: { minHeight: 320, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.black },
  orbOne: { position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: colors.purple, right: -42, top: -70 },
  orbTwo: { position: 'absolute', width: 118, height: 118, borderRadius: 59, backgroundColor: colors.coral, right: 92, top: 92 },
  orbThree: { position: 'absolute', width: 68, height: 68, borderRadius: 34, backgroundColor: colors.sun, left: 26, top: 34 },
  heroText: { padding: 22, gap: 10, backgroundColor: 'rgba(15,13,18,.36)' },
  body: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,.80)' },
  steps: { borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 8 },
  step: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 9, paddingVertical: 7 },
  stepIcon: { width: 38, height: 38, borderRadius: 14, overflow: 'hidden', color: colors.black, textAlign: 'center', lineHeight: 38, fontSize: 17, fontWeight: '900' },
  stepText: { flex: 1 },
  stepTitle: { color: colors.ink, fontWeight: '900', fontSize: 15 },
  stepCopy: { color: colors.muted, fontSize: 12.5, lineHeight: 17, marginTop: 2 },
  note: { textAlign: 'center', color: colors.muted, fontSize: 11.5, lineHeight: 17, marginHorizontal: 8 },
});
