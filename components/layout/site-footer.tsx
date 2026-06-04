import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-8 text-sm text-[color:var(--color-muted)]">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="font-semibold text-[color:var(--color-fg)]">DoWhat 游戏</div>
          <div>聚合海量 H5 小游戏，免下载、即点即玩</div>
        </div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/about" className="hover:text-[color:var(--color-fg)]">
            关于我们
          </Link>
          <Link href="/contact" className="hover:text-[color:var(--color-fg)]">
            联系方式
          </Link>
          <Link href="/terms" className="hover:text-[color:var(--color-fg)]">
            服务条款
          </Link>
          <Link href="/privacy" className="hover:text-[color:var(--color-fg)]">
            隐私政策
          </Link>
        </nav>
        <div className="text-xs">© {new Date().getFullYear()} DoWhat</div>
      </div>
    </footer>
  );
}
