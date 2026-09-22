import { useCallback, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { DeleteAccountReason } from '../../../../types/database';
import { useAuthStore, type AuthActionResult } from '../store/authStore';

export type UseAuthResult = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  userId: string | null;
  isGuest: boolean;
  isEmailUser: boolean;
  needsAuth: boolean;
  reload: () => Promise<void>;
  continueAsGuest: () => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  deleteAccount: (reason: DeleteAccountReason) => Promise<AuthActionResult>;
};

function isEmailUser(user: User | null): boolean {
  return user !== null && user.is_anonymous !== true && user.email !== undefined;
}

export function useAuth(): UseAuthResult {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const guestMode = useAuthStore((state) => state.guestMode);
  const hydrate = useAuthStore((state) => state.hydrate);
  const continueAsGuest = useAuthStore((state) => state.continueAsGuest);
  const signIn = useAuthStore((state) => state.signIn);
  const signUp = useAuthStore((state) => state.signUp);
  const signOut = useAuthStore((state) => state.signOut);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  useEffect(() => {
    if (status === 'idle') {
      void hydrate();
    }
  }, [hydrate, status]);

  const reload = useCallback(async () => {
    await hydrate();
  }, [hydrate]);

  const emailUser = isEmailUser(user);
  const isReady = status === 'ready' || status === 'error';

  return {
    user,
    session,
    isLoading: status === 'idle' || status === 'loading',
    isReady,
    error,
    userId: user?.id ?? null,
    isGuest: guestMode && !emailUser,
    isEmailUser: emailUser,
    needsAuth: isReady && !emailUser && !guestMode,
    reload,
    continueAsGuest,
    signIn,
    signUp,
    signOut,
    deleteAccount,
  };
}
