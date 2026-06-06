"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/app/(auth)/_actions";

type Props = {
  user: { name: string; avatar: string | null };
};

function initial(name: string): string {
  return Array.from(name)[0]?.toUpperCase() ?? "?";
}

export function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="账户菜单"
        className="grid h-8 w-8 place-items-center overflow-hidden border-2 border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-sm font-semibold text-[#0f0f23]"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          initial(user.name)
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 border-2 border-[color:var(--color-border)] bg-[color:var(--color-surface)]" style={{ boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
          <div className="border-b-2 border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-3 py-2">
            <div className="px-sm truncate text-[color:var(--color-fg)]">{user.name}</div>
          </div>
          <Link
            href={`/u/${encodeURIComponent(user.name)}`}
            className="block border-b border-[color:var(--color-border)] px-3 py-2 px-sm text-[color:var(--color-fg)] transition-colors hover:bg-[color:var(--color-primary)]/10"
            onClick={() => setOpen(false)}
          >
            个人主页
          </Link>
          <Link
            href="/settings"
            className="block border-b border-[color:var(--color-border)] px-3 py-2 px-sm text-[color:var(--color-fg)] transition-colors hover:bg-[color:var(--color-primary)]/10"
            onClick={() => setOpen(false)}
          >
            账户设置
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left px-sm text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-primary)]/10"
            >
              退出登录
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
