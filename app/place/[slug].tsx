import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Loading, Title } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { isFavorite, setFavorite } from '@/services/account';
import { getPlace } from '@/services/places';
import { colors, radius, shadow } from '@/theme';
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
    try { await setFavorite(user.id, place.id, !favorite); setFav(!favorite); }
    catch { Alert.alert('Erreur', 'Le favori n’a pas pu être modifié.'); }
  };
  const address = [place.address_line, place.postal_code, place.city, place.country_code].filter(Boolean).join(', ');
  const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${address}`)}${place.google_place_id?`&query_place_id=${encodeURIComponent(place.google_place_id)}`:''}`;
  const routeUrl=`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&destination_place_id=${place.google_place_id ?? ''}`;
  const imageUrl=place.cover_image_path?.startsWith('http')?place.cover_image_path:null;
  const open=(url:string)=>void Linking.openURL(url);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      {imageUrl?<Image source={{uri:imageUrl}} style={styles.cover} resizeMode="cover"/>:<View style={styles.coverFallback}><Text style={styles.coverLetter}>{place.name.slice(0,1).toUpperCase()}</Text><Text style={styles.coverFallbackText}>BLACKSPOT YOU · {place.city.toUpperCase()}</Text></View>}
      <View style={styles.hero}>
        <Text style={styles.category}>{place.establishment_categories?.label ?? 'Lieu'}</Text>
        <Title>{place.name}</Title>
        <Text style={styles.address}>{address}</Text>
      </View>
      <View style={styles.actionsRow}>
        <Pressable style={styles.action} onPress={()=>open(mapsUrl)}><Text style={styles.actionIcon}>⌖</Text><Text style={styles.actionText}>Google Maps</Text></Pressable>
        {place.website_url?<Pressable style={styles.action} onPress={()=>open(place.website_url!)}><Text style={styles.actionIcon}>↗</Text><Text style={styles.actionText}>Site web</Text></Pressable>:null}
        {place.phone?<Pressable style={styles.action} onPress={()=>open(`tel:${place.phone}`)}><Text style={styles.actionIcon}>☎</Text><Text style={styles.actionText}>Appeler</Text></Pressable>:null}
      </View>
      <Button title={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} variant="secondary" onPress={() => void toggle()} />
      <View style={styles.card}>
        <Text style={styles.heading}>À propos</Text>
        <Text style={styles.body}>{place.description ?? 'Les informations détaillées seront enrichies par la communauté.'}</Text>
        {place.community_context && <Text style={styles.body}>{place.community_context}</Text>}
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Repères pratiques</Text>
        <View style={styles.fact}><Text style={styles.factLabel}>Adresse</Text><Text style={styles.factValue}>{address}</Text></View>
        {place.phone?<View style={styles.fact}><Text style={styles.factLabel}>Téléphone</Text><Text style={styles.factValue}>{place.phone}</Text></View>:null}
        {place.website_url?<View style={styles.fact}><Text style={styles.factLabel}>En ligne</Text><Text style={styles.factValue}>Site officiel disponible</Text></View>:null}
      </View>
      <View style={styles.communityCard}>
        <Text style={styles.communityEyebrow}>AVIS BLACKSPOT YOU</Text>
        <Text style={styles.heading}>Statut communautaire</Text>
        <Text style={styles.body}>{place.public_status === 'unclassified' ? 'Non classé — aucun verdict automatique.' : place.public_status.replaceAll('_', ' ')}</Text>
      </View>
      <Button title="Itinéraire" onPress={() => open(routeUrl)} />
      <Button title="Signaler une information incorrecte" variant="secondary" onPress={() => user ? router.push({ pathname: '/report/[id]', params: { id: place.id, name: place.name } }) : router.push('/auth')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:colors.canvas},content:{padding:20,paddingBottom:50,gap:14},cover:{height:230,borderRadius:radius.xl,backgroundColor:colors.lilac,...shadow},coverFallback:{height:230,borderRadius:radius.xl,backgroundColor:'#100D14',padding:22,justifyContent:'space-between',overflow:'hidden'},coverLetter:{fontSize:88,fontWeight:'900',color:colors.white,opacity:.92},coverFallbackText:{color:'#D8B4FE',fontSize:12,fontWeight:'900',letterSpacing:2},hero:{gap:8},category:{color:colors.purple,fontWeight:'800',marginTop:4},address:{color:colors.muted,fontSize:16,lineHeight:22},actionsRow:{flexDirection:'row',gap:8},action:{flex:1,minHeight:72,borderRadius:radius.lg,backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,alignItems:'center',justifyContent:'center',padding:8,...shadow},actionIcon:{fontSize:20,color:colors.purple,fontWeight:'900'},actionText:{fontSize:11.5,color:colors.ink,fontWeight:'800',marginTop:4,textAlign:'center'},card:{backgroundColor:colors.white,padding:18,borderRadius:radius.lg,borderWidth:1,borderColor:colors.border,gap:10},communityCard:{backgroundColor:colors.lilac,padding:18,borderRadius:radius.lg,gap:8},communityEyebrow:{fontSize:11,color:colors.purple,fontWeight:'900',letterSpacing:1.5},heading:{fontSize:18,fontWeight:'800',color:colors.ink},body:{color:colors.muted,lineHeight:23},fact:{gap:2,paddingVertical:3},factLabel:{fontSize:11,color:colors.purple,fontWeight:'900',textTransform:'uppercase'},factValue:{color:colors.ink,fontSize:14,lineHeight:20}
});
