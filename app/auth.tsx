import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, Field, Title } from '@/components/ui';
import { messageForError } from '@/lib/errors';
import { supabase } from '@/lib/supabase';
import { colors } from '@/theme';

export default function Auth() {
  const [mode,setMode]=useState<'login'|'signup'|'forgot'>('login');
  const [email,setEmail]=useState(''), [password,setPassword]=useState(''), [busy,setBusy]=useState(false);
  const submit=async()=>{setBusy(true);try{
    if(mode==='forgot'){
      const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:'blackspotyou://reset-password'});
      if(error)throw error;
      Alert.alert('Email envoyé','Ouvrez le lien reçu sur ce téléphone pour choisir un nouveau mot de passe.');
      return;
    }
    const result=mode==='signup'
      ? await supabase.auth.signUp({email,password,options:{emailRedirectTo:'blackspotyou://auth-callback'}})
      : await supabase.auth.signInWithPassword({email,password});
    if(result.error)throw result.error;
    if(mode==='signup'&&!result.data.session)Alert.alert('Confirmez votre email','Un lien de confirmation vient de vous être envoyé.');
    else router.back();
  }catch(error){Alert.alert('Impossible de continuer',messageForError(error));}finally{setBusy(false);}};
  return <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} style={s.page}><ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled"><Title>{mode==='login'?'Bon retour':mode==='signup'?'Rejoindre la communauté':'Mot de passe oublié'}</Title><Text style={s.copy}>Votre session est chiffrée par le stockage sécurisé du téléphone. Aucun mot de passe n’est conservé.</Text><Field label="Adresse email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email"/>{mode!=='forgot'&&<Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry autoComplete={mode==='signup'?'new-password':'current-password'}/>}<Button title={busy?'Patientez…':mode==='login'?'Se connecter':mode==='signup'?'Créer mon compte':'Envoyer le lien'} disabled={busy||!email||(mode!=='forgot'&&password.length<8)} onPress={()=>void submit()}/><Button title={mode==='signup'?'J’ai déjà un compte':'Créer un compte'} variant="secondary" onPress={()=>setMode(mode==='signup'?'login':'signup')}/>{mode==='login'&&<Button title="Mot de passe oublié" variant="secondary" onPress={()=>setMode('forgot')}/>}</ScrollView></KeyboardAvoidingView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:colors.canvas},content:{padding:24,paddingTop:36,gap:8},copy:{color:colors.muted,lineHeight:22,marginBottom:14}});
