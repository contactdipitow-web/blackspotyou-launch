import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import { PlaceCard } from '@/components/PlaceCard';
import { Button, Loading, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAccount, listFavorites } from '@/services/account';
import { colors } from '@/theme';
import type { Establishment } from '@/types';

const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://blackspotyou.com';

function LegalLinks() {
  return (
    <View style={styles.legal}>
      <Button title="Confidentialité" variant="secondary" onPress={() => void Linking.openURL(`${webUrl}/confidentialite`)} />
      <Button title="Conditions d’utilisation" variant="secondary" onPress={() => void Linking.openURL(`${webUrl}/conditions`)} />
      <Button title="Contacter BLACKSPOT YOU" variant="secondary" onPress={() => void Linking.openURL(`${webUrl}/contact`)} />
    </View>
  );
}

export default function Profile() {
  const { user, role, loading, signOut } = useAuth();
  const [favorites, setFavorites] = useState<Establishment[]>([]);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { if (user) void listFavorites(user.id).then(setFavorites); }, [user]);
  if (loading) return <Loading />;

  if (!user) {
    return (
      <View style={styles.page}>
        <Title>Votre espace</Title>
        <Text style={styles.copy}>Connectez-vous pour proposer des lieux, contribuer et retrouver vos favoris.</Text>
        <Button title="Se connecter" onPress={() => router.push('/auth')} />
        <LegalLinks />
      </View>
    );
  }

  const performDeletion = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      Alert.alert('Compte supprimé', 'Votre compte et vos données personnelles ont été supprimés.');
      router.replace('/');
    } catch (error) {
      const message = error instanceof Error && error.message === 'admin_transfer_required'
        ? 'Le compte administrateur doit d’abord transférer ses responsabilités. Contactez le support.'
        : 'La suppression n’a pas pu aboutir. Contactez le support depuis cette page.';
      Alert.alert('Suppression impossible', message);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeletion = () => {
    Alert.alert(
      'Supprimer définitivement le compte ?',
      'Vos favoris, signalements, contributions et données personnelles seront supprimés. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer définitivement', style: 'destructive', onPress: () => Alert.alert('Dernière confirmation', 'Confirmez la suppression définitive de votre compte BLACKSPOT YOU.', [{ text: 'Annuler', style: 'cancel' }, { text: 'Oui, supprimer', style: 'destructive', onPress: () => void performDeletion() }]) },
      ],
    );
  };

  return (
    <FlatList
      style={styles.page}
      contentContainerStyle={styles.content}
      data={favorites}
      keyExtractor={(place) => place.id}
      renderItem={({ item }) => <PlaceCard place={item} />}
      ListHeaderComponent={<View style={styles.header}><Title>Bonjour</Title><Text style={styles.email}>{user.email}</Text><Text style={styles.role}>Rôle : {role === 'member' ? 'utilisateur' : role}</Text><Button title="Proposer un lieu" onPress={() => router.push('/propose')} /><Button title="Se déconnecter" variant="secondary" onPress={() => void signOut()} /><Text style={styles.section}>Mes favoris</Text></View>}
      ListEmptyComponent={<Text style={styles.copy}>Vous n’avez pas encore de favori.</Text>}
      ListFooterComponent={<View style={styles.footer}><Text style={styles.section}>Informations et compte</Text><LegalLinks /><Button title={deleting ? 'Suppression…' : 'Supprimer définitivement mon compte'} variant="danger" disabled={deleting} onPress={confirmDeletion} /></View>}
    />
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas, paddingTop: 64, paddingHorizontal: 20 },
  content: { paddingBottom: 120 },
  header: { gap: 9 },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 24, marginVertical: 18 },
  email: { fontSize: 16, color: colors.ink },
  role: { color: colors.purpleDark, fontWeight: '700' },
  section: { fontWeight: '900', fontSize: 13, letterSpacing: 1.2, marginTop: 20, color: colors.ink },
  legal: { marginTop: 10 },
  footer: { marginTop: 24, paddingTop: 8, gap: 4 },
});
