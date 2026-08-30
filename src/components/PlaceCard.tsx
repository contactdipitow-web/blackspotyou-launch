import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Establishment } from '@/types';
import { colors, radius, shadow } from '@/theme';

const statusLabel: Record<Establishment['public_status'], string> = {
  unclassified: 'À découvrir', good_spot: 'Bon spot', watchlist: 'À surveiller', red_flag: 'Red spot',
  community_recommended: 'Recommandé', under_review: 'En vérification', incident_documented: 'Incident documenté',
};

export function PlaceCard({ place, compact = false }: { place: Establishment; compact?: boolean }) {
  const status = statusLabel[place.public_status] ?? 'Lieu';
  return <Link href={{pathname:'/place/[slug]',params:{slug:place.slug}}} asChild><Pressable accessibilityRole="button" accessibilityLabel={`Voir ${place.name}`} style={({pressed})=>[s.card, compact&&s.compact, pressed&&s.pressed]}>
    <View style={s.art}>
      <View style={s.artOrb}/><Text style={s.artLetter}>{place.name.slice(0,1).toUpperCase()}</Text>
      <Text style={s.artCategory}>{place.establishment_categories?.label ?? 'SPOT'}</Text>
    </View>
    <View style={s.body}>
      <View style={s.badges}><View style={s.badge}><Text style={s.badgeText}>{place.establishment_categories?.label ?? 'Lieu'}</Text></View><Text style={s.status}>{status}</Text></View>
      <Text numberOfLines={1} style={s.name}>{place.name}</Text>
      <Text numberOfLines={1} style={s.city}>{[place.address_line,place.city].filter(Boolean).join(' · ')}</Text>
      {!compact ? <Text numberOfLines={2} style={s.desc}>{place.description ?? place.community_context ?? 'Découvrez les informations documentées par la communauté.'}</Text> : null}
    </View>
  </Pressable></Link>;
}
const s=StyleSheet.create({card:{backgroundColor:colors.white,borderRadius:radius.lg,marginVertical:8,borderWidth:1,borderColor:colors.border,overflow:'hidden',...shadow},compact:{width:248,marginRight:12},pressed:{opacity:.86},art:{height:86,backgroundColor:colors.black,overflow:'hidden',justifyContent:'center',paddingHorizontal:18},artOrb:{position:'absolute',width:150,height:150,borderRadius:75,backgroundColor:colors.purple,right:-38,top:-58,opacity:.82},artLetter:{color:'rgba(255,255,255,.9)',fontSize:46,fontWeight:'900'},artCategory:{position:'absolute',right:15,bottom:10,color:'rgba(255,255,255,.72)',fontSize:10,fontWeight:'900',letterSpacing:1.5},body:{padding:16,gap:7},badges:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},badge:{alignSelf:'flex-start',backgroundColor:colors.lilac,borderRadius:99,paddingVertical:5,paddingHorizontal:10},badgeText:{color:colors.purpleDark,fontWeight:'700',fontSize:11},status:{fontSize:10,fontWeight:'800',color:colors.muted,textTransform:'uppercase',letterSpacing:.5},name:{fontSize:20,fontWeight:'900',color:colors.ink},city:{color:colors.muted,fontWeight:'600'},desc:{color:colors.muted,lineHeight:20}});
