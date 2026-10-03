import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "DateSpot における位置情報、端末情報、お気に入りの取り扱い、Supabase での認証と保存、第三者提供の有無、お問い合わせ先です。",
};

const dataItems = [
  {
    name: "位置情報",
    detail:
      "アプリを使用中に、端末の緯度と経度を取得します。スポットまでの距離と、現在地を中心にした地図表示に使います。画面を閉じたあとの取得や、常時の追跡は行いません。許可しなくても、スポットの一覧と詳細は閲覧できます。",
  },
  {
    name: "端末情報",
    detail:
      "広告識別子や、追跡用の端末固有IDは取得しません。端末内には、ログイン状態とお気に入りの控えを保存します。同じ端末でアプリを開いたときの表示を続けるためであり、広告目的で端末の外へ送りません。",
  },
  {
    name: "お気に入りデータ",
    detail:
      "保存したスポットの識別子と保存日時を、アカウントに紐づけて保管します。お気に入りの表示と、端末を替えたあとの復元に使います。",
  },
] as const;

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-5 py-14">
      <p className="break-keep text-sm tracking-[0.18em] text-rose">DateSpot</p>
      <h1 className="break-keep mt-3 text-3xl leading-10 text-foreground">プライバシーポリシー</h1>
      <p className="break-keep mt-4 text-sm leading-7 text-ink-soft">
        制定日 2026年10月3日。運営者は WANTHIS です。本方針は DateSpot に適用します。
      </p>

      <section className="mt-10 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">取得するユーザーデータ</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          DateSpot が扱う主なデータは、位置情報、端末内に残す情報、お気に入りです。個人情報の販売、および広告のためのアプリ横断トラッキングは行いません。
        </p>
        <ul className="flex flex-col gap-4">
          {dataItems.map((item) => (
            <li key={item.name} className="rounded-2xl border border-line bg-surface p-5">
              <h3 className="break-keep text-base leading-7">{item.name}</h3>
              <p className="break-keep mt-2 text-sm leading-7 text-ink-soft">{item.detail}</p>
            </li>
          ))}
        </ul>
        <p className="break-keep text-base leading-8 text-ink-soft">
          このほか、アカウント作成時のメールアドレス、プラン、レビュー、クーポン利用履歴、お問い合わせ内容を、それぞれの機能を使ったときに保存します。パスワードは平文では預かりません。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">Supabase による認証とデータ保存</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          新規登録、ログイン、セッションの維持は Supabase の認証機能で行います。お気に入りを含むアカウント上のデータは、Supabase のデータベースに保存します。通信は HTTPS です。ゲスト利用では、メールアドレスのない匿名の識別子を発行する場合があります。
        </p>
        <p className="break-keep text-base leading-8 text-ink-soft">
          Supabase のサーバは日本国外にある場合があります。保存と認証は、本方針に書いた目的の範囲に限って委託します。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">第三者提供</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          個人情報を、広告配信やデータ販売のために第三者へ提供しません。
        </p>
        <p className="break-keep text-base leading-8 text-ink-soft">
          サービス運営のための委託は次のとおりです。認証とデータ保存は Supabase、地図の描画は Google の地図サービスです。地図の表示に必要な範囲で、表示領域の情報が Google に送信されます。委託先に、本方針の目的を超えた利用はさせません。
        </p>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">お問い合わせ窓口</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          開示、訂正、利用停止、削除の請求は、登録したメールアドレスから次の宛先へ送ってください。アカウント削除の手順は
          <Link href="/support" className="break-keep text-rose underline-offset-4 hover:underline">
            サポートページ
          </Link>
          に記載しています。
        </p>
        <a
          href="mailto:support@wanthis-apps.com"
          className="break-keep text-lg text-rose underline-offset-4 hover:underline"
        >
          support@wanthis-apps.com
        </a>
      </section>
    </main>
  );
}
