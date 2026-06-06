import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { AuthError, verifyEmail } from "@/lib/services/auth";

export const metadata: Metadata = { title: "邮箱验证" };
export const dynamic = "force-dynamic";

type SearchParams = Promise<{ token?: string }>;

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;

  let errorMessage: string | null = null;
  if (!token) {
    errorMessage = "缺少验证令牌";
  } else {
    try {
      await verifyEmail(token);
      redirect("/login?verified=1");
    } catch (err) {
      if (err instanceof AuthError) {
        errorMessage = err.message;
      } else {
        throw err;
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-4 py-16 text-center">
      <span style={{ fontSize: '48px' }}>❌</span>
      <h1 className="px text-[#e53e3e]">VERIFY FAILED</h1>
      <p className="px-sm text-[color:var(--color-muted)]">{errorMessage}</p>
      <Link
        href="/login"
        className="bg-[color:var(--color-primary)] px-6 py-2.5 text-[#0f0f23] transition-all hover:brightness-110"
        style={{ fontFamily: 'var(--font-pixel)', fontSize: '10px', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
      >
        ◀ BACK TO LOGIN
      </Link>
    </div>
  );
}
