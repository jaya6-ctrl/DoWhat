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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">账户设置</h1>
        <p className="text-sm text-[color:var(--color-muted)]">
          管理你的资料与安全设置。访问个人主页：
          <Link
            href={`/u/${encodeURIComponent(user.name)}`}
            className="ml-1 text-[color:var(--color-fg)] hover:underline"
          >
            /u/{user.name}
          </Link>
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
        <h2 className="text-lg font-medium">资料</h2>
        <ProfileForm currentName={user.name} currentAvatar={user.avatar} />
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
        <h2 className="text-lg font-medium">安全</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
