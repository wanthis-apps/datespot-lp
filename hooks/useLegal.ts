import { useEffect, useMemo, useState } from 'react';

export type LegalTab = 'terms' | 'privacy';

export type LegalBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullets'; items: string[] };

export type LegalDocument = {
  tab: LegalTab;
  title: string;
  effectiveDate: string;
  revisedDate: string;
  blocks: LegalBlock[];
};

export const LEGAL_TABS: ReadonlyArray<{ value: LegalTab; label: string }> = [
  { value: 'terms', label: '利用規約' },
  { value: 'privacy', label: 'プライバシーポリシー' },
];

export const LEGAL_DOCUMENTS: Record<LegalTab, LegalDocument> = {
  terms: {
    tab: 'terms',
    title: '利用規約',
    effectiveDate: '2026年4月1日',
    revisedDate: '2026年9月1日',
    blocks: [
      {
        type: 'heading',
        text: '第1条（適用）',
      },
      {
        type: 'paragraph',
        text: '本規約は、DateSpot-app（以下「本アプリ」）の利用条件を定めるものです。ユーザーは本アプリを利用することで、本規約に同意したものとみなします。',
      },
      {
        type: 'heading',
        text: '第2条（サービスの内容）',
      },
      {
        type: 'paragraph',
        text: '本アプリは、デートスポットの検索・閲覧、クーポン、お気に入り、プラン作成などの案内機能を提供します。',
      },
      {
        type: 'bullets',
        items: [
          '掲載情報は参考情報であり、営業時間・料金・空席は各店舗の最新情報をご確認ください。',
          '予約やクーポン利用は、提携先または店舗の条件に従います。',
          '通信環境や端末の状態により、一部機能が利用できない場合があります。',
        ],
      },
      {
        type: 'heading',
        text: '第3条（アカウント）',
      },
      {
        type: 'bullets',
        items: [
          'ユーザーは、正確な情報を登録し、自己の責任でアカウントを管理します。',
          '第三者へのアカウント貸与、なりすましは禁止します。',
          'ゲスト利用時の端末内データは、ログイン後に引き継がれない場合があります。',
        ],
      },
      {
        type: 'heading',
        text: '第4条（禁止事項）',
      },
      {
        type: 'bullets',
        items: [
          '法令または公序良俗に反する行為',
          '虚偽の口コミ投稿、不正な評価操作',
          '本アプリの運営を妨害する行為、無断での情報転載',
        ],
      },
      {
        type: 'heading',
        text: '第5条（免責）',
      },
      {
        type: 'paragraph',
        text: '店舗情報の誤り、クーポンの利用条件変更、通信障害などにより生じた損害について、当社は法令で認められる範囲を除き責任を負いません。',
      },
    ],
  },
  privacy: {
    tab: 'privacy',
    title: 'プライバシーポリシー',
    effectiveDate: '2026年4月1日',
    revisedDate: '2026年9月1日',
    blocks: [
      {
        type: 'heading',
        text: '1. 収集する情報',
      },
      {
        type: 'paragraph',
        text: '本アプリは、サービスの提供に必要な範囲で次の情報を取り扱います。',
      },
      {
        type: 'bullets',
        items: [
          'アカウント情報（メールアドレス、表示名）',
          'お気に入り、閲覧履歴、口コミ、プランなどの利用データ',
          'クーポン利用履歴、端末内の表示設定（テーマ等）',
        ],
      },
      {
        type: 'heading',
        text: '2. 利用目的',
      },
      {
        type: 'bullets',
        items: [
          'スポット案内、クーポン、プラン機能の提供',
          'お知らせ・キャンペーンの表示',
          '不具合対応、不正利用の防止、サービス改善',
        ],
      },
      {
        type: 'heading',
        text: '3. 保管と共有',
      },
      {
        type: 'paragraph',
        text: 'ログイン時のデータは Supabase 上に保存され、端末内の一部データは AsyncStorage に保持されます。法令に基づく場合を除き、本人の同意なく第三者に提供しません。',
      },
      {
        type: 'heading',
        text: '4. ユーザーの権利',
      },
      {
        type: 'bullets',
        items: [
          '表示名などのプロフィールはマイページから変更できます。',
          'アカウント削除やデータの開示を希望する場合は、運営までお問い合わせください。',
          '「次回から表示しない」などの選択は、端末内に保存されます。',
        ],
      },
      {
        type: 'heading',
        text: '5. お問い合わせ',
      },
      {
        type: 'paragraph',
        text: '本ポリシーに関するお問い合わせは、アプリ内のヘルプ・よくある質問、または運営が指定する窓口までご連絡ください。',
      },
    ],
  },
};

export type UseLegalResult = {
  tab: LegalTab;
  setTab: (tab: LegalTab) => void;
  document: LegalDocument;
  tabs: typeof LEGAL_TABS;
};

export function useLegal(initialTab: LegalTab = 'terms'): UseLegalResult {
  const [tab, setTab] = useState<LegalTab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const document = useMemo(() => LEGAL_DOCUMENTS[tab], [tab]);

  return {
    tab,
    setTab,
    document,
    tabs: LEGAL_TABS,
  };
}
