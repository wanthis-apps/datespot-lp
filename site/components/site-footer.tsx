import Link from "next/link";

const links = [
  { href: "/", label: "トップ" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/support", label: "サポート" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-auto w-full min-w-0 max-w-full border-t border-line">
      <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="break-keep font-display text-lg tracking-[0.16em]">WANTHIS</p>
          <p className="break-keep text-sm leading-7 text-ink-soft">
            第1弾アプリ DateSpot のサポートとプライバシーポリシーを掲載しています。
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <nav aria-label="フッター" className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="break-keep text-sm text-ink-soft underline-offset-4 hover:text-rose hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href="mailto:support@wanthis-apps.com"
            className="break-keep text-sm text-rose underline-offset-4 hover:underline"
          >
            support@wanthis-apps.com
          </a>
        </div>
      </div>
    </footer>
  );
}
