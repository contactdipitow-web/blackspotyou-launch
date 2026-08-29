import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { messageForError } from '@/lib/errors';
import { reportEstablishment, type ReportReason } from '@/services/reports';
import { colors, radius } from '@/theme';

const reasons: Array<{ value: ReportReason; label: string }> = [
  { value: 'false_information', label: 'Information fausse ou obsolète' },
  { value: 'hate_or_discrimination', label: 'Haine ou discrimination' },
  { value: 'privacy', label: 'Atteinte à la vie privée' },
  { value: 'conflict_of_interest', label: 'Conflit d’intérêts' },
  { value: 'spam', label: 'Spam' },
  { value: 'illegal_content', label: 'Contenu illégal' },
  { value: 'other', label: 'Autre' },
];

export default function ReportScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason>('false_information');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <View style={styles.gate}>
        <Title>Signaler une information</Title>
        <Text style={styles.copy}>Un compte est nécessaire pour transmettre un signalement à la modération.</Text>
        <Button title="Se connecter" onPress={() => router.replace('/auth')} />
      </View>
    );
  }

  const submit = async () => {
    if (!id || details.trim().length < 10) {
      Alert.alert('Précisez le signalement', 'Ajoutez au moins 10 caractères pour aider la modération.');
      return;
    }
    setBusy(true);
    try {
      await reportEstablishment(user.id, id, reason, details);
      Alert.alert('Signalement envoyé', 'Merci. Il reste privé et sera examiné par l’équipe de modération.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Envoi impossible', messageForError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Title>Signaler une information</Title>
      <Text style={styles.copy}>{name ? `Lieu concerné : ${name}. ` : ''}Le signalement n’est jamais publié automatiquement.</Text>
      <Text style={styles.label}>Motif</Text>
      <View style={styles.reasons}>
        {reasons.map((item) => (
          <Pressable accessibilityRole="radio" accessibilityState={{ checked: reason === item.value }} key={item.value} onPress={() => setReason(item.value)} style={[styles.reason, reason === item.value && styles.reasonSelected]}>
            <Text style={[styles.reasonText, reason === item.value && styles.reasonTextSelected]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <Field label="Détails" multiline maxLength={1500} onChangeText={setDetails} placeholder="Expliquez précisément ce qui doit être vérifié…" value={details} />
      <Text style={styles.note}>Votre identité reste visible uniquement par l’équipe autorisée à traiter le signalement.</Text>
      <Button title={busy ? 'Envoi…' : 'Envoyer à la modération'} disabled={busy} onPress={() => void submit()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 48 },
  gate: { flex: 1, backgroundColor: colors.canvas, padding: 20, paddingTop: 56 },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 24, marginVertical: 14 },
  label: { color: colors.ink, fontWeight: '800', marginBottom: 8 },
  reasons: { gap: 8, marginBottom: 12 },
  reason: { borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, backgroundColor: colors.white, padding: 14 },
  reasonSelected: { borderColor: colors.purple, backgroundColor: colors.lilac },
  reasonText: { color: colors.ink, fontWeight: '600' },
  reasonTextSelected: { color: colors.purpleDark, fontWeight: '800' },
  note: { color: colors.muted, fontSize: 13, lineHeight: 19, marginVertical: 8 },
});
