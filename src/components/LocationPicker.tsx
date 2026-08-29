import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button, Field } from '@/components/ui';
import { colors, radius } from '@/theme';

type Point = { latitude: number; longitude: number };
export function LocationPicker({ value, onChange }: { value: Point | null; onChange: (point: Point) => void }) {
  const [manualLatitude,setManualLatitude]=useState(value ? String(value.latitude) : '');
  const [manualLongitude,setManualLongitude]=useState(value ? String(value.longitude) : '');
  const locate=async()=>{const permission=await Location.requestForegroundPermissionsAsync();if(permission.status!=='granted'){Alert.alert('Position non autorisée','Vous pouvez sélectionner l’emplacement manuellement.');return;}const location=await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced});onChange({latitude:location.coords.latitude,longitude:location.coords.longitude});};
  const applyManual=()=>{const latitude=Number(manualLatitude),longitude=Number(manualLongitude);if(!Number.isFinite(latitude)||!Number.isFinite(longitude)||latitude < -90||latitude > 90||longitude < -180||longitude > 180){Alert.alert('Coordonnées invalides');return;}onChange({latitude,longitude});};
  if (Platform.OS==='web') return <View><Field label="Latitude" value={manualLatitude} onChangeText={setManualLatitude}/><Field label="Longitude" value={manualLongitude} onChangeText={setManualLongitude}/><Button title="Valider les coordonnées" variant="secondary" onPress={applyManual}/></View>;
  const region={latitude:value?.latitude??48.8566,longitude:value?.longitude??2.3522,latitudeDelta:.08,longitudeDelta:.08};
  return <View style={s.wrap}><MapView accessibilityLabel="Sélectionner l’emplacement du lieu" style={s.map} initialRegion={region} onLongPress={event=>onChange(event.nativeEvent.coordinate)}>{value&&<Marker coordinate={value} draggable onDragEnd={event=>onChange(event.nativeEvent.coordinate)} pinColor={colors.purple}/>}</MapView><Text style={s.help}>Appui long sur la carte pour placer le repère, puis faites-le glisser si nécessaire.</Text><Button title="Utiliser ma position" variant="secondary" onPress={()=>void locate()}/></View>;
}
const s=StyleSheet.create({wrap:{gap:8},map:{height:240,borderRadius:radius.lg},help:{color:colors.muted,fontSize:13,lineHeight:19}});
