import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandHeader } from '@/components/BrandHeader';
import { PlaceCard } from '@/components/PlaceCard';
import { Button, Loading, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { deleteAccount, listFavorites } from '@/services/account';
import { getBCoinWallet } from '@/services/bcoins';
import { colors, radius, shadow } from '@/theme';
import type { Establishment } from '@/types';

const webUrl = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://blackspotyou.com';

function Guest() {
  return (
    <View style={s.guest}>
      <BrandHeader />
      <View style={s.guestHero}>
        <Text style={s.guestEyebrow}>VOTRE ESPACE</Text>
        <Title inverse>Gardez ce qui compte au même endroit.</Title>
        <Text style={s.guestCopy}>Favoris, contributions et B-coins : un compte suffit, sans profil public obligatoire.</Text>
      </View>
      <View style={s.guestBenefits}>
        <Text style={s.guestBenefit}>♡ Enregistrez vos bonnes adresses</Text>
        <Text style={s.guestBenefit}>＋ Proposez et enrichissez des lieux</Text>
        <Text style={s.guestBenefit}>B Gagnez des B-coins après validation</Text>
      </View>
      <Button title="Se connecter ou créer un compte" onPress={() => router.push('/auth')} />
      <Button title="Comprendre la mission" variant="secondary" onPress={() => router.push('/mission')} />
    </View>
  );
}

function ActionCard({ icon, title, copy, color, onPress }: { icon: string; title: string; copy: string; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[s.actionCard, { backgroundColor: color }]}>
      <Text style={s.actionIcon}>{icon}</Text>
      <Text style={s.actionTitle}>{title}</Text>
      <Text style={s.actionCopy}>{copy}</Text>
    </Pressable>
  );
}

