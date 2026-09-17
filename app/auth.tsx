import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Title } from '@/components/ui';
import { messageForError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { colors, radius } from '@/theme';

type Mode = 'login' | 'signup' | 'forgot';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'blackspotyou://reset-password' });
        if (error) throw error;
        Alert.alert('Email envoyé', 'Ouvrez le lien reçu sur ce téléphone pour choisir un nouveau mot de passe.');
        setMode('login');
        return;
      }
      const result = mode === 'signup'
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: 'blackspotyou://auth-callback' } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) {
        Alert.alert('Confirmez votre email', 'Un lien de confirmation vient de vous être envoyé.');
      } else {
        router.back();
      }
    } catch (error) {
      Alert.alert('Impossible de continuer', messageForError(error));
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'login' ? 'Bon retour.' : mode === 'signup' ? 'Votre compte en 30 secondes.' : 'Retrouver votre accès.';
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.page}>
      <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.brandMark}><Text style={s.brandLetter}>B</Text></View>
        {mode !== 'forgot' ? (
          <View style={s.segment}>
            <Pressable onPress={() => setMode('login')} style={[s.segmentItem, mode === 'login' && s.segmentItemOn]}>
              <Text style={[s.segmentText, mode === 'login' && s.segmentTextOn]}>Connexion</Text>
            </Pressable>
            <Pressable onPress={() => setMode('signup')} style={[s.segmentItem, mode === 'signup' && s.segmentItemOn]}>
              <Text style={[s.segmentText, mode === 'signup' && s.segmentTextOn]}>Créer un compte</Text>
            </Pressable>
          </View>
        ) : null}

        <Title>{title}</Title>
        <Text style={s.copy}>
          {mode === 'signup'
            ? 'Un compte suffit pour enregistrer vos favoris, contribuer et recevoir vos B-coins.'
            : mode === 'forgot'
              ? 'Saisissez votre email : nous vous envoyons un lien sécurisé.'
              : 'Retrouvez vos favoris, vos contributions et votre solde B-coins.'}
        </Text>

        {mode === 'signup' ? (
          <View style={s.benefits}>
            <Text style={s.benefit}>✓ Aucun profil public obligatoire</Text>
            <Text style={s.benefit}>✓ Géolocalisation facultative</Text>
            <Text style={s.benefit}>✓ Suppression du compte depuis l’app</Text>
          </View>
        ) : null}

        <View style={s.form}>
          <Field label="Adresse email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          {mode !== 'forgot' ? (
            <>
              <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
              {mode === 'signup' ? <Text style={s.hint}>8 caractères minimum</Text> : null}
            </>
          ) : null}
        </View>

        <Button
          title={busy ? 'Patientez…' : mode === 'login' ? 'Se connecter' : mode === 'signup' ? 'Créer mon compte' : 'Envoyer le lien'}
          disabled={busy || !email || (mode !== 'forgot' && password.length < 8)}
          onPress={() => void submit()}
        />

        {mode === 'login' ? (
          <Pressable onPress={() => setMode('forgot')}><Text style={s.textLink}>Mot de passe oublié ?</Text></Pressable>
        ) : mode === 'forgot' ? (
          <Pressable onPress={() => setMode('login')}><Text style={s.textLink}>Retour à la connexion</Text></Pressable>
        ) : null}
        <Text style={s.privacy}>Votre session est protégée par le stockage sécurisé du téléphone. Aucun mot de passe n’est conservé par l’app.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 24, paddingTop: 34, paddingBottom: 40, gap: 13 },
  brandMark: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.purple },
  brandLetter: { color: colors.white, fontSize: 24, fontWeight: '900' },
  segment: { flexDirection: 'row', borderRadius: radius.pill, padding: 4, backgroundColor: colors.lilac },
  segmentItem: { flex: 1, minHeight: 42, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  segmentItemOn: { backgroundColor: colors.white },
  segmentText: { color: colors.muted, fontWeight: '800', fontSize: 12.5 },
  segmentTextOn: { color: colors.purpleDark },
  copy: { color: colors.muted, lineHeight: 22, marginBottom: 2 },
  benefits: { borderRadius: radius.lg, backgroundColor: colors.mintSoft, padding: 14, gap: 6 },
  benefit: { color: colors.ink, fontSize: 12.5, fontWeight: '700' },
  form: { gap: 2 },
  hint: { color: colors.muted, fontSize: 11, marginTop: -5, marginLeft: 4 },
  textLink: { color: colors.purple, textAlign: 'center', fontWeight: '800', paddingVertical: 9 },
  privacy: { color: colors.muted, fontSize: 10.5, lineHeight: 16, textAlign: 'center', marginHorizontal: 8 },
});
