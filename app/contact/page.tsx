import type { Metadata } from "next";

export const metadata: Metadata = { title: "联系方式" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 style={{ fontFamily: "var(--font-pixel)", fontSize: "16px", color: "var(--color-primary)" }} className="mb-8">
        CONTACT
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-[color:var(--color-muted)]">
        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">📬 联系我们</h2>
          <p>
            DoWhat 是一个开源社区项目，我们没有客服团队，但我们重视每一条反馈。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🐙 GitHub 仓库</h2>
          <p>
            项目完全开源，代码托管在 GitHub：
          </p>
          <p className="mt-2">
            <a
              href="https://github.com/jaya6-ctrl/DoWhat.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-primary)] underline underline-offset-2 hover:text-[color:var(--color-primary-hover)]"
            >
              https://github.com/jaya6-ctrl/DoWhat.git
            </a>
          </p>
          <p className="mt-1 text-xs">欢迎 Star ⭐ / Fork 🍴 / 提交 PR</p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🐛 发现 Bug？</h2>
          <p>
            如果你在使用过程中遇到问题，请在 GitHub 上提交 Issue。描述越详细，我们修复越快：
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>你做了什么操作</li>
            <li>你期望发生什么</li>
            <li>实际发生了什么</li>
            <li>你的浏览器和设备信息</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">💡 功能建议</h2>
          <p>
            有新游戏的想法？觉得哪里可以改进？欢迎在 GitHub Discussions 或 Issue 中提出。好的想法会被优先实现。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🎮 提交游戏</h2>
          <p>
            如果你做了一个 H5 小游戏，想放到 DoWhat 平台上，欢迎提交 PR。要求很简单：
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>单个 HTML 文件，纯原生技术（无框架依赖）</li>
            <li>支持鼠标和触屏操作</li>
            <li>通过 postMessage 与平台通信（可选）</li>
            <li>内容健康，适合所有年龄</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">📧 其他联系</h2>
          <p>
            对于非技术问题，可以通过 GitHub 个人主页找到维护者的联系方式。请优先使用公开渠道（Issue / Discussion），这样其他人也能看到和参与讨论。
          </p>
          <p className="mt-2">
            GitHub: <a href="https://github.com/jaya6-ctrl" target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-primary)] underline underline-offset-2 hover:text-[color:var(--color-primary-hover)]">jaya6-ctrl</a>
          </p>
        </section>
      </div>
    </div>
  );
}
