import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getRole } from '@/services/account';
import type { AppRole } from '@/types';

type AuthValue = { session: Session | null; user: User | null; role: AppRole; loading: boolean; signOut: () => Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null); const [role, setRole] = useState<AppRole>('member'); const [loading, setLoading] = useState(true);
  useEffect(() => {
    const handleUrl = async (incomingUrl: string | null) => {
      if (!incomingUrl?.startsWith('blackspotyou://')) return;
      const parsed = new URL(incomingUrl.replace('#', '?'));
      const code = parsed.searchParams.get('code');
      const accessToken = parsed.searchParams.get('access_token');
      const refreshToken = parsed.searchParams.get('refresh_token');
      if (code) await supabase.auth.exchangeCodeForSession(code);
      else if (accessToken && refreshToken) await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      router.replace(parsed.hostname === 'reset-password' ? '/reset-password' : '/(tabs)');
    };
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    void Linking.getInitialURL().then(handleUrl);
    const linkingSubscription = Linking.addEventListener('url', ({ url }) => { void handleUrl(url); });
    const { data } = supabase.auth.onAuthStateChange((event, next) => { setSession(next); if (event === 'PASSWORD_RECOVERY') router.replace('/reset-password'); });
    return () => { data.subscription.unsubscribe(); linkingSubscription.remove(); };
  }, []);
  useEffect(() => { if (session?.user.id) void getRole(session.user.id).then(setRole); else setRole('member'); }, [session?.user.id]);
  const value = useMemo(() => ({ session, user: session?.user ?? null, role, loading, signOut: async () => { await supabase.auth.signOut(); } }), [session, role, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider manquant'); return value; }
