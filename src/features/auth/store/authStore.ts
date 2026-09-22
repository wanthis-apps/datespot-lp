import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/services/supabase';
import { useSpotFilterStore } from '@/features/spots/store/spotFilterStore';
import { ensureAnonymousSession, ensureAppUser } from '../api/session';

const GUEST_MODE_KEY = '@datespot/guest-mode';

type AuthStatus = 'idle' | 'loading' | 'ready' | 'error';

export type AuthActionResult = {
  ok: boolean;
  message: string;
};

type AuthState = {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  error: string | null;
  guestMode: boolean;
  hydrate: () => Promise<void>;
  continueAsGuest: () => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
};

let authListenerAttached = false;
let unsubscribeAuth: (() => void) | null = null;

function isAnonymousUser(user: User | null): boolean {
  return user?.is_anonymous === true;
}

async function readGuestMode(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_MODE_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

async function writeGuestMode(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(GUEST_MODE_KEY, enabled ? 'true' : 'false');
  } catch (error) {
    console.warn('[DateSpot] guestMode の保存に失敗', error);
  }
}

function attachAuthListener(): void {
  if (authListenerAttached) {
    return;
  }

  const client = getSupabaseClient();
  if (client === null) {
    return;
  }

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((event, session) => {
    const user = session?.user ?? null;
    useAuthStore.setState((state) => ({
      session,
      user,
      error: state.status === 'loading' ? state.error : null,
      status: state.status === 'loading' ? 'loading' : 'ready',
      guestMode: isAnonymousUser(user) ? true : state.guestMode,
    }));

    if (
      user !== null &&
      !isAnonymousUser(user) &&
      (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
    ) {
      const relationship =
        useSpotFilterStore.getState().relationship ?? 'first_date';
      void ensureAppUser(relationship);
    }

    console.log('[DateSpot] auth state', {
      event,
      userId: user?.id ?? null,
      anonymous: isAnonymousUser(user),
    });
  });

  unsubscribeAuth = () => {
    subscription.unsubscribe();
    authListenerAttached = false;
    unsubscribeAuth = null;
  };
  authListenerAttached = true;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  status: 'idle',
  error: null,
  guestMode: false,
  hydrate: async () => {
    if (get().status === 'loading') {
      return;
    }

    set({ status: 'loading', error: null });
    attachAuthListener();

    const storedGuestMode = await readGuestMode();
    const client = getSupabaseClient();
    if (client === null) {
      set({
        user: null,
        session: null,
        status: 'ready',
        error: null,
        guestMode: storedGuestMode,
      });
      return;
    }

    const { data, error } = await client.auth.getSession();
    if (error !== null) {
      set({
        user: null,
        session: null,
        status: 'error',
        error: error.message,
        guestMode: storedGuestMode,
      });
      return;
    }

    const session = data.session;
    const user = session?.user ?? null;
    const guestMode = storedGuestMode || isAnonymousUser(user);
    await writeGuestMode(guestMode);

    set({
      user,
      session,
      status: 'ready',
      error: null,
      guestMode,
    });
  },
  continueAsGuest: async () => {
    await writeGuestMode(true);
    set({ guestMode: true, error: null, status: 'ready' });

    const ensured = await ensureAnonymousSession();
    if (ensured.ok && ensured.user !== null) {
      const relationship =
        useSpotFilterStore.getState().relationship ?? 'first_date';
      await ensureAppUser(relationship);
      set({
        user: ensured.user,
        session: ensured.session,
        guestMode: true,
        status: 'ready',
        error: null,
      });
    }

    return { ok: true, message: 'ゲストとして利用を開始しました。' };
  },
  signIn: async (email, password) => {
    const client = getSupabaseClient();
    if (client === null) {
      return {
        ok: false,
        message: 'Supabase が未設定のためログインできません。',
      };
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });
    if (error !== null) {
      return { ok: false, message: error.message };
    }

    await writeGuestMode(false);
    set({
      user: data.user,
      session: data.session,
      guestMode: false,
      status: 'ready',
      error: null,
    });
    return { ok: true, message: 'ログインしました。' };
  },
  signUp: async (email, password) => {
    const client = getSupabaseClient();
    if (client === null) {
      return {
        ok: false,
        message: 'Supabase が未設定のため登録できません。',
      };
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
    });
    if (error !== null) {
      return { ok: false, message: error.message };
    }

    if (data.session === null || data.user === null) {
      return {
        ok: true,
        message: '確認メールを送信しました。メールを確認してからログインしてください。',
      };
    }

    await writeGuestMode(false);
    set({
      user: data.user,
      session: data.session,
      guestMode: false,
      status: 'ready',
      error: null,
    });
    return { ok: true, message: 'アカウントを作成しました。' };
  },
  signOut: async () => {
    const client = getSupabaseClient();
    if (client !== null) {
      await client.auth.signOut();
    }
    await writeGuestMode(false);
    set({
      user: null,
      session: null,
      guestMode: false,
      status: 'ready',
      error: null,
    });
  },
}));

export function detachAuthListener(): void {
  unsubscribeAuth?.();
}
