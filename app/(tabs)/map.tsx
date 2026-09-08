import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect,useMemo,useRef,useState } from 'react';
import { Platform,Pressable,StyleSheet,Text,View } from 'react-native';
import MapView,{Circle,Marker,type Region} from 'react-native-maps';
import { BrandHeader } from '@/components/BrandHeader';
import { Button,Loading } from '@/components/ui';
import { listPlaces } from '@/services/places';
import { colors,radius,shadow } from '@/theme';
import type { Establishment } from '@/types';

type Point={latitude:number;longitude:number};
const INITIAL:Region={latitude:48.8566,longitude:2.3522,latitudeDelta:.18,longitudeDelta:.18};
const RADII=[100,250,500,1000,2000] as const;
function distance(a:Point,b:Point){const R=6371000;const dLat=(b.latitude-a.latitude)*Math.PI/180;const dLon=(b.longitude-a.longitude)*Math.PI/180;const la1=a.latitude*Math.PI/180;const la2=b.latitude*Math.PI/180;const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h));}
function radiusLabel(value:number){return value>=1000?`${value/1000} km`:`${value} m`}
export default function MapScreen(){
  const [places,setPlaces]=useState<Establishment[]>([]); const [region,setRegion]=useState<Region>(INITIAL); const [userPoint,setUserPoint]=useState<Point|null>(null); const [selectedRadius,setSelectedRadius]=useState<number>(500); const [loading,setLoading]=useState(true); const [locating,setLocating]=useState(false); const mapRef=useRef<MapView|null>(null); const watchRef=useRef<Location.LocationSubscription|null>(null);
  useEffect(()=>{listPlaces({limit:100}).then(setPlaces).finally(()=>setLoading(false));return()=>watchRef.current?.remove()},[]);
  const nearby=useMemo(()=>userPoint?places.filter(p=>distance(userPoint,{latitude:p.latitude,longitude:p.longitude})<=selectedRadius):[],[places,userPoint,selectedRadius]);
  const apply=(p:Point)=>{setUserPoint(p);const next={...p,latitudeDelta:.012,longitudeDelta:.012};setRegion(next);mapRef.current?.animateToRegion(next,550)};
  const changeRadius=(value:number)=>{setSelectedRadius(value);if(userPoint){const delta=Math.max(.004,value/42000);const next={...userPoint,latitudeDelta:delta,longitudeDelta:delta};setRegion(next);mapRef.current?.animateToRegion(next,350)}};
  const locate=async()=>{setLocating(true);try{const permission=await Location.requestForegroundPermissionsAsync();if(permission.status!=='granted')return;const current=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Highest});apply({latitude:current.coords.latitude,longitude:current.coords.longitude});watchRef.current?.remove();watchRef.current=await Location.watchPositionAsync({accuracy:Location.Accuracy.Highest,distanceInterval:20,timeInterval:6000},next=>apply({latitude:next.coords.latitude,longitude:next.coords.longitude}));}finally{setLocating(false)}};
  if(Platform.OS==='web')return <View style={s.fallback}><Text style={s.title}>La carte de proximité est disponible sur iOS et Android.</Text><Button title="Rechercher manuellement" onPress={()=>router.push('/(tabs)/explore')}/></View>;
  if(loading)return <Loading/>;
  return <View style={s.page}>
    <MapView ref={mapRef} style={StyleSheet.absoluteFill} region={region} onRegionChangeComplete={setRegion} showsUserLocation showsCompass>
      {userPoint?<Circle center={userPoint} radius={selectedRadius} strokeColor={colors.purple} fillColor="rgba(109,40,217,.12)" strokeWidth={2}/>:null}
      {places.map(p=>{const isNear=Boolean(userPoint&&distance(userPoint,{latitude:p.latitude,longitude:p.longitude})<=selectedRadius);return <Marker key={p.id} coordinate={{latitude:p.latitude,longitude:p.longitude}} title={p.name} description={isNear?`À moins de ${radiusLabel(selectedRadius)}`:p.city} pinColor={isNear?colors.purple:colors.muted} onCalloutPress={()=>router.push({pathname:'/place/[slug]',params:{slug:p.slug}})}/>})}
    </MapView>
    <View style={s.brand}><BrandHeader compact/></View>
    {userPoint?<View style={s.panel}><View style={s.nearby}><Text style={s.nearbyNumber}>{nearby.length}</Text><View style={s.nearbyText}><Text style={s.nearbyTitle}>spot{nearby.length>1?'s':''} dans un rayon de {radiusLabel(selectedRadius)}</Text><Text style={s.nearbyCopy}>Choisissez votre périmètre.</Text></View></View><View style={s.radiusRow}>{RADII.map(value=><Pressable key={value} onPress={()=>changeRadius(value)} style={[s.radiusChip,selectedRadius===value&&s.radiusChipActive]}><Text style={[s.radiusChipText,selectedRadius===value&&s.radiusChipTextActive]}>{radiusLabel(value)}</Text></Pressable>)}</View></View>:null}
    <View style={s.button}><Button title={locating?'Localisation…':'Me localiser précisément'} disabled={locating} onPress={()=>void locate()}/></View>
  </View>
}
const s=StyleSheet.create({page:{flex:1},brand:{position:'absolute',top:54,left:16,right:16,backgroundColor:'rgba(255,255,255,.94)',borderRadius:radius.pill,paddingHorizontal:14,paddingVertical:10,...shadow},panel:{position:'absolute',top:112,left:16,right:16,backgroundColor:'rgba(15,13,18,.94)',borderRadius:radius.lg,padding:14,gap:12},nearby:{flexDirection:'row',alignItems:'center',gap:12},nearbyText:{flex:1},nearbyNumber:{width:42,height:42,lineHeight:42,textAlign:'center',borderRadius:21,overflow:'hidden',backgroundColor:colors.purple,color:colors.white,fontSize:20,fontWeight:'900'},nearbyTitle:{color:colors.white,fontWeight:'800',fontSize:13},nearbyCopy:{color:'rgba(255,255,255,.65)',fontSize:11,marginTop:2},radiusRow:{flexDirection:'row',gap:6},radiusChip:{flex:1,paddingVertical:8,borderRadius:999,backgroundColor:'rgba(255,255,255,.10)',alignItems:'center'},radiusChipActive:{backgroundColor:colors.purple},radiusChipText:{fontSize:10.5,fontWeight:'800',color:'rgba(255,255,255,.72)'},radiusChipTextActive:{color:colors.white},button:{position:'absolute',left:20,right:20,bottom:24},fallback:{flex:1,padding:30,justifyContent:'center',gap:20,backgroundColor:colors.canvas},title:{fontSize:24,fontWeight:'800',color:colors.ink}});
