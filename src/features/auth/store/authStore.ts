import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/services/supabase';
import { useSpotFilterStore } from '@/features/spots/store/spotFilterStore';
import type { DeleteAccountReason } from '../../../../types/database';
import { useFavoriteStore } from '@/features/spots/store/favoriteStore';
import { ensureAnonymousSession, ensureAppUser } from '../api/session';

const GUEST_MODE_KEY = '@datespot/guest-mode';

type AuthStatus = 'idle' | 'loading' | 'ready' | 'error';

export type AuthActionResult = {
  ok: boolean;
  message: string;
};

export type MockAuthMode = 'guest' | 'signed_in';

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
  deleteAccount: (reason: DeleteAccountReason) => Promise<AuthActionResult>;
  setMockAuth: (mode: MockAuthMode) => Promise<void>;
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

function createMockDevUser(): User {
  const now = new Date().toISOString();
  return {
    id: '00000000-0000-4000-8000-000000000099',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'dev@datespot.app',
    email_confirmed_at: now,
    phone: '',
    confirmed_at: now,
    last_sign_in_at: now,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { full_name: 'Dev User' },
    identities: [],
    created_at: now,
    updated_at: now,
    is_anonymous: false,
  } as User;
}

function createMockDevSession(user: User): Session {
  return {
    access_token: 'dev-mock-access-token',
    refresh_token: 'dev-mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user,
  } as Session;
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

    const client = getSupabaseClient();
    const [storedGuestMode, sessionResult] = await Promise.all([
      readGuestMode(),
      client === null
        ? Promise.resolve(null)
        : client.auth.getSession(),
    ]);

    if (sessionResult === null) {
      set({
        user: null,
        session: null,
        status: 'ready',
        error: null,
        guestMode: storedGuestMode,
      });
      return;
    }

    const { data, error } = sessionResult;
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
    set({
      user,
      session,
      status: 'ready',
      error: null,
      guestMode,
    });
    void writeGuestMode(guestMode);
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
    await useFavoriteStore.getState().clearLocal();
    set({
      user: null,
      session: null,
      guestMode: false,
      status: 'ready',
      error: null,
    });
  },
  deleteAccount: async (reason) => {
    const client = getSupabaseClient();
    const userId = get().user?.id ?? null;
    const remoteUserId =
      userId !== null &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId,
      )
        ? userId
        : null;

    if (client !== null) {
      try {
        await client.from('account_deletions').insert({
          user_id: remoteUserId,
          reason,
        });
      } catch (error) {
        console.warn('[DateSpot] 退会理由の保存に失敗', error);
      }

      if (remoteUserId !== null) {
        try {
          await client.from('users').delete().eq('id', remoteUserId);
        } catch (error) {
          console.warn('[DateSpot] ユーザー行の削除に失敗', error);
        }
      }

      const { error: signOutError } = await client.auth.signOut();
      if (signOutError !== null) {
        console.warn('[DateSpot] 退会後のサインアウトに失敗', signOutError.message);
      }
    }

    await writeGuestMode(false);
    await useFavoriteStore.getState().clearLocal();
    set({
      user: null,
      session: null,
      guestMode: false,
      status: 'ready',
      error: null,
    });

    return {
      ok: true,
      message:
        client === null
          ? 'この端末のセッションを終了し、ログイン画面に戻ります。'
          : 'アカウントを削除し、セッションを終了しました。',
    };
  },
  setMockAuth: async (mode) => {
    if (mode === 'guest') {
      await writeGuestMode(true);
      set({
        user: null,
        session: null,
        guestMode: true,
        status: 'ready',
        error: null,
      });
      return;
    }

    const user = createMockDevUser();
    await writeGuestMode(false);
    set({
      user,
      session: createMockDevSession(user),
      guestMode: false,
      status: 'ready',
      error: null,
    });
  },
}));

export function detachAuthListener(): void {
  unsubscribeAuth?.();
}
