"use client";

import { useMemo, useState } from "react";
import { format, parseISO, startOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { ReportMonthCalendar } from "@/components/secretary/ReportMonthCalendar";
import { ReportNav } from "@/components/secretary/ReportNav";
import {
  ReportDayTasksDialog,
  useReportDayTasksDialog,
} from "@/components/secretary/ReportDayTasksDialog";
import { resolveTagColor } from "@/lib/secretary/tagColors";
import { useTagColorMap } from "@/lib/secretary/taskStore";
import { getMonthReportStats } from "@/lib/secretary/reportUtils";
import { useSecretaryStore } from "@/lib/secretary/taskStore";
import { getTodayKey } from "@/lib/secretary/utils";

export function MonthlyReportPage() {
  const allTasks = useSecretaryStore((state) => state.tasks);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayKey());

  const monthStats = useMemo(
    () => getMonthReportStats(allTasks, viewMonth),
    [allTasks, viewMonth],
  );
  const tagColorMap = useTagColorMap();
  const { dialogProps, openDayTasks } = useReportDayTasksDialog();

  return (
    <>
      <ReportNav />

      <div className="mb-8">
        <p className="jarvis-label">Monthly Report</p>
        <h1 className="mt-2 text-3xl font-bold">한 달 돌아보기</h1>
        <p className="mt-2 text-muted-foreground">
          {format(viewMonth, "yyyy년 M월", { locale: ko })} 업무 통계
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "전체 일정", value: monthStats.total },
          { label: "완료", value: monthStats.done },
          { label: "미완료", value: monthStats.remaining },
          { label: "완료율", value: `${monthStats.completionRate}%` },
          { label: "활동일", value: `${monthStats.activeDays}일` },
        ].map((item) => (
          <div key={item.label} className="jarvis-stat">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="jarvis-panel p-6">
          <p className="jarvis-label text-[10px] text-primary/60">Monthly Completion</p>
          <p className="mt-3 text-5xl font-bold text-primary">
            {monthStats.completionRate}%
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(0,212,255,0.5)] transition-all"
              style={{ width: `${monthStats.completionRate}%` }}
            />
          </div>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">미이행(과거 미완료)</span>
              <span className="font-semibold text-red-400">{monthStats.missed}건</span>
            </div>
            {monthStats.bestDay && (
              <button
                type="button"
                onClick={() => openDayTasks(monthStats.bestDay!.date, "all")}
                className="w-full rounded-xl border border-primary/10 bg-primary/5 p-3 text-left transition hover:border-primary/25 hover:bg-primary/10 hover:ring-1 hover:ring-primary/20"
              >
                <p className="text-xs text-muted-foreground">가장 잘한 날 · 클릭하여 일정 보기</p>
                <p className="mt-1 font-semibold">
                  {format(parseISO(monthStats.bestDay.date), "M월 d일", { locale: ko })}
                </p>
                <p className="text-xs text-primary">
                  완료율 {monthStats.bestDay.completionRate}% · {monthStats.bestDay.total}건
                </p>
              </button>
            )}
          </div>
        </section>

        <section className="jarvis-panel p-6">
          <h2 className="text-lg font-semibold">태그별 통계</h2>
          <p className="mt-1 text-sm text-muted-foreground">월간 태그 분류별 완료 현황</p>
          <div className="mt-5 space-y-3">
            {monthStats.tagStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">이번 달 등록된 일정이 없습니다.</p>
            ) : (
              monthStats.tagStats.map((tagStat) => {
                const colors = resolveTagColor(tagStat.tag, tagColorMap);
                return (
                  <div key={tagStat.tag} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span
                        className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                          color: colors.text,
                        }}
                      >
                        {tagStat.tag}
                      </span>
                      <span className="text-muted-foreground">
                        {tagStat.done}/{tagStat.total} · {tagStat.completionRate}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${tagStat.completionRate}%`,
                          backgroundColor: colors.highlight,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <ReportMonthCalendar
        stats={monthStats}
        viewMonth={viewMonth}
        onViewMonthChange={setViewMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <ReportDayTasksDialog {...dialogProps} />
    </>
  );
}
