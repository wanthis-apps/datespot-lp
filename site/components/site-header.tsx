import Link from "next/link";

const links = [
  { href: "/", label: "トップ" },
  { href: "/privacy", label: "プライバシーポリシー" },
  { href: "/support", label: "サポート" },
] as const;

export function SiteHeader() {
  return (
    <header className="w-full min-w-0 max-w-full border-b border-line bg-background/95">
      <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-5 py-5">
        <Link href="/" className="break-keep font-display text-xl tracking-[0.18em] text-foreground">
          WANTHIS
        </Link>
        <nav aria-label="主要" className="flex min-w-0 max-w-full flex-wrap gap-x-5 gap-y-2">
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
      </div>
    </header>
  );
}
