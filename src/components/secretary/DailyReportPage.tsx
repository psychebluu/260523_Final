"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ReportDayTasksDialog,
  type DayTasksFilter,
  useReportDayTasksDialog,
} from "@/components/secretary/ReportDayTasksDialog";
import { ReportNav } from "@/components/secretary/ReportNav";
import { TaskRow } from "@/components/secretary/TaskRow";
import { formatTodayHeading } from "@/components/secretary/useReminderEngine";
import { cn } from "@/lib/utils";
import { useSecretaryStore, useTodayTasks } from "@/lib/secretary/taskStore";
import { getTaskStats, getTodayKey } from "@/lib/secretary/utils";

function StatCard({
  label,
  value,
  onClick,
  disabled,
}: {
  label: string;
  value: number;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-2 py-1 text-center transition",
        !disabled && "cursor-pointer hover:bg-primary/5 hover:ring-1 hover:ring-primary/25",
        disabled && "cursor-default opacity-60",
      )}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-primary">{value}</p>
    </button>
  );
}

export function DailyReportPage() {
  const todayTasks = useTodayTasks();
  const allTasks = useSecretaryStore((state) => state.tasks);
  const completeTask = useSecretaryStore((state) => state.completeTask);
  const moveTaskToTomorrow = useSecretaryStore((state) => state.moveTaskToTomorrow);
  const { dialogProps, openDayTasks } = useReportDayTasksDialog();

  const stats = useMemo(() => getTaskStats(allTasks), [allTasks]);
  const incomplete = todayTasks.filter((task) => task.status !== "done");
  const today = getTodayKey();

  const openTodayTasks = (filter: DayTasksFilter) => {
    openDayTasks(today, filter);
  };

  return (
    <>
      <ReportNav />

      <div className="mb-8">
        <p className="jarvis-label">Daily Report</p>
        <h1 className="mt-2 text-3xl font-bold">하루 마감</h1>
        <p className="mt-2 text-muted-foreground">{formatTodayHeading()}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="jarvis-panel p-6">
          <p className="jarvis-label text-[10px] text-primary/60">Completion Rate</p>
          <p className="mt-3 text-5xl font-bold text-primary">
            {stats.completionRate}%
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className="h-full rounded-full bg-primary shadow-[0_0_12px_rgba(0,212,255,0.5)] transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            아래 숫자를 클릭하면 오늘 일정 목록을 볼 수 있어요
          </p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <StatCard
              label="전체"
              value={stats.total}
              onClick={() => openTodayTasks("all")}
              disabled={stats.total === 0}
            />
            <StatCard
              label="완료"
              value={stats.done}
              onClick={() => openTodayTasks("done")}
              disabled={stats.done === 0}
            />
            <StatCard
              label="미완료"
              value={stats.remaining}
              onClick={() => openTodayTasks("remaining")}
              disabled={stats.remaining === 0}
            />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">미완료 목록</h2>
              <p className="jarvis-label mt-1 text-[10px] text-primary/50">Pending Queue</p>
            </div>
            {incomplete.length > 0 && (
              <Button
                variant="outline"
                className="rounded-lg border-primary/20 bg-transparent hover:border-primary/40 hover:bg-primary/5"
                onClick={() => incomplete.forEach((task) => moveTaskToTomorrow(task.id))}
              >
                모두 내일로
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {incomplete.length === 0 ? (
              <div className="jarvis-panel-glow border-emerald-500/25 bg-emerald-500/5 p-8 text-center">
                <p className="font-medium text-emerald-400">오늘 할 일을 모두 마쳤어요</p>
              </div>
            ) : (
              incomplete.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onComplete={completeTask}
                  onTomorrow={moveTaskToTomorrow}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <ReportDayTasksDialog {...dialogProps} />
    </>
  );
}
