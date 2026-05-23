"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskRow } from "@/components/secretary/TaskRow";
import type { Task } from "@/lib/secretary/types";
import { sortTasksByTime } from "@/lib/secretary/utils";
import { useSecretaryStore } from "@/lib/secretary/taskStore";

export type DayTasksFilter = "all" | "done" | "remaining";

const FILTER_LABEL: Record<DayTasksFilter, string> = {
  all: "전체",
  done: "완료",
  remaining: "미완료",
};

type ReportDayTasksDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string | null;
  filter?: DayTasksFilter;
};

function filterDayTasks(tasks: Task[], filter: DayTasksFilter) {
  if (filter === "done") return tasks.filter((task) => task.status === "done");
  if (filter === "remaining") return tasks.filter((task) => task.status !== "done");
  return tasks;
}

export function ReportDayTasksDialog({
  open,
  onOpenChange,
  date,
  filter = "all",
}: ReportDayTasksDialogProps) {
  const allTasks = useSecretaryStore((state) => state.tasks);
  const toggleTaskComplete = useSecretaryStore((state) => state.toggleTaskComplete);

  const dayTasks = useMemo(() => {
    if (!date) return [];
    return sortTasksByTime(allTasks.filter((task) => task.date === date));
  }, [allTasks, date]);

  const filteredTasks = useMemo(
    () => filterDayTasks(dayTasks, filter),
    [dayTasks, filter],
  );

  const dateLabel = date
    ? format(parseISO(date), "M월 d일 (EEE)", { locale: ko })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden rounded-2xl">
        <DialogHeader>
          <DialogTitle>{dateLabel} 일정</DialogTitle>
          <DialogDescription>
            {FILTER_LABEL[filter]} {filteredTasks.length}건
            {filter !== "all" && dayTasks.length > 0 && (
              <span> · 전체 {dayTasks.length}건</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] space-y-2 overflow-y-auto pr-1">
          {filteredTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-primary/25 px-4 py-10 text-center text-sm text-muted-foreground">
              {filter === "all"
                ? "이 날짜에 등록된 일정이 없습니다."
                : `${FILTER_LABEL[filter]} 일정이 없습니다.`}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                compact
                onToggleComplete={toggleTaskComplete}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useReportDayTasksDialog() {
  const [state, setState] = useState<{
    open: boolean;
    date: string | null;
    filter: DayTasksFilter;
  }>({ open: false, date: null, filter: "all" });

  const openDayTasks = (date: string, filter: DayTasksFilter = "all") => {
    setState({ open: true, date, filter });
  };

  return {
    dialogProps: {
      open: state.open,
      onOpenChange: (open: boolean) => {
        setState((prev) => ({ ...prev, open }));
      },
      date: state.date,
      filter: state.filter,
    },
    openDayTasks,
  };
}
