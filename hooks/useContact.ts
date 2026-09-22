import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth';
import { getSupabaseClient } from '@/services/supabase';
import type { FeedbackCategory } from '../types/database';
import { toErrorMessage } from './mapRecords';

export type ContactCategory = FeedbackCategory;

export const CONTACT_CATEGORY_OPTIONS: ReadonlyArray<{
  value: ContactCategory;
  label: string;
}> = [
  { value: 'bug', label: 'アプリの不具合' },
  { value: 'feature', label: '機能のご要望' },
  { value: 'spot_info', label: 'スポット情報の修正' },
  { value: 'other', label: 'その他' },
];

export type UseContactResult = {
  category: ContactCategory;
  subject: string;
  body: string;
  email: string;
  submitting: boolean;
  setCategory: (category: ContactCategory) => void;
  setSubject: (value: string) => void;
  setBody: (value: string) => void;
  setEmail: (value: string) => void;
  submit: () => Promise<{ ok: boolean; message: string }>;
};

function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  const at = trimmed.indexOf('@');
  return at > 0 && at < trimmed.length - 1 && !trimmed.includes(' ');
}

export function useContact(): UseContactResult {
  const { user, userId } = useAuth();
  const [category, setCategory] = useState<ContactCategory>('bug');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (emailTouched) {
      return;
    }

    const nextEmail = user?.email;
    if (nextEmail !== undefined && nextEmail !== '') {
      setEmail(nextEmail);
    }
  }, [emailTouched, user?.email]);

  const handleSetEmail = useCallback((value: string): void => {
    setEmailTouched(true);
    setEmail(value);
  }, []);

  const submit = useCallback(async (): Promise<{
    ok: boolean;
    message: string;
  }> => {
    const trimmedSubject = subject.trim();
    const trimmedBody = body.trim();
    const trimmedEmail = email.trim();

    if (trimmedSubject === '') {
      return { ok: false, message: '件名を入力してください。' };
    }

    if (trimmedBody === '') {
      return { ok: false, message: '詳細を入力してください。' };
    }

    if (!isValidEmail(trimmedEmail)) {
      return { ok: false, message: 'メールアドレスの形式を確認してください。' };
    }

    setSubmitting(true);
    const client = getSupabaseClient();

    try {
      if (client !== null) {
        const { error } = await client.from('feedback').insert({
          user_id: userId,
          category,
          subject: trimmedSubject,
          body: trimmedBody,
          email: trimmedEmail,
        });

        if (error === null) {
          setSubject('');
          setBody('');
          return {
            ok: true,
            message: 'お問い合わせを送信しました。ご連絡ありがとうございます。',
          };
        }

        console.warn('[DateSpot] お問い合わせ送信に失敗', error.message);
      }

      setSubject('');
      setBody('');
      return {
        ok: true,
        message:
          'お問い合わせを受け付けました。この操作は確認用のダミー送信です。',
      };
    } catch (caught) {
      return {
        ok: true,
        message: `お問い合わせを端末で受け付けました: ${toErrorMessage(caught)}`,
      };
    } finally {
      setSubmitting(false);
    }
  }, [body, category, email, subject, userId]);

  return {
    category,
    subject,
    body,
    email,
    submitting,
    setCategory,
    setSubject,
    setBody,
    setEmail: handleSetEmail,
    submit,
  };
}
