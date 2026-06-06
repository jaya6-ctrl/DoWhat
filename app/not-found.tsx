import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      {/* 像素 404 */}
      <div className="flex items-center gap-2">
        <span className="inline-block h-12 w-8 bg-[color:var(--color-primary)]" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
        <span className="inline-block h-12 w-12 border-4 border-[color:var(--color-primary)]" />
        <span className="inline-block h-12 w-8 bg-[color:var(--color-primary)]" style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }} />
      </div>

      <h1 className="px text-[color:var(--color-primary)]">PAGE NOT FOUND</h1>
      <p className="px-sm text-[color:var(--color-muted)]">你访问的页面不存在或已被移除</p>

      <div className="flex gap-3">
        <Link
          href="/"
          className="bg-[color:var(--color-primary)] px-5 py-2.5 text-[#0f0f23] transition-all hover:brightness-110"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
        >
          ▶ HOME
        </Link>
        <Link
          href="/games"
          className="border-2 border-[color:var(--color-border)] px-5 py-2.5 text-[color:var(--color-fg)] transition-colors hover:border-[color:var(--color-primary)] hover:text-[color:var(--color-primary)]"
          style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
        >
          🎮 GAMES
        </Link>
      </div>
    </div>
  );
}
