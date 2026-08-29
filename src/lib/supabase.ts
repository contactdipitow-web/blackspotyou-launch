import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) console.warn('Configuration Supabase manquante. Copiez .env.example vers .env.');

const chunkCountKey = (keyName: string) => `${keyName}.chunks`;
const chunkItemKey = (keyName: string, index: number) => `${keyName}.part.${index}`;

const secureSessionStorage = {
  async getItem(keyName: string) {
    const count = Number(await SecureStore.getItemAsync(chunkCountKey(keyName)) ?? 0);
    if (!count) return null;
    const chunks = await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(chunkItemKey(keyName, index))));
    return chunks.every(Boolean) ? chunks.join('') : null;
  },
  async setItem(keyName: string, value: string) {
    await this.removeItem(keyName);
    const chunks = value.match(/[\s\S]{1,1800}/g) ?? [];
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(chunkItemKey(keyName, index), chunk, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY })));
    await SecureStore.setItemAsync(chunkCountKey(keyName), String(chunks.length), { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  },
  async removeItem(keyName: string) {
    const count = Number(await SecureStore.getItemAsync(chunkCountKey(keyName)) ?? 0);
    await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(chunkItemKey(keyName, index))));
    await SecureStore.deleteItemAsync(chunkCountKey(keyName));
  },
};

export const supabase = createClient(url ?? 'https://invalid.local', key ?? 'missing', {
  auth: {
    storage: secureSessionStorage,
    flowType: 'pkce',
    autoRefreshToken: true, persistSession: true, detectSessionInUrl: false,
  },
  global: { headers: { 'X-Client-Info': 'blackspot-you-mobile/1.0.0' } },
});
