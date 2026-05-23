"use client";

import { useMemo } from "react";
import { JarvisArcReactor } from "@/components/secretary/jarvis/JarvisArcReactor";
import { JarvisTypingText } from "@/components/secretary/jarvis/JarvisTypingText";
import type { Task } from "@/lib/secretary/types";

type JarvisAgentBriefingProps = {
  stats: {
    total: number;
    done: number;
    remaining: number;
    completionRate: number;
  };
  currentTask?: Task;
  isTodaySelected: boolean;
};

function buildBriefing({
  stats,
  currentTask,
  isTodaySelected,
}: JarvisAgentBriefingProps) {
  if (!isTodaySelected) {
    return "선택한 날짜의 일정을 분석 중입니다. 타임라인과 캘린더에서 상세 정보를 확인하세요.";
  }

  if (currentTask) {
    return `분석 결과, '${currentTask.title}'을(를) 우선 처리하는 것을 권장합니다. ${currentTask.startTime ?? ""} — ${currentTask.endTime ?? ""} 구간입니다.`;
  }

  if (stats.total === 0) {
    return "오늘 등록된 태스크가 없습니다. 음성 명령 또는 새 태스크 등록으로 일정을 추가할 수 있습니다.";
  }

  if (stats.remaining === 0) {
    return `오늘 ${stats.total}건의 태스크를 모두 완료했습니다. 시스템 상태: 최적.`;
  }

  return `오늘 ${stats.total}건 중 ${stats.done}건 완료, ${stats.remaining}건 남았습니다. 완료율 ${stats.completionRate}% — 계속 진행하시겠습니까?`;
}

export function JarvisAgentBriefing({
  stats,
  currentTask,
  isTodaySelected,
}: JarvisAgentBriefingProps) {
  const message = useMemo(
    () => buildBriefing({ stats, currentTask, isTodaySelected }),
    [stats, currentTask, isTodaySelected],
  );

  const showSyncBadge = isTodaySelected && stats.total > 0;

  return (
    <section className="jarvis-panel-glow relative mb-5 overflow-hidden px-4 py-3.5">
      <div
        className="jarvis-scanline pointer-events-none absolute inset-0 opacity-25"
        aria-hidden
      />
      <div
        className="jarvis-data-stream pointer-events-none absolute inset-y-0 right-0 w-px opacity-35"
        aria-hidden
      />

      <div className="pointer-events-none absolute -right-6 -top-6 opacity-20">
        <JarvisArcReactor size="sm" />
      </div>

      <div className="relative flex items-start gap-3">
        <div className="hidden shrink-0 sm:block">
          <JarvisArcReactor size="sm" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="jarvis-pulse h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <p className="jarvis-label text-[10px] text-primary">Agent Briefing</p>
            </div>

            {showSyncBadge ? (
              <span className="shrink-0 font-mono text-[9px] tracking-[0.2em] text-primary/40">
                {stats.completionRate}% SYNC
              </span>
            ) : (
              <span className="shrink-0 font-mono text-[9px] tracking-[0.2em] text-primary/30">
                STANDBY
              </span>
            )}
          </div>

          <div
            className="mt-1.5 h-px w-full max-w-sm bg-gradient-to-r from-primary/45 via-primary/15 to-transparent"
            aria-hidden
          />

          <p className="mt-1.5 text-base leading-7 text-foreground/90 md:text-lg md:leading-8">
            <JarvisTypingText text={message} />
          </p>
        </div>
      </div>
    </section>
  );
}
