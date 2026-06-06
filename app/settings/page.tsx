import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { currentUser } from "@/lib/auth/session";
import {
  ChangePasswordForm,
  ProfileForm,
} from "@/components/auth/settings-forms";

export const metadata: Metadata = { title: "账户设置" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/settings");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8">
      {/* 面包屑 */}
      <nav className="px-xs text-[color:var(--color-muted)]">
        <Link href="/" className="text-[color:var(--color-primary)] hover:underline">HOME</Link>
        <span className="mx-1.5 text-[color:var(--color-border)]">/</span>
        <span className="text-[color:var(--color-fg)]">SETTINGS</span>
      </nav>

      <header>
        <h1 className="px text-[color:var(--color-primary)]">SETTINGS</h1>
        <p className="mt-2 text-xs text-[color:var(--color-muted)]">
          管理你的资料与安全设置 ·
          <Link href={`/u/${encodeURIComponent(user.name)}`} className="ml-1 text-[color:var(--color-primary)] hover:underline">
            /u/{user.name}
          </Link>
        </p>
      </header>

      {/* 资料 */}
      <section className="border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
        <div className="border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2">
          <h2 className="px-sm text-[color:var(--color-primary)]">■ PROFILE</h2>
        </div>
        <div className="p-5">
          <ProfileForm currentName={user.name} currentAvatar={user.avatar} />
        </div>
      </section>

      {/* 安全 */}
      <section className="border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
        <div className="border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2">
          <h2 className="px-sm text-[color:var(--color-primary)]">■ SECURITY</h2>
        </div>
        <div className="p-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
}
