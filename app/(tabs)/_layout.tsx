import { Tabs } from 'expo-router';
import { StyleSheet,Text,View } from 'react-native';
import { colors } from '@/theme';
function Icon({glyph,focused}:{glyph:string;focused:boolean}){return <View style={[s.icon,focused&&s.iconOn]}><Text style={[s.glyph,focused&&s.glyphOn]}>{glyph}</Text></View>}
export default function TabsLayout(){return <Tabs screenOptions={{headerShown:false,tabBarActiveTintColor:colors.purple,tabBarInactiveTintColor:colors.muted,tabBarLabelStyle:{fontSize:10.5,fontWeight:'700',paddingBottom:5},tabBarStyle:{height:86,paddingTop:7,borderTopColor:colors.border,backgroundColor:colors.white}}}>
  <Tabs.Screen name="index" options={{title:'Accueil',tabBarIcon:({focused})=><Icon glyph="⌂" focused={focused}/>}}/>
  <Tabs.Screen name="explore" options={{title:'Explorer',tabBarIcon:({focused})=><Icon glyph="⌕" focused={focused}/>}}/>
  <Tabs.Screen name="spotlight" options={{title:'À la une',tabBarIcon:({focused})=><Icon glyph="✦" focused={focused}/>}}/>
  <Tabs.Screen name="map" options={{title:'Autour de moi',tabBarIcon:({focused})=><Icon glyph="◎" focused={focused}/>}}/>
  <Tabs.Screen name="profile" options={{title:'Profil',tabBarIcon:({focused})=><Icon glyph="●" focused={focused}/>}}/>
</Tabs>}
const s=StyleSheet.create({icon:{width:31,height:31,borderRadius:12,alignItems:'center',justifyContent:'center'},iconOn:{backgroundColor:colors.lilac},glyph:{fontSize:18,color:colors.muted,fontWeight:'900'},glyphOn:{color:colors.purpleDark}});
