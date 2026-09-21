import { useCallback, useEffect } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { useAuthStore } from '../store/authStore';

export type UseAuthResult = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  userId: string | null;
  reload: () => Promise<void>;
};

export function useAuth(): UseAuthResult {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const status = useAuthStore((state) => state.status);
  const error = useAuthStore((state) => state.error);
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    if (status === 'idle') {
      void hydrate();
    }
  }, [hydrate, status]);

  const reload = useCallback(async () => {
    await hydrate();
  }, [hydrate]);

  return {
    user,
    session,
    isLoading: status === 'idle' || status === 'loading',
    isReady: status === 'ready',
    error,
    userId: user?.id ?? null,
    reload,
  };
}
