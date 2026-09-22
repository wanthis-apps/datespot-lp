import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Announcement = {
  id: string;
  title: string;
  body: string;
  imageUrl: string;
  ctaLabel: string;
};

export const CURRENT_ANNOUNCEMENT: Announcement = {
  id: 'campaign-weekend-coupon-2026-09',
  title: '週末限定クーポン配布中！',
  body: '対象店舗で使えるペア割・ドリンク特典を追加しました。今週末までの限定クーポンを、クーポン一覧からチェックしてみてください。',
  imageUrl:
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
  ctaLabel: 'クーポンを見る',
};

const DISMISSED_KEY = '@datespot/announcement-dismissed';

export type UseAnnouncementResult = {
  announcement: Announcement;
  visible: boolean;
  ready: boolean;
  close: () => void;
  hideNextTime: () => void;
};

export function useAnnouncement(): UseAnnouncementResult {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(DISMISSED_KEY).then((stored) => {
      setVisible(stored !== CURRENT_ANNOUNCEMENT.id);
      setReady(true);
    });
  }, []);

  const close = useCallback((): void => {
    setVisible(false);
  }, []);

  const hideNextTime = useCallback((): void => {
    setVisible(false);
    void AsyncStorage.setItem(DISMISSED_KEY, CURRENT_ANNOUNCEMENT.id);
  }, []);

  return {
    announcement: CURRENT_ANNOUNCEMENT,
    visible: ready && visible,
    ready,
    close,
    hideNextTime,
  };
}
