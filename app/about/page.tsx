import type { Metadata } from "next";

export const metadata: Metadata = { title: "关于我们" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 style={{ fontFamily: "var(--font-pixel)", fontSize: "16px", color: "var(--color-primary)" }} className="mb-8">
        ABOUT US
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-[color:var(--color-muted)]">
        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🎮 DoWhat 是什么？</h2>
          <p>
            DoWhat 是一个开源的 H5 小游戏聚合平台。我们相信好的游戏应该触手可及——无需下载、无需注册、打开浏览器就能玩。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🌟 我们的理念</h2>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>免费开放</strong> — 所有游戏完全免费，没有内购、没有广告弹窗</li>
            <li><strong>即点即玩</strong> — 不需要安装任何东西，点开就能开始</li>
            <li><strong>开源共建</strong> — 项目代码完全开源，欢迎任何人贡献游戏或改进平台</li>
            <li><strong>隐私友好</strong> — 我们不追踪用户，不收集不必要的数据</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🛠️ 技术栈</h2>
          <p>平台基于现代 Web 技术构建：</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Next.js + React — 前端框架</li>
            <li>Prisma + PostgreSQL — 数据存储</li>
            <li>Tailwind CSS — 样式系统</li>
            <li>纯 HTML/CSS/JS — 每个游戏都是独立的原生 Web 应用</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🤝 参与贡献</h2>
          <p>
            我们欢迎各种形式的贡献：提交新游戏、修复 Bug、改进 UI、完善文档。每一个 PR 都会被认真对待。
          </p>
          <p className="mt-2">
            项目地址：
            <a
              href="https://github.com/jaya6-ctrl/DoWhat.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-primary)] underline underline-offset-2 hover:text-[color:var(--color-primary-hover)]"
            >
              https://github.com/jaya6-ctrl/DoWhat.git
            </a>
          </p>
          <p className="mt-1 text-xs">如果觉得有意思，给个 Star 就是最大的鼓励 ⭐</p>
        </section>
      </div>
    </div>
  );
}
