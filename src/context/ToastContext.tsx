import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Toast } from '@/components/Toast';
import {
  showToast as showToastStore,
  useToastStore,
  type ToastPayload,
} from './toastStore';

export type { ToastItem, ToastPayload, ToastType } from './toastStore';
export { showToast } from './toastStore';

export type ToastContextValue = {
  showToast: (payload: ToastPayload) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const current = useToastStore((state) => state.current);
  const hideToast = useToastStore((state) => state.hideToast);

  const showToastFn = useCallback((payload: ToastPayload): void => {
    showToastStore(payload);
  }, []);

  const value = useMemo(
    (): ToastContextValue => ({
      showToast: showToastFn,
    }),
    [showToastFn],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={current} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (value === null) {
    throw new Error('useToast は ToastProvider の内側で使ってください。');
  }

  return value;
}
