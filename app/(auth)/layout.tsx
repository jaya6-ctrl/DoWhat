export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-10">
      {/* 背景星星 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white"
            style={{
              width: (i % 3 === 0 ? 2 : 1) + 'px',
              height: (i % 3 === 0 ? 2 : 1) + 'px',
              left: ((i * 41 + 17) % 100) + '%',
              top: ((i * 29 + 11) % 100) + '%',
              opacity: 0.15 + (i % 4) * 0.1,
              animation: `star-twinkle ${2 + (i % 3)}s ${i * 0.4}s step-end infinite`,
            }}
          />
        ))}
      </div>

      {/* 像素角色 - 左侧 */}
      <div className="pointer-events-none absolute bottom-8 left-8 hidden lg:block" style={{ animation: 'pixel-bounce 2s step-end infinite' }}>
        <PixelGuard />
      </div>

      {/* 像素角色 - 右侧 */}
      <div className="pointer-events-none absolute bottom-8 right-8 hidden lg:block" style={{ animation: 'pixel-bounce 2.5s 0.5s step-end infinite' }}>
        <PixelKey />
      </div>

      {/* 表单容器 */}
      <div className="relative w-full max-w-md">
        {/* 顶部装饰条 */}
        <div className="mb-0 flex items-center gap-2 border-2 border-b-0 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2" style={{ boxShadow: '4px 0 0 rgba(0,0,0,0.3)' }}>
          <span className="inline-block h-2.5 w-2.5 bg-[#e53e3e]" />
          <span className="inline-block h-2.5 w-2.5 bg-[#f0c040]" />
          <span className="inline-block h-2.5 w-2.5 bg-[#48bb78]" />
          <span className="ml-2" style={{ fontFamily: 'var(--font-pixel)', fontSize: '9px', color: 'var(--color-muted)' }}>
            auth.exe
          </span>
        </div>

        {/* 主表单区 */}
        <div
          className="space-y-6 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6"
          style={{ boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }}
        >
          {children}
        </div>

        {/* 底部装饰 */}
        <div className="mt-0 flex items-center justify-between border-2 border-t-0 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-1.5" style={{ boxShadow: '4px 0 0 rgba(0,0,0,0.3)' }}>
          <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: 'var(--color-muted)' }}>
            DOWHAT AUTH SYSTEM v1.0
          </span>
          <div className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 bg-[#48bb78] animate-pulse" />
            <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '7px', color: '#48bb78' }}>
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 像素守卫角色 ── */
function PixelGuard() {
  return (
    <svg width="32" height="40" viewBox="0 0 32 40" style={{ imageRendering: 'pixelated', opacity: 0.6 }}>
      {/* 头盔 */}
      <rect x="8" y="0" width="16" height="8" fill="#a0aec0" />
      <rect x="6" y="4" width="20" height="4" fill="#a0aec0" />
      {/* 面罩 */}
      <rect x="10" y="6" width="12" height="4" fill="#2d3748" />
      <rect x="12" y="7" width="3" height="2" fill="#60a5fa" />
      <rect x="17" y="7" width="3" height="2" fill="#60a5fa" />
      {/* 身体 */}
      <rect x="8" y="12" width="16" height="12" fill="#4a5568" />
      <rect x="12" y="14" width="8" height="4" fill="#718096" />
      {/* 盾牌 */}
      <rect x="0" y="14" width="8" height="10" fill="#f0c040" />
      <rect x="2" y="16" width="4" height="6" fill="#d4a830" />
      {/* 剑 */}
      <rect x="24" y="10" width="4" height="16" fill="#a0aec0" />
      <rect x="22" y="14" width="8" height="2" fill="#718096" />
      {/* 腿 */}
      <rect x="10" y="24" width="5" height="8" fill="#4a5568" />
      <rect x="17" y="24" width="5" height="8" fill="#4a5568" />
      {/* 靴子 */}
      <rect x="8" y="32" width="7" height="4" fill="#2d3748" />
      <rect x="17" y="32" width="7" height="4" fill="#2d3748" />
    </svg>
  );
}

/* ── 像素钥匙 ── */
function PixelKey() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" style={{ imageRendering: 'pixelated', opacity: 0.5 }}>
      {/* 钥匙头 */}
      <rect x="4" y="2" width="12" height="12" fill="#f0c040" />
      <rect x="6" y="4" width="8" height="8" fill="#0f0f23" />
      <rect x="8" y="6" width="4" height="4" fill="#f0c040" />
      {/* 钥匙杆 */}
      <rect x="10" y="14" width="4" height="10" fill="#f0c040" />
      {/* 齿 */}
      <rect x="14" y="18" width="4" height="2" fill="#f0c040" />
      <rect x="14" y="22" width="6" height="2" fill="#f0c040" />
    </svg>
  );
}
