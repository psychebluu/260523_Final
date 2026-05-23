"use client";

import { useMemo } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ReportDayTasksDialog,
  type DayTasksFilter,
  useReportDayTasksDialog,
} from "@/components/secretary/ReportDayTasksDialog";
import { cn } from "@/lib/utils";
import {
  getCompletionHeatColor,
  type DayReportStats,
  type MonthReportStats,
} from "@/lib/secretary/reportUtils";
import { getTodayKey } from "@/lib/secretary/utils";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

type ReportMonthCalendarProps = {
  stats: MonthReportStats;
  viewMonth: Date;
  onViewMonthChange: (month: Date) => void;
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
};

function StatCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string | number;
  onClick?: () => void;
}) {
  const clickable = !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={cn(
        "rounded-lg bg-card/50 px-3 py-2 text-left transition",
        clickable && "cursor-pointer hover:bg-primary/5 hover:ring-1 hover:ring-primary/25",
        !clickable && "cursor-default",
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-primary">{value}</p>
    </button>
  );
}

export function ReportMonthCalendar({
  stats,
  viewMonth,
  onViewMonthChange,
  selectedDate,
  onSelectDate,
}: ReportMonthCalendarProps) {
  const { dialogProps, openDayTasks } = useReportDayTasksDialog();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  const selectedDayStats: DayReportStats | null = selectedDate
    ? stats.dailyStats.get(selectedDate) ?? null
    : null;

  const handleDayClick = (dateKey: string, hasTasks: boolean) => {
    onSelectDate(dateKey);
    if (hasTasks) {
      openDayTasks(dateKey, "all");
    }
  };

  const handleDetailStatClick = (filter: DayTasksFilter) => {
    if (!selectedDate) return;
    openDayTasks(selectedDate, filter);
  };

  return (
    <>
      <section className="jarvis-panel p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">월간 캘린더</h2>
            <p className="text-sm text-muted-foreground">
              날짜 또는 상세 통계를 클릭하면 일정 목록을 확인할 수 있어요
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-lg"
              onClick={() => onViewMonthChange(subMonths(viewMonth, 1))}
              aria-label="이전 달"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[120px] text-center text-sm font-semibold">
              {format(viewMonth, "yyyy년 M월", { locale: ko })}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              className="rounded-lg"
              onClick={() => onViewMonthChange(addMonths(viewMonth, 1))}
              aria-label="다음 달"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                const today = parseISO(getTodayKey());
                onViewMonthChange(startOfMonth(today));
                onSelectDate(getTodayKey());
              }}
            >
              이번 달
            </Button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {[
            { label: "일정 없음", rate: -1, hasTasks: false },
            { label: "40% 미만", rate: 20, hasTasks: true },
            { label: "40~69%", rate: 55, hasTasks: true },
            { label: "70~99%", rate: 85, hasTasks: true },
            { label: "100%", rate: 100, hasTasks: true },
          ].map(({ label, rate, hasTasks }) => {
            const colors = getCompletionHeatColor(rate, hasTasks);
            return (
              <span key={label} className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 rounded border"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                  }}
                />
                {label}
              </span>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day, index) => (
                <div
                  key={day}
                  className={cn(
                    "py-2 text-center text-xs font-medium",
                    index >= 5 ? "text-red-400" : "text-muted-foreground",
                  )}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dateKey = format(day, "yyyy-MM-dd");
                const dayStats = stats.dailyStats.get(dateKey);
                const hasTasks = (dayStats?.total ?? 0) > 0;
                const colors = getCompletionHeatColor(
                  dayStats?.completionRate ?? 0,
                  hasTasks,
                );
                const isSelected = selectedDate === dateKey;
                const inMonth = isSameMonth(day, viewMonth);

                return (
                  <div
                    key={dateKey}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleDayClick(dateKey, hasTasks)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleDayClick(dateKey, hasTasks);
                      }
                    }}
                    className={cn(
                      "flex min-h-[88px] cursor-pointer flex-col rounded-xl border p-2 transition md:min-h-[100px]",
                      inMonth ? "" : "opacity-50",
                      isSelected
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                        : "hover:brightness-110",
                      isToday(day) && !isSelected && "ring-1 ring-primary/40",
                      hasTasks && "hover:ring-1 hover:ring-primary/40",
                    )}
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: isSelected ? "rgba(0, 212, 255, 0.6)" : colors.border,
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          isToday(day) && "bg-primary text-primary-foreground shadow-[0_0_8px_rgba(0,212,255,0.4)]",
                        )}
                        style={{ color: isToday(day) ? undefined : colors.text }}
                      >
                        {format(day, "d")}
                      </span>
                      {hasTasks && (
                        <span className="text-[10px] font-medium" style={{ color: colors.text }}>
                          {dayStats?.completionRate}%
                        </span>
                      )}
                    </div>

                    {hasTasks ? (
                      <div className="mt-auto space-y-0.5 text-[10px]" style={{ color: colors.text }}>
                        <p>전체 {dayStats?.total}건</p>
                        <p>완료 {dayStats?.done} · 미완료 {dayStats?.remaining}</p>
                      </div>
                    ) : (
                      <p className="mt-auto text-[10px]" style={{ color: colors.text }}>
                        일정 없음
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {selectedDayStats && selectedDate && (
          <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <h3 className="text-sm font-semibold">
              {format(parseISO(selectedDate), "M월 d일 (EEE)", { locale: ko })} 상세
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              전체·완료·미완료를 클릭하면 해당 일정 목록을 볼 수 있어요
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard
                label="전체"
                value={selectedDayStats.total}
                onClick={
                  selectedDayStats.total > 0
                    ? () => handleDetailStatClick("all")
                    : undefined
                }
              />
              <StatCard
                label="완료"
                value={selectedDayStats.done}
                onClick={
                  selectedDayStats.done > 0
                    ? () => handleDetailStatClick("done")
                    : undefined
                }
              />
              <StatCard
                label="미완료"
                value={selectedDayStats.remaining}
                onClick={
                  selectedDayStats.remaining > 0
                    ? () => handleDetailStatClick("remaining")
                    : undefined
                }
              />
              <StatCard
                label="완료율"
                value={`${selectedDayStats.completionRate}%`}
              />
            </div>
          </div>
        )}
      </section>

      <ReportDayTasksDialog {...dialogProps} />
    </>
  );
}
