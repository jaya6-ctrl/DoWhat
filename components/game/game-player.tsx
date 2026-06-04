"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Orientation } from "@prisma/client";

type Props = {
  slug: string;
  entryUrl: string;
  width: number;
  height: number;
  orientation: Orientation;
  title: string;
};

type GameMessage =
  | { type: "game_start"; slug?: string }
  | { type: "game_end"; slug?: string; score?: number; duration?: number };

export function GamePlayer({ slug, entryUrl, width, height, orientation, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const reportedRef = useRef(false);

  const [started, setStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const aspect = `${width} / ${height}`;
  const isPortrait = orientation === "PORTRAIT";

  const reportPlay = useCallback(async () => {
    if (reportedRef.current) return;
    reportedRef.current = true;
    try {
      await fetch(`/api/games/${slug}/play`, { method: "POST", keepalive: true });
    } catch {
      // 上报失败静默，不影响游戏体验
    }
  }, [slug]);

  useEffect(() => {
    if (!started) return;

    const handleMessage = (e: MessageEvent<GameMessage>) => {
      // 仅接受来自我们 iframe 的消息
      if (e.source !== iframeRef.current?.contentWindow) return;
      const data = e.data;
      if (!data || typeof data !== "object" || !("type" in data)) return;
      if (data.type === "game_start") {
        void reportPlay();
      }
      // game_end 暂不处理（P1 接入用户系统后再做 Play 记录）
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [started, reportPlay]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen().catch(() => {
        // 浏览器拒绝全屏请求时静默
      });
    }
  }, []);

  const handleStart = useCallback(() => {
    setStarted(true);
    // 兜底：部分游戏可能不主动发 game_start，2 秒后仍未上报则补一次
    setTimeout(() => {
      void reportPlay();
    }, 2000);
  }, [reportPlay]);

  return (
    <div
      ref={containerRef}
      className={
        "relative mx-auto overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-black " +
        (isFullscreen ? "h-screen w-screen" : "w-full")
      }
      style={
        isFullscreen
          ? undefined
          : {
              aspectRatio: aspect,
              maxWidth: isPortrait ? `min(${width}px, 100%)` : "100%",
            }
      }
    >
      {started ? (
        <iframe
          ref={iframeRef}
          src={entryUrl}
          title={title}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; gamepad; accelerometer; gyroscope"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock"
          loading="lazy"
          style={{ touchAction: "manipulation" }}
        />
      ) : (
        <button
          type="button"
          onClick={handleStart}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-black/40 to-black/70 text-white transition hover:from-black/30 hover:to-black/60"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-primary)] text-2xl shadow-lg transition group-hover:scale-110">
            ▶
          </span>
          <span className="text-base font-medium">开始游戏</span>
          <span className="text-xs opacity-70">
            {width} × {height} · {isPortrait ? "竖屏" : "横屏"}
          </span>
          {!isPortrait && (
            <span className="mt-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] opacity-80 sm:hidden">
              建议横屏 / 全屏游玩
            </span>
          )}
        </button>
      )}

      {started && (
        <button
          type="button"
          onClick={toggleFullscreen}
          className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-md bg-black/50 text-base text-white opacity-70 transition hover:bg-black/70 hover:opacity-100 sm:h-9 sm:w-9"
          aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
          title={isFullscreen ? "退出全屏" : "进入全屏"}
        >
          {isFullscreen ? "⤢" : "⛶"}
        </button>
      )}
    </div>
  );
}
