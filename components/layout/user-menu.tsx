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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[color:var(--color-primary)] text-sm font-semibold text-white"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        ) : (
          initial(user.name)
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 overflow-hidden rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-lg">
          <div className="border-b border-[color:var(--color-border)] px-3 py-2">
            <div className="truncate text-sm font-medium">{user.name}</div>
          </div>
          <Link
            href={`/u/${encodeURIComponent(user.name)}`}
            className="block px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            个人主页
          </Link>
          <Link
            href="/settings"
            className="block px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => setOpen(false)}
          >
            账户设置
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="block w-full border-t border-[color:var(--color-border)] px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              退出登录
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
