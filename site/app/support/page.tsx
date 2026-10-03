import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サポート",
  description:
    "DateSpot の問い合わせ先と、App Store / Google Play で必要なアカウント削除の申請手順です。",
};

const deleted = [
  "メールアドレスと認証用のアカウント",
  "お気に入り、プラン、レビュー",
  "クーポンの利用履歴",
  "お問い合わせの内容と、通知設定",
  "端末内に保存したログイン状態とお気に入りの控え",
] as const;

const retained = [
  "退会申請の記録（申請日と理由）。申請対応と不正防止のため、最長90日保管したあと削除します。",
  "個人を識別できない集計。特定のアカウントへ結び付けません。",
  "法令により保管が義務づけられている記録。義務のある期間に限ります。",
] as const;

export default function SupportPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-14">
      <p className="break-keep text-sm tracking-[0.18em] text-rose">DateSpot</p>
      <h1 className="break-keep mt-3 text-3xl leading-10">サポート</h1>
      <p className="break-keep mt-4 text-base leading-8 text-ink-soft">
        不具合、スポット情報の訂正、アカウントに関する連絡は、下記のメールで受け付けます。ログインしていなくても、このページから申請できます。
      </p>

      <section className="mt-10 rounded-2xl border border-line bg-surface p-6">
        <h2 className="break-keep text-xl leading-8">問い合わせ先</h2>
        <p className="break-keep mt-3 text-base leading-8 text-ink-soft">
          メールの件名に「DateSpot」と用向きを書いてください。登録済みの方は、登録したメールアドレスから送ると確認が早くなります。
        </p>
        <a
          href="mailto:support@wanthis-apps.com"
          className="break-keep mt-4 inline-flex text-lg text-rose underline-offset-4 hover:underline"
        >
          support@wanthis-apps.com
        </a>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">アカウント削除の申請</h2>
        <p className="break-keep text-base leading-8 text-ink-soft">
          DateSpot のアカウントと、それに紐づく個人データは、アプリ内の操作か、このページからのメールで削除を申請できます。申請から30日以内に削除します。
        </p>

        <h3 className="break-keep mt-4 text-lg leading-8">アプリから申請する</h3>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li className="break-keep text-base leading-8 text-ink-soft">DateSpot を開き、ログインします。</li>
          <li className="break-keep text-base leading-8 text-ink-soft">プロフィールを開きます。</li>
          <li className="break-keep text-base leading-8 text-ink-soft">
            「アカウントを削除（退会）」を選びます。
          </li>
          <li className="break-keep text-base leading-8 text-ink-soft">
            退会理由を選択し、削除を確定します。
          </li>
        </ol>

        <h3 className="break-keep mt-6 text-lg leading-8">メールで申請する</h3>
        <p className="break-keep text-base leading-8 text-ink-soft">
          アプリを開けない場合も、登録したメールアドレスから次の宛先へ送ってください。件名は「アカウント削除申請」、本文には登録メールアドレスを書いてください。
        </p>
        <a
          href="mailto:support@wanthis-apps.com?subject=%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E5%89%8A%E9%99%A4%E7%94%B3%E8%AB%8B"
          className="break-keep text-base text-rose underline-offset-4 hover:underline"
        >
          support@wanthis-apps.com へ削除を申請する
        </a>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">削除されるデータ</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {deleted.map((item) => (
            <li key={item} className="break-keep text-base leading-8 text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 flex flex-col gap-4">
        <h2 className="break-keep text-xl leading-8">削除後も残るもの</h2>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          {retained.map((item) => (
            <li key={item} className="break-keep text-base leading-8 text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
        <p className="break-keep text-base leading-8 text-ink-soft">
          ゲストとして端末内だけを使っていた場合は、アプリの削除で端末内の控えも消えます。メールアドレス付きのアカウントがある場合は、上記のいずれかで削除を申請してください。
        </p>
      </section>
    </main>
  );
}
