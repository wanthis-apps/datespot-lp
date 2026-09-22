import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export type ToastPayload = {
  message: string;
  type: ToastType;
  durationMs?: number;
};

export type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  durationMs: number;
};

const DEFAULT_DURATION_MS = 3200;

type ToastState = {
  current: ToastItem | null;
  showToast: (payload: ToastPayload) => void;
  hideToast: () => void;
};

let toastSeq = 0;

export const useToastStore = create<ToastState>((set) => ({
  current: null,
  showToast: (payload) => {
    const message = payload.message.trim();
    if (message === '') {
      return;
    }

    toastSeq += 1;
    set({
      current: {
        id: toastSeq,
        message,
        type: payload.type,
        durationMs: payload.durationMs ?? DEFAULT_DURATION_MS,
      },
    });
  },
  hideToast: () => {
    set({ current: null });
  },
}));

export function showToast(payload: ToastPayload): void {
  useToastStore.getState().showToast(payload);
}
