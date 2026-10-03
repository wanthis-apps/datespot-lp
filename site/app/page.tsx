import Link from "next/link";

const points = [
  {
    title: "地図で、今いる場所から",
    body: "使用中の位置情報から、カフェや食事、夜景までの距離を表示します。許可しなくても、スポットの閲覧はできます。",
  },
  {
    title: "お気に入りとプラン",
    body: "気になった場所を保存し、訪れる順番をプランにまとめられます。アカウントに紐づけて、同じ端末の外でも残せます。",
  },
  {
    title: "クーポンを、その日のために",
    body: "店舗のクーポンを確認し、利用した記録をアカウントに残せます。営業時間や料金は、各店舗の最新情報を確認してください。",
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto w-full max-w-5xl px-5 pt-16 pb-12 sm:pt-24">
        <p className="break-keep text-sm tracking-[0.22em] text-rose">WANTHIS</p>
        <h1 className="break-keep mt-4 max-w-3xl font-display text-5xl leading-tight text-foreground sm:text-6xl">
          DateSpot
        </h1>
        <p className="break-keep mt-6 max-w-2xl text-2xl leading-10 text-foreground">
          ふたりのための場所を、地図のうえで選ぶ。
        </p>
        <p className="break-keep mt-5 max-w-2xl text-base leading-8 text-ink-soft">
          DateSpot は、WANTHIS の第1弾アプリです。近くのデートスポットを一覧と地図で探し、お気に入り、プラン、クーポンをアカウントに残せます。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/support"
            className="break-keep inline-flex items-center rounded-full bg-rose px-5 py-3 text-sm text-white"
          >
            サポートを見る
          </Link>
          <Link
            href="/privacy"
            className="break-keep inline-flex items-center rounded-full border border-line bg-surface px-5 py-3 text-sm text-foreground"
          >
            プライバシーポリシー
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 pb-20 sm:grid-cols-3">
        {points.map((point) => (
          <article key={point.title} className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="break-keep text-lg leading-8 text-foreground">{point.title}</h2>
            <p className="break-keep mt-3 text-sm leading-7 text-ink-soft">{point.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
