import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { BrandHeader, ParisWatermark } from '@/components/BrandHeader';
import { PlaceCard } from '@/components/PlaceCard';
import { Button, Eyebrow, Loading, Title } from '@/components/ui';
import { listPlaces } from '@/services/places';
import { colors, radius, shadow } from '@/theme';
import type { Establishment } from '@/types';

const HERO = 'https://images.pexels.com/photos/34592097/pexels-photo-34592097.jpeg?auto=compress&cs=tinysrgb&w=1400';

export default function Home(){
  const [places,setPlaces]=useState<Establishment[]>([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{listPlaces({limit:8}).then(setPlaces).finally(()=>setLoading(false))},[]);
  return <FlatList
    style={s.page}
    contentContainerStyle={s.content}
    data={places}
    keyExtractor={p=>p.id}
    ListHeaderComponent={<View style={s.header}>
      <BrandHeader/>
      <ImageBackground source={{uri:HERO}} style={s.hero} imageStyle={s.heroImage} accessibilityLabel="Jeunes amis noirs réunis à Paris">
        <View style={s.heroShade}/><ParisWatermark dark/>
        <View style={s.heroContent}>
          <Eyebrow inverse>PARIS · PAR NOUS, POUR NOUS</Eyebrow>
          <Title inverse>Les bonnes adresses prennent vie avec la communauté.</Title>
          <Text style={s.heroCopy}>Explorez, partagez vos expériences et faites grandir une carte plus utile, plus humaine et plus vivante.</Text>
          <View style={s.heroActions}><Button title="Explorer autour de moi" onPress={()=>router.push('/(tabs)/map')}/><Button title="Proposer un lieu" variant="secondary" onPress={()=>router.push('/propose')}/></View>
        </View>
      </ImageBackground>
      <View style={s.quickRow}>
        <Pressable style={s.quickCard} onPress={()=>router.push('/(tabs)/spotlight')}><Text style={s.quickIcon}>✦</Text><Text style={s.quickTitle}>À la une</Text><Text style={s.quickCopy}>Favoris, partenaires et actualités.</Text></Pressable>
        <Pressable style={s.quickCard} onPress={()=>router.push('/bcoins')}><Text style={s.quickIcon}>B</Text><Text style={s.quickTitle}>B-coins</Text><Text style={s.quickCopy}>Contribuez, gagnez, débloquez.</Text></Pressable>
      </View>
      <View style={s.sectionRow}><View><Eyebrow>NOUVEAUX SPOTS</Eyebrow><Text style={s.sectionTitle}>À découvrir maintenant</Text></View><Pressable onPress={()=>router.push('/(tabs)/explore')}><Text style={s.link}>Tout voir</Text></Pressable></View>
    </View>}
    renderItem={({item})=><PlaceCard place={item}/>}
    ListEmptyComponent={loading?<Loading/>:<Text style={s.empty}>Aucun lieu publié pour le moment.</Text>}
    ListFooterComponent={<Text style={s.credit}>Photo d’accueil : Pexels · Paris</Text>}
  />
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:colors.canvas},content:{padding:20,paddingTop:58,paddingBottom:118},header:{gap:18},hero:{minHeight:440,borderRadius:radius.xl,overflow:'hidden',justifyContent:'flex-end',...shadow},heroImage:{borderRadius:radius.xl},heroShade:{position:'absolute',top:0,right:0,bottom:0,left:0,backgroundColor:'rgba(12,8,16,.60)'},heroContent:{padding:22,gap:12},heroCopy:{color:'rgba(255,255,255,.84)',fontSize:15,lineHeight:22,maxWidth:330},heroActions:{marginTop:2},quickRow:{flexDirection:'row',gap:12},quickCard:{flex:1,minHeight:150,borderRadius:radius.lg,backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,padding:16,...shadow},quickIcon:{width:34,height:34,borderRadius:12,backgroundColor:colors.lilac,color:colors.purpleDark,textAlign:'center',textAlignVertical:'center',fontSize:18,fontWeight:'900',lineHeight:34,overflow:'hidden'},quickTitle:{fontSize:17,fontWeight:'900',color:colors.ink,marginTop:12},quickCopy:{fontSize:12.5,lineHeight:18,color:colors.muted,marginTop:4},sectionRow:{marginTop:5,flexDirection:'row',alignItems:'flex-end',justifyContent:'space-between',gap:12},sectionTitle:{fontSize:23,fontWeight:'900',color:colors.ink,marginTop:4},link:{color:colors.purple,fontWeight:'800'},empty:{color:colors.muted,paddingVertical:30,textAlign:'center'},credit:{fontSize:10,color:colors.muted,textAlign:'center',marginTop:16,opacity:.65}});
