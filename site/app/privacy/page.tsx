import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "DateSpot が取得する位置情報、アカウント情報、お気に入りなどの利用目的と、削除の申し出方法です。",
};

const collected = [
  {
    name: "位置情報",
    detail:
      "アプリの使用中に、端末の緯度と経度を取得します。スポットまでの距離と、現在地を中心にした地図表示に使います。バックグラウンドでは取得しません。許可しなくても、スポットの一覧と詳細は閲覧できます。",
  },
  {
    name: "アカウント情報",
    detail:
      "新規登録とログインのとき、メールアドレスとパスワードを取得します。パスワードは認証基盤がハッシュ化して保管し、WANTHIS が平文で預かりません。ゲスト利用では、メールアドレスのない匿名の識別子を発行する場合があります。",
  },
  {
    name: "利用コンテンツ",
    detail:
      "お気に入りにしたスポット、プランのタイトルとメモ、レビューの表示名・評価・本文、クーポンの利用履歴、通知のオンオフ、お問い合わせの件名・本文・連絡用メールアドレスを、操作または送信のときに保存します。",
  },
  {
    name: "退会に関する記録",
    detail:
      "アカウント削除を申請したとき、選んだ理由と申請の事実を受け付けます。申請対応と不正な再登録の防止以外には使いません。",
  },
  {
    name: "端末内に残る情報",
    detail:
      "ログイン状態と、お気に入りの一時的な控えを端末内に保存します。これは同じ端末でアプリを開いたときに、ログインと表示を続けるためです。",
  },
] as const;

const purposes = [
  "スポットまでの距離と地図を表示するため",
  "アカウントを作成し、ログイン状態を維持し、本人のデータを同期するため",
  "お気に入り、プラン、レビュー、クーポン利用履歴を提供するため",
  "選んだ通知設定に沿って、クーポン期限などの案内を送るため",
  "問い合わせに回答し、アカウント削除の申請を処理するため",
  "不正利用を防ぎ、サービスの障害に対応するため",
] as const;

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14">
      <p className="break-keep text-sm tracking-[0.18em] text-rose">DateSpot</p>
      <h1 className="break-keep mt-3 text-3xl leading-10 text-foreground">プライバシーポリシー</h1>
      <p className="break-keep mt-4 text-sm leading-7 text-ink-soft">
        制定日 2026年10月3日。運営者は WANTHIS です。本方針は、第1弾アプリ DateSpot に適用します。
      </p>

      <section className="mt-10 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">取得する情報</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          DateSpot は、次の情報を、記載した目的の範囲で取得します。広告配信のためのアプリ横断トラッキングには使いません。個人情報を販売しません。
        </p>
        <ul className="flex flex-col gap-4">
          {collected.map((item) => (
            <li key={item.name} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="break-keep text-base leading-7">{item.name}</h3>
              <p className="break-keep mt-2 text-sm leading-7 text-ink-soft">{item.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">利用目的</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {purposes.map((purpose) => (
            <li key={purpose} className="break-keep text-base leading-8 text-ink-soft">
              {purpose}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">位置情報</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          位置情報は、アプリを前面で使っているあいだだけ利用します。常時取得や、画面を閉じたあとの追跡は行いません。端末の設定から許可を取り消せます。許可を取り消しても、アカウントとスポットの閲覧は継続できます。距離と現在地の表示だけが止まります。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">委託と国外での取り扱い</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          認証とデータベースの保管は Supabase に委託しています。地図の表示には Google の地図サービスを使い、地図を描くために必要な範囲で表示領域の情報が Google に送信されます。これらの事業者のサーバは日本国外にある場合があります。委託先には、本方針の目的の範囲を超えた利用をさせません。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">保存期間と安全管理</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          アカウントに紐づく情報は、アカウントが有効なあいだ保存します。削除申請を受けたあとは、30日以内に認証情報と、お気に入り、プラン、レビュー、クーポン利用履歴、お問い合わせ内容を削除します。退会申請の記録は、申請対応と不正防止のため最長90日保管したあと削除します。法令で保存が義務づけられる情報は、その期間に限り保管します。
        </p>
        <p className="break-keep text-base leading-8 text-ink-soft">
          通信は HTTPS で保護します。情報へアクセスできるのは、運用に必要な範囲の担当者です。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">開示・訂正・削除</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          ご自身の情報の開示、訂正、利用停止、削除を求めるときは、
          <a
            href="mailto:support@wanthis-apps.com"
            className="break-keep text-rose underline-offset-4 hover:underline"
          >
            support@wanthis-apps.com
          </a>
          までご連絡ください。アカウントそのものの削除手順は
          <Link href="/support" className="break-keep text-rose underline-offset-4 hover:underline">
            サポートページ
          </Link>
          に記載しています。申請にあたり、登録したメールアドレスからの送信で本人を確認します。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">16歳未満の方</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          DateSpot は16歳未満の方を対象にしていません。16歳未満の方の情報を取得したと判明した場合は、削除します。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">改定と連絡先</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          本方針を改定するときは、このページの制定日を更新します。取得する情報の種類や利用目的を大きく変えるときは、アプリ内でも知らせるよう努めます。
        </p>
        <p className="break-keep text-base leading-8 text-ink-soft">
          WANTHIS
          <br />
          <a
            href="mailto:support@wanthis-apps.com"
            className="break-keep text-rose underline-offset-4 hover:underline"
          >
            support@wanthis-apps.com
          </a>
        </p>
      </section>
    </main>
  );
}
