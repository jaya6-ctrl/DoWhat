import type { Metadata } from "next";

export const metadata: Metadata = { title: "服务条款" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 style={{ fontFamily: "var(--font-pixel)", fontSize: "16px", color: "var(--color-primary)" }} className="mb-2">
        TERMS
      </h1>
      <p className="mb-8 text-xs text-[color:var(--color-muted)]">最后更新：2026 年 6 月</p>

      <div className="space-y-6 text-sm leading-relaxed text-[color:var(--color-muted)]">
        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">1. 服务说明</h2>
          <p>
            DoWhat 是一个开源的 H5 小游戏聚合平台，向所有用户提供免费的游戏服务。使用本平台即表示你同意以下条款。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">2. 使用规则</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>请文明使用，不要尝试攻击、破坏或滥用平台服务</li>
            <li>不要利用平台传播违法、有害或不适当的内容</li>
            <li>不要使用自动化工具大量请求，影响其他用户的正常使用</li>
            <li>尊重其他用户，维护良好的社区氛围</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">3. 知识产权</h2>
          <p>
            平台代码以开源协议发布，请参阅项目 LICENSE 文件。平台上的游戏由各自的作者贡献，版权归原作者所有。
            如果你认为某个内容侵犯了你的权益，请通过 Issue 联系我们，我们会及时处理。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">4. 免责声明</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>平台按「现状」提供，不保证服务不中断或无错误</li>
            <li>我们不对用户因使用平台而产生的任何损失承担责任</li>
            <li>我们保留随时修改或终止服务的权利</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">5. 条款修改</h2>
          <p>
            我们可能会不定期更新这些条款。重大变更会在平台上公告。继续使用平台即表示你接受修改后的条款。
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-bold text-[color:var(--color-fg)]">6. 联系方式</h2>
          <p>
            对条款有任何疑问，请通过 GitHub Issue 与我们联系。
          </p>
        </section>
      </div>
    </div>
  );
}
