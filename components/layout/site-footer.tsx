import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-6 text-sm text-[color:var(--color-muted)]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '11px', color: 'var(--color-primary)' }}>
            DOWHAT
          </div>
          <div className="text-xs">聚合海量 H5 小游戏，免下载、即点即玩</div>
        </div>
        <nav className="flex flex-wrap gap-4">
          {[
            { href: '/about', label: '关于' },
            { href: '/contact', label: '联系' },
            { href: '/terms', label: '条款' },
            { href: '/privacy', label: '隐私' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-transparent text-xs transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-fg)]"
              style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs" style={{ fontFamily: 'var(--font-pixel)', fontSize: '8px', color: 'var(--color-muted)' }}>
          © {new Date().getFullYear()} DOWHAT
        </div>
      </div>
    </footer>
  );
}
