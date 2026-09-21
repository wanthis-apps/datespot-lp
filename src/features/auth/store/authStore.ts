import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/services/supabase';
import { useSpotFilterStore } from '@/features/spots/store/spotFilterStore';
import { ensureAnonymousSession, ensureAppUser } from '../api/session';

type AuthStatus = 'idle' | 'loading' | 'ready' | 'error';

type AuthState = {
  user: User | null;
  session: Session | null;
  status: AuthStatus;
  error: string | null;
  hydrate: () => Promise<void>;
};

let authListenerAttached = false;
let unsubscribeAuth: (() => void) | null = null;

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
    useAuthStore.setState((state) => ({
      session,
      user: session?.user ?? null,
      error: state.status === 'loading' ? state.error : null,
      status: state.status === 'loading' ? 'loading' : 'ready',
    }));

    if (
      session?.user !== undefined &&
      (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')
    ) {
      const relationship =
        useSpotFilterStore.getState().relationship ?? 'first_date';
      void ensureAppUser(relationship);
    }

    console.log('[DateSpot] auth state', {
      event,
      userId: session?.user.id ?? null,
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
  hydrate: async () => {
    if (get().status === 'loading') {
      return;
    }

    set({ status: 'loading', error: null });
    attachAuthListener();

    const result = await ensureAnonymousSession();
    if (!result.ok) {
      set({
        user: null,
        session: null,
        status: 'error',
        error: result.message,
      });
      console.warn('[DateSpot] セッション確保に失敗', result.message);
      return;
    }

    if (result.user !== null) {
      const relationship =
        useSpotFilterStore.getState().relationship ?? 'first_date';
      await ensureAppUser(relationship);
    }

    set({
      user: result.user,
      session: result.session,
      status: 'ready',
      error: null,
    });
  },
}));

export function detachAuthListener(): void {
  unsubscribeAuth?.();
}
