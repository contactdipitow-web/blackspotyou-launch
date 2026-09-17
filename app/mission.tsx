import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '@/components/BrandHeader';
import { Button, Eyebrow, Title } from '@/components/ui';
import { colors, radius } from '@/theme';

const steps = [
  { number: '1', title: 'Découvrez', copy: 'Trouvez une adresse par envie, quartier ou proximité.', color: colors.sunSoft },
  { number: '2', title: 'Vérifiez', copy: 'Consultez des informations pratiques et des vécus modérés.', color: colors.skySoft },
  { number: '3', title: 'Contribuez', copy: 'Proposez un lieu ou partagez une expérience utile.', color: colors.mintSoft },
];

export default function Mission() {
  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <BrandHeader />
      <View style={s.hero}>
        <Eyebrow inverse>NOTRE MISSION</Eyebrow>
        <Title inverse>Rendre les bonnes adresses plus visibles, ensemble.</Title>
        <Text style={s.heroCopy}>
          BLACKSPOT YOU est le guide communautaire black-friendly qui aide à choisir des lieux à Paris
          grâce à des informations claires et à des expériences réellement documentées.
        </Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Comment ça marche</Text>
        {steps.map((step) => (
          <View key={step.number} style={[s.step, { backgroundColor: step.color }]}>
            <Text style={s.stepNumber}>{step.number}</Text>
            <View style={s.stepText}>
              <Text style={s.stepTitle}>{step.title}</Text>
              <Text style={s.stepCopy}>{step.copy}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={s.notice}>
        <Text style={s.noticeTitle}>Un principe essentiel</Text>
        <Text style={s.noticeCopy}>
          Une cuisine africaine, une image de marque ou une sélection presse ne suffisent jamais à classer
          un établissement. Le statut communautaire repose sur des contributions modérées.
        </Text>
      </View>

      <View style={s.statuses}>
        <Text style={s.sectionTitle}>Lire les statuts en un coup d’œil</Text>
        <View style={s.statusRow}><Text style={s.statusNeutral}>À découvrir</Text><Text style={s.statusCopy}>Aucun verdict communautaire.</Text></View>
        <View style={s.statusRow}><Text style={s.statusGood}>Recommandé</Text><Text style={s.statusCopy}>Expériences positives vérifiées.</Text></View>
        <View style={s.statusRow}><Text style={s.statusWatch}>À surveiller</Text><Text style={s.statusCopy}>Informations à consulter avant votre visite.</Text></View>
      </View>

      <Button title="Explorer les lieux" onPress={() => router.replace('/(tabs)/explore')} />
      <Button title="Proposer un lieu · +25 B-coins" variant="secondary" onPress={() => router.push('/propose')} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingTop: 28, paddingBottom: 48, gap: 18 },
  hero: { borderRadius: radius.xl, backgroundColor: colors.purpleDeep, padding: 22, gap: 10, overflow: 'hidden' },
  heroCopy: { color: 'rgba(255,255,255,.78)', fontSize: 14.5, lineHeight: 22 },
  section: { gap: 9 },
  sectionTitle: { color: colors.ink, fontWeight: '900', fontSize: 19 },
  step: { borderRadius: radius.lg, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13 },
  stepNumber: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden', backgroundColor: colors.ink, color: colors.white, lineHeight: 34, textAlign: 'center', fontWeight: '900' },
  stepText: { flex: 1 },
  stepTitle: { color: colors.ink, fontWeight: '900', fontSize: 16 },
  stepCopy: { color: colors.muted, fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  notice: { borderRadius: radius.lg, backgroundColor: colors.coralSoft, borderWidth: 1, borderColor: '#FFD8D2', padding: 17, gap: 6 },
  noticeTitle: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  noticeCopy: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  statuses: { borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 17, gap: 11 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusNeutral: { width: 94, color: colors.purpleDark, backgroundColor: colors.lilac, borderRadius: 999, paddingVertical: 6, textAlign: 'center', fontSize: 10.5, fontWeight: '900' },
  statusGood: { width: 94, color: colors.success, backgroundColor: colors.mintSoft, borderRadius: 999, paddingVertical: 6, textAlign: 'center', fontSize: 10.5, fontWeight: '900' },
  statusWatch: { width: 94, color: '#8A5B00', backgroundColor: colors.sunSoft, borderRadius: 999, paddingVertical: 6, textAlign: 'center', fontSize: 10.5, fontWeight: '900' },
  statusCopy: { flex: 1, color: colors.muted, fontSize: 12.5 },
});
