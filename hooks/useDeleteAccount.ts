import { useCallback, useState } from 'react';
import { useAuth } from '@/features/auth';
import type { DeleteAccountReason } from '../types/database';

export const DELETE_ACCOUNT_REASONS: ReadonlyArray<{
  value: DeleteAccountReason;
  label: string;
}> = [
  { value: 'not_using', label: 'あまり使わなくなった' },
  { value: 'privacy', label: 'プライバシーが心配' },
  { value: 'missing_spots', label: '欲しいスポットが少ない' },
  { value: 'too_many_notifications', label: '通知が多い' },
  { value: 'other', label: 'その他' },
];

export type UseDeleteAccountResult = {
  reason: DeleteAccountReason | null;
  deleting: boolean;
  setReason: (reason: DeleteAccountReason) => void;
  reset: () => void;
  confirmDelete: () => Promise<{ ok: boolean; message: string }>;
};

export function useDeleteAccount(): UseDeleteAccountResult {
  const { deleteAccount } = useAuth();
  const [reason, setReason] = useState<DeleteAccountReason | null>(null);
  const [deleting, setDeleting] = useState(false);

  const reset = useCallback((): void => {
    setReason(null);
    setDeleting(false);
  }, []);

  const confirmDelete = useCallback(async (): Promise<{
    ok: boolean;
    message: string;
  }> => {
    if (reason === null) {
      return { ok: false, message: '退会理由を選択してください。' };
    }

    setDeleting(true);
    try {
      return await deleteAccount(reason);
    } finally {
      setDeleting(false);
    }
  }, [deleteAccount, reason]);

  return {
    reason,
    deleting,
    setReason,
    reset,
    confirmDelete,
  };
}
