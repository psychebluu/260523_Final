"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckSquare,
  Cpu,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { JarvisArcReactor } from "@/components/secretary/jarvis/JarvisArcReactor";
import { JarvisHudFrame } from "@/components/secretary/jarvis/JarvisHudFrame";
import { JarvisVoiceInput } from "@/components/secretary/jarvis/JarvisVoiceInput";
import { ReminderToasts } from "@/components/secretary/ReminderToasts";
import { useReminderEngine } from "@/components/secretary/useReminderEngine";

const NAV = [
  { href: "/secretary", label: "오늘", code: "BRIEF", icon: LayoutDashboard },
  { href: "/secretary/tasks", label: "전체 일정", code: "TASKS", icon: CheckSquare },
  { href: "/secretary/report", label: "리포트", code: "REPORT", icon: CalendarDays },
  { href: "/secretary/settings/tags", label: "설정", code: "CONFIG", icon: Bell },
];

function useSidebarClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return time;
}

export function SecretaryShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebarTime = useSidebarClock();
  useReminderEngine();

  return (
    <div className="jarvis-grid-bg jarvis-scanline relative min-h-dvh text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
      <div className="pointer-events-none absolute right-0 top-1/4 hidden h-64 w-px lg:block">
        <div className="jarvis-data-stream h-full w-full opacity-40" />
      </div>
      <div className="pointer-events-none absolute right-8 top-24 hidden opacity-[0.07] xl:block">
        <JarvisArcReactor size="lg" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-[1280px]">
        <aside className="relative sticky top-0 hidden h-dvh w-[248px] shrink-0 self-start border-r border-primary/10 bg-sidebar/80 px-4 py-6 backdrop-blur-xl md:flex md:flex-col">
          <div
            className="jarvis-data-stream pointer-events-none absolute inset-y-0 right-0 w-px opacity-30"
            aria-hidden
          />

          <Link href="/secretary" className="mb-5 flex items-center gap-3 px-2">
            <div className="jarvis-ring relative flex h-11 w-11 items-center justify-center bg-primary/10 text-primary">
              <Cpu className="h-5 w-5" />
              <span className="jarvis-pulse absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">업무 에이전트</p>
              <p className="jarvis-label mt-0.5 text-[10px] text-primary/60">DAY SECRETARY</p>
            </div>
          </Link>

          <div
            className="mb-5 h-px bg-gradient-to-r from-primary/40 via-primary/15 to-transparent"
            aria-hidden
          />

          <div className="mb-3 flex items-center gap-2 px-2">
            <p className="jarvis-label text-[10px]">Navigation</p>
            <div
              className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent"
              aria-hidden
            />
          </div>

          <nav className="space-y-1">
            {NAV.map(({ href, label, code, icon: Icon }, index) => {
              const active =
                href === "/secretary"
                  ? pathname === "/secretary"
                  : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "jarvis-nav-item relative overflow-hidden",
                    active && "jarvis-nav-active",
                  )}
                >
                  {active ? (
                    <span
                      className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full bg-primary shadow-[0_0_10px_rgba(0,212,255,0.55)]"
                      aria-hidden
                    />
                  ) : null}
                  <span className="w-4 shrink-0 text-center font-mono text-[10px] text-primary/30">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  <span className="font-mono text-[10px] tracking-wider opacity-50">{code}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex-1" aria-hidden />

          <div className="relative overflow-hidden rounded-lg border border-primary/15 bg-primary/[0.03] px-3 py-3">
            <div
              className="jarvis-scanline pointer-events-none absolute inset-0 opacity-20"
              aria-hidden
            />
            <div className="relative flex items-center gap-3">
              <JarvisArcReactor size="sm" />
              <div className="min-w-0">
                <p className="jarvis-label text-[9px]">Agent Core</p>
                <p className="font-mono text-[10px] text-primary/55">READY · STANDBY</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 px-2">
            <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-wider text-emerald-400/85">
              <span className="jarvis-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ONLINE
            </span>
            <span className="ml-auto font-mono text-[9px] tabular-nums text-primary/35">
              {sidebarTime}
            </span>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-primary/10 bg-card/60 px-4 py-3 backdrop-blur-md md:hidden">
            <div className="flex items-center justify-between">
              <Link href="/secretary" className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">업무 에이전트</span>
              </Link>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/90">
                <span className="jarvis-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
                ONLINE
              </span>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {NAV.map(({ href, label }) => {
                const active =
                  href === "/secretary"
                    ? pathname === "/secretary"
                    : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition",
                      active ? "jarvis-tab-active" : "jarvis-tab",
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </header>

          <div className="hidden border-b border-primary/10 bg-card/40 px-8 py-3 backdrop-blur-md md:block">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <JarvisArcReactor size="sm" />
                <div>
                  <p className="jarvis-label text-[10px]">Command Interface</p>
                  <p className="text-xs text-muted-foreground">에이전트 대기 중 · 음성/텍스트 명령 수신 가능</p>
                </div>
              </div>
              <JarvisVoiceInput />
            </div>
          </div>

          <JarvisHudFrame className="flex-1">
            <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
          </JarvisHudFrame>
        </div>
      </div>
      <ReminderToasts />
    </div>
  );
}
