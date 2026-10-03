import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "サポート",
  description:
    "DateSpot のよくある質問と、お問い合わせ先 support@wanthis-apps.com です。",
};

const faqs = [
  {
    question: "位置情報をオフにしても使えますか",
    answer:
      "使えます。スポットの一覧と詳細は、位置情報なしで閲覧できます。距離と現在地の表示だけが止まります。",
  },
  {
    question: "お気に入りはどこに保存されますか",
    answer:
      "ログイン中のお気に入りは、Supabase 上のアカウントに保存します。端末内にも控えを置くため、同じ端末ですぐ表示できます。",
  },
  {
    question: "パスワードを忘れました",
    answer:
      "この項目は案内の初期文です。再設定手順が決まり次第、ここを差し替えてください。それまでは support@wanthis-apps.com へ、登録メールアドレスから連絡してください。",
  },
  {
    question: "掲載情報の誤りを伝えたい",
    answer:
      "店舗名、場所、気づいた内容をメールで送ってください。確認のうえ、スポット情報の修正を検討します。",
  },
] as const;

export default function SupportPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-5 py-14">
      <p className="break-keep text-sm tracking-[0.18em] text-rose">DateSpot</p>
      <h1 className="break-keep mt-3 text-3xl leading-10">サポート</h1>
      <p className="break-keep mt-4 text-base leading-8 text-ink-soft">
        アプリの使い方で不明な点は、下の質問を確認するか、メールで連絡してください。ログインしていなくても、このページから送れます。
      </p>

      <section className="mt-10 flex flex-col gap-3">
        <h2 className="break-keep text-xl leading-8">よくある質問</h2>
        <p className="break-keep text-sm leading-7 text-ink-soft">
          初期の案内です。公開前に、実際の問い合わせに合わせて質問と回答を差し替えてください。
        </p>
        <div className="flex flex-col gap-3">
          {faqs.map((item) => (
            <details key={item.question} className="rounded-2xl border border-line bg-surface px-5 py-4">
              <summary className="break-keep cursor-pointer text-base leading-8 text-foreground">
                {item.question}
              </summary>
              <p className="break-keep mt-3 text-sm leading-7 text-ink-soft">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-line bg-surface p-6">
        <h2 className="break-keep text-xl leading-8">お問い合わせ先</h2>
        <p className="break-keep mt-3 text-base leading-8 text-ink-soft">
          件名に「DateSpot」と用向きを書いてください。登録済みの方は、登録したメールアドレスから送ると確認が早くなります。
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
          プロフィールの「アカウントを削除（退会）」から申請できます。アプリを開けない場合は、件名を「アカウント削除申請」にして、登録メールアドレスを本文に書き、同じ宛先へ送ってください。申請から30日以内に、アカウントとお気に入りなどの個人データを削除します。
        </p>
        <a
          href="mailto:support@wanthis-apps.com?subject=%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88%E5%89%8A%E9%99%A4%E7%94%B3%E8%AB%8B"
          className="break-keep text-base text-rose underline-offset-4 hover:underline"
        >
          support@wanthis-apps.com へ削除を申請する
        </a>
      </section>
    </main>
  );
}
