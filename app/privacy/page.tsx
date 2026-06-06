import type { Metadata } from "next";

export const metadata: Metadata = { title: "隐私政策" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 style={{ fontFamily: "var(--font-pixel)", fontSize: "16px", color: "var(--color-primary)" }} className="mb-2">
        PRIVACY
      </h1>
      <p className="mb-8 text-xs text-[color:var(--color-muted)]">最后更新：2026 年 6 月</p>

      <div className="space-y-6 text-sm leading-relaxed text-[color:var(--color-muted)]">
        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🔒 隐私承诺</h2>
          <p>
            DoWhat 作为一个开源项目，我们坚信隐私是一项基本权利。我们尽量少收集数据，并且绝不出售用户数据。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">📊 我们收集什么</h2>
          <ul className="list-inside list-disc space-y-1">
            <li><strong>账户信息</strong>：如果你选择注册，我们会存储用户名和邮箱地址（邮箱可选）</li>
            <li><strong>游玩数据</strong>：游戏游玩次数、分数等统计数据，用于排行榜展示</li>
            <li><strong>技术日志</strong>：标准的服务器访问日志（IP、时间、请求路径），用于排查问题</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🚫 我们不做什么</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>不使用第三方追踪器（如 Google Analytics、Facebook Pixel）</li>
            <li>不出售或分享用户数据给第三方</li>
            <li>不追踪你在其他网站的行为</li>
            <li>不发送营销邮件</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🍪 Cookies</h2>
          <p>
            我们仅使用必要的 Cookie 来维持登录状态（Session）。不使用广告或追踪类 Cookie。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">🗑️ 数据删除</h2>
          <p>
            你可以随时在设置页面删除你的账户和所有关联数据。如果你无法登录，也可以通过 GitHub Issue 请求删除。
            我们会在合理时间内完成处理。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">👶 未成年人</h2>
          <p>
            DoWhat 不面向 13 岁以下儿童设计。如果你是未成年人，请在监护人同意下使用本平台。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">📝 政策变更</h2>
          <p>
            隐私政策如有重大变更，会在平台上公告。变更后继续使用平台即表示你同意新的政策。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">💬 开源透明</h2>
          <p>
            DoWhat 的全部代码都是开源的。如果你对我们的数据处理方式有疑问，可以直接查看源代码。透明是最好的信任基础。
          </p>
        </section>
      </div>
    </div>
  );
}
