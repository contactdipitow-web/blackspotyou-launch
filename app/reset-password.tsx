import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Title } from '@/components/ui';
import { messageForError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme';

export default function ResetPassword(){
  const [password,setPassword]=useState(''),[confirmation,setConfirmation]=useState(''),[busy,setBusy]=useState(false);
  const submit=async()=>{if(password!==confirmation){Alert.alert('Les mots de passe diffèrent');return;}setBusy(true);try{const {error}=await supabase.auth.updateUser({password});if(error)throw error;Alert.alert('Mot de passe modifié','Vous pouvez continuer dans l’application.',[{text:'Continuer',onPress:()=>router.replace('/(tabs)')}]);}catch(error){Alert.alert('Modification impossible',messageForError(error));}finally{setBusy(false);}};
  return <View style={s.page}><Title>Nouveau mot de passe</Title><Text style={s.copy}>Choisissez au moins huit caractères.</Text><Field label="Nouveau mot de passe" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password"/><Field label="Confirmer le mot de passe" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoComplete="new-password"/><Button title={busy?'Modification…':'Enregistrer'} disabled={busy||password.length<8||confirmation.length<8} onPress={()=>void submit()}/></View>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:colors.canvas,padding:24,gap:10},copy:{color:colors.muted,lineHeight:22}});