export default function Profile() {
  const { user, role, loading, signOut } = useAuth();
  const [favorites, setFavorites] = useState<Establishment[]>([]);
  const [deleting, setDeleting] = useState(false);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    if (!user) return;
    void listFavorites(user.id).then(setFavorites);
    void getBCoinWallet(user.id).then((wallet) => setCoins(wallet.balance));
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <Guest />;

  const performDeletion = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      Alert.alert('Compte supprimé', 'Votre compte et vos données personnelles ont été supprimés.');
      router.replace('/');
    } catch (error) {
      const message = error instanceof Error && error.message === 'admin_transfer_required'
        ? 'Le compte administrateur doit d’abord transférer ses responsabilités. Contactez le support.'
        : 'La suppression n’a pas pu aboutir. Contactez le support.';
      Alert.alert('Suppression impossible', message);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDeletion = () => Alert.alert(
    'Supprimer définitivement le compte ?',
    'Vos favoris, signalements, contributions et données personnelles seront supprimés.',
    [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => void performDeletion() },
    ],
  );

  return (
    <FlatList
      style={s.page}
      contentContainerStyle={s.content}
      data={favorites}
      keyExtractor={(place) => place.id}
      renderItem={({ item }) => <PlaceCard place={item} />}
      ListHeaderComponent={(
        <View style={s.header}>
          <View style={s.topRow}>
            <BrandHeader />
            <Pressable onPress={() => void signOut()}><Text style={s.signOut}>Déconnexion</Text></Pressable>
          </View>
          <View>
            <Title>Mon espace.</Title>
            <Text numberOfLines={1} style={s.email}>{user.email}</Text>
          </View>
          <View style={s.stats}>
            <Pressable onPress={() => router.push('/bcoins')} style={[s.stat, s.coinStat]}>
              <Text style={s.statValueLight}>{coins}</Text><Text style={s.statLabelLight}>B-coins</Text>
            </Pressable>
            <View style={s.stat}>
              <Text style={s.statValue}>{favorites.length}</Text><Text style={s.statLabel}>Favori{favorites.length > 1 ? 's' : ''}</Text>
            </View>
          </View>
          <View style={s.actions}>
            <ActionCard icon="＋" title="Proposer" copy="+25 B-coins" color={colors.sunSoft} onPress={() => router.push('/propose')} />
            <ActionCard icon="B" title="Récompenses" copy="Voir mon solde" color={colors.mintSoft} onPress={() => router.push('/bcoins')} />
            <ActionCard icon="?" title="La mission" copy="En 1 minute" color={colors.skySoft} onPress={() => router.push('/mission')} />
            <ActionCard icon="✦" title="À la une" copy="Nos sélections" color={colors.coralSoft} onPress={() => router.push('/(tabs)/spotlight')} />
          </View>
          {role !== 'member' ? (
            <Pressable style={s.adminCard} onPress={() => router.push('/admin')}>
              <View>
                <Text style={s.adminTag}>{role === 'admin' ? 'ADMINISTRATION' : 'MODÉRATION'}</Text>
                <Text style={s.adminTitle}>Gérer BLACKSPOT YOU</Text>
              </View>
              <Text style={s.adminArrow}>→</Text>
            </Pressable>
          ) : null}
          <View style={s.favoriteHead}>
            <Text style={s.section}>Mes favoris</Text>
            <Text style={s.sectionMeta}>{favorites.length || 'Aucun pour le moment'}</Text>
          </View>
        </View>
      )}
      ListEmptyComponent={<Text style={s.empty}>Ajoutez un cœur depuis la fiche d’un lieu pour le retrouver ici.</Text>}
      ListFooterComponent={(
        <View style={s.footer}>
          <View style={s.legalRow}>
            <Pressable onPress={() => void Linking.openURL(`${webUrl}/confidentialite`)}><Text style={s.legalLink}>Confidentialité</Text></Pressable>
            <Pressable onPress={() => void Linking.openURL(`${webUrl}/conditions`)}><Text style={s.legalLink}>Conditions</Text></Pressable>
            <Pressable onPress={() => void Linking.openURL(`${webUrl}/contact`)}><Text style={s.legalLink}>Contact</Text></Pressable>
          </View>
          <Pressable disabled={deleting} onPress={confirmDeletion}>
            <Text style={s.deleteLink}>{deleting ? 'Suppression…' : 'Supprimer mon compte'}</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingTop: 58, paddingBottom: 112 },
  header: { gap: 15 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  signOut: { color: colors.purple, fontSize: 11.5, fontWeight: '800' },
  email: { color: colors.muted, fontSize: 13, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, minHeight: 94, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, padding: 15, justifyContent: 'flex-end', ...shadow },
  coinStat: { backgroundColor: colors.black, borderColor: colors.black },
  statValue: { color: colors.ink, fontSize: 31, fontWeight: '900' },
  statLabel: { color: colors.muted, fontSize: 11.5, fontWeight: '700' },
  statValueLight: { color: colors.white, fontSize: 31, fontWeight: '900' },
  statLabelLight: { color: 'rgba(255,255,255,.65)', fontSize: 11.5, fontWeight: '700' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  actionCard: { width: '48.6%', minHeight: 112, borderRadius: radius.lg, padding: 14, justifyContent: 'flex-end' },
  actionIcon: { position: 'absolute', top: 12, right: 13, color: colors.ink, fontSize: 20, fontWeight: '900' },
  actionTitle: { color: colors.ink, fontSize: 15, fontWeight: '900' },
  actionCopy: { color: colors.muted, fontSize: 10.5, marginTop: 2 },
  adminCard: { backgroundColor: colors.lilac, borderRadius: radius.lg, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  adminTag: { fontSize: 9.5, color: colors.purpleDark, fontWeight: '900', letterSpacing: 1 },
  adminTitle: { fontSize: 16, fontWeight: '900', color: colors.ink, marginTop: 3 },
  adminArrow: { fontSize: 24, color: colors.purpleDark },
  favoriteHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  section: { color: colors.ink, fontWeight: '900', fontSize: 18 },
  sectionMeta: { color: colors.muted, fontSize: 11 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', paddingVertical: 24, paddingHorizontal: 20 },
  footer: { marginTop: 26, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.border, gap: 18, alignItems: 'center' },
  legalRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18 },
  legalLink: { color: colors.purple, fontSize: 11.5, fontWeight: '800' },
  deleteLink: { color: colors.danger, fontSize: 11.5, fontWeight: '700' },
  guest: { flex: 1, backgroundColor: colors.canvas, padding: 20, paddingTop: 58, gap: 16 },
  guestHero: { backgroundColor: colors.purpleDeep, borderRadius: radius.xl, padding: 22, gap: 9 },
  guestEyebrow: { color: '#D8C8FF', fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  guestCopy: { color: 'rgba(255,255,255,.75)', fontSize: 14, lineHeight: 21 },
  guestBenefits: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 11 },
  guestBenefit: { color: colors.ink, fontSize: 13, fontWeight: '700' },
});
