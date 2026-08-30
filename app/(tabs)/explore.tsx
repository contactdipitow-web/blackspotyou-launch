import { useEffect,useMemo,useState } from 'react';
import { FlatList,Pressable,ScrollView,StyleSheet,Text,TextInput,View } from 'react-native';
import { BrandHeader } from '@/components/BrandHeader';
import { PlaceCard } from '@/components/PlaceCard';
import { Empty,Loading,Title } from '@/components/ui';
import { listCategories,listPlaces } from '@/services/places';
import { colors,radius } from '@/theme';
import type { Category,Establishment } from '@/types';

export default function Explore(){
  const [query,setQuery]=useState(''); const [places,setPlaces]=useState<Establishment[]>([]); const [categories,setCategories]=useState<Category[]>([]); const [selected,setSelected]=useState<number[]>([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{void listCategories().then(setCategories)},[]);
  useEffect(()=>{const id=setTimeout(()=>{setLoading(true);listPlaces({query,categoryIds:selected,limit:100}).then(setPlaces).finally(()=>setLoading(false))},250);return()=>clearTimeout(id)},[query,selected]);
  const activeLabel=useMemo(()=>selected.length===0?'Tous les lieux':selected.length===1?'1 catégorie sélectionnée':`${selected.length} catégories sélectionnées`,[selected.length]);
  const toggle=(id:number)=>setSelected(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
  return <View style={s.page}>
    <FlatList data={places} keyExtractor={p=>p.id} renderItem={({item})=><PlaceCard place={item}/>} ListEmptyComponent={loading?<Loading/>:<Empty text="Aucun résultat. Modifiez les filtres ou élargissez votre recherche."/>} contentContainerStyle={s.list}
      ListHeaderComponent={<View style={s.header}>
        <BrandHeader/><View><Title>Explorer sans avoir besoin de savoir exactement quoi chercher.</Title><Text style={s.copy}>Restaurants, bars, culture, beauté, services… combinez plusieurs envies en même temps.</Text></View>
        <View style={s.searchWrap}><Text style={s.searchIcon}>⌕</Text><TextInput accessibilityLabel="Rechercher un lieu ou une ville" placeholder="Lieu, ville ou adresse…" placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} style={s.search}/></View>
        <View style={s.filterHead}><Text style={s.filterTitle}>Filtrer par type</Text><Text style={s.filterMeta}>{activeLabel}</Text></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          <Pressable onPress={()=>setSelected([])} style={[s.chip,selected.length===0&&s.chipOn]}><Text style={[s.chipText,selected.length===0&&s.chipTextOn]}>Tout</Text></Pressable>
          {categories.map(category=>{const on=selected.includes(category.id);return <Pressable key={category.id} onPress={()=>toggle(category.id)} style={[s.chip,on&&s.chipOn]}><Text style={[s.check,on&&s.checkOn]}>{on?'✓':'+'}</Text><Text style={[s.chipText,on&&s.chipTextOn]}>{category.label}</Text></Pressable>})}
        </ScrollView>
        <Text style={s.tip}>Astuce : sélectionnez plusieurs catégories pour vous laisser inspirer.</Text>
      </View>}
    />
  </View>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:colors.canvas},list:{padding:20,paddingTop:58,paddingBottom:120},header:{gap:16,marginBottom:8},copy:{color:colors.muted,fontSize:15,lineHeight:22,marginTop:8},searchWrap:{height:56,borderRadius:radius.pill,backgroundColor:colors.white,borderWidth:1,borderColor:colors.border,flexDirection:'row',alignItems:'center',paddingHorizontal:17},searchIcon:{fontSize:24,color:colors.purple,marginRight:8},search:{flex:1,fontSize:16,color:colors.ink},filterHead:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12},filterTitle:{fontSize:14,fontWeight:'900',color:colors.ink},filterMeta:{fontSize:11,color:colors.muted},chips:{gap:8,paddingRight:10},chip:{minHeight:40,borderRadius:radius.pill,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,paddingHorizontal:13,flexDirection:'row',alignItems:'center',gap:6},chipOn:{backgroundColor:colors.purple,borderColor:colors.purple},chipText:{fontSize:13,fontWeight:'700',color:colors.ink},chipTextOn:{color:colors.white},check:{color:colors.purple,fontWeight:'900'},checkOn:{color:colors.white},tip:{fontSize:12,color:colors.muted,marginTop:-4}});
