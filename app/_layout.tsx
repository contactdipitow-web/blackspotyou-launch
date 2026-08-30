import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/contexts/AuthContext';
import { colors } from '@/theme';
export default function RootLayout(){return <SafeAreaProvider><AuthProvider><StatusBar style="dark"/><Stack screenOptions={{headerTintColor:colors.purpleDark,headerBackTitle:'Retour',contentStyle:{backgroundColor:colors.canvas}}}><Stack.Screen name="index" options={{headerShown:false}}/><Stack.Screen name="(tabs)" options={{headerShown:false}}/><Stack.Screen name="auth" options={{title:'Votre compte',presentation:'modal'}}/><Stack.Screen name="auth-callback" options={{headerShown:false}}/><Stack.Screen name="reset-password" options={{title:'Nouveau mot de passe'}}/><Stack.Screen name="propose" options={{title:'Proposer un lieu'}}/><Stack.Screen name="bcoins" options={{title:'B-coins'}}/><Stack.Screen name="admin" options={{title:'Administration'}}/><Stack.Screen name="place/[slug]" options={{title:'Lieu'}}/><Stack.Screen name="report/[id]" options={{title:'Signaler'}}/></Stack></AuthProvider></SafeAreaProvider>}
