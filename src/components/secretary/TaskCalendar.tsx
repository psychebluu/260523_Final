"use client";

import { useMemo, useState } from "react";
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
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarTaskChip } from "@/components/secretary/CalendarTaskChip";
import { cn } from "@/lib/utils";
import { resolveTagColor } from "@/lib/secretary/tagColors";
import { useTagColorMap } from "@/lib/secretary/taskStore";
import { useAllTags } from "@/lib/secretary/taskStore";
import type { Task } from "@/lib/secretary/types";
import { getTodayKey, sortTasksByTime } from "@/lib/secretary/utils";

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];
const MAX_VISIBLE_TASKS = 3;

type TaskCalendarProps = {
  tasks: Task[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAddTask: (date: string) => void;
  onToggleComplete: (id: string) => void;
  onEditTask?: (task: Task) => void;
  onSnooze?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function TaskCalendar({
  tasks,
  selectedDate,
  onSelectDate,
  onAddTask,
  onToggleComplete,
  onEditTask,
  onSnooze,
  onDelete,
}: TaskCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => parseISO(selectedDate));

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      const list = map.get(task.date) ?? [];
      list.push(task);
      map.set(task.date, sortTasksByTime(list));
    }
    return map;
  }, [tasks]);

  const usedTags = useMemo(() => {
    const tags = new Set<string>();
    for (const task of tasks) {
      if (task.tag) tags.add(task.tag);
    }
    return Array.from(tags);
  }, [tasks]);

  const allTags = useAllTags();
  const tagColorMap = useTagColorMap();
  const unusedTags = allTags.filter((tag) => !usedTags.includes(tag));

  const selectedDayTasks = tasksByDate.get(selectedDate) ?? [];

  return (
    <section className="jarvis-panel p-4 md:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">일정 달력</h2>
          <p className="text-sm text-muted-foreground">
            날짜 클릭으로 선택 · 일정 클릭으로 편집 · + 버튼으로 추가
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-lg"
            onClick={() => setViewMonth((prev) => subMonths(prev, 1))}
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
            onClick={() => setViewMonth((prev) => addMonths(prev, 1))}
            aria-label="다음 달"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => {
              const today = getTodayKey();
              onSelectDate(today);
              setViewMonth(parseISO(today));
            }}
          >
            오늘
          </Button>
        </div>
      </div>

      {(usedTags.length > 0 || unusedTags.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {usedTags.map((tag) => {
            const colors = resolveTagColor(tag, tagColorMap);
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colors.highlight }}
                />
                {tag}
              </span>
            );
          })}
          {unusedTags.slice(0, 3).map((tag) => {
            const colors = resolveTagColor(tag, tagColorMap);
            return (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground"
                style={{ borderColor: colors.border }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}

      <div className="relative overflow-x-auto">
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
              const dayTasks = tasksByDate.get(dateKey) ?? [];
              const visibleTasks = dayTasks.slice(0, MAX_VISIBLE_TASKS);
              const hiddenCount = dayTasks.length - visibleTasks.length;
              const isSelected = dateKey === selectedDate;
              const inMonth = isSameMonth(day, viewMonth);

              return (
                <div
                  key={dateKey}
                  tabIndex={0}
                  onClick={() => onSelectDate(dateKey)}
                  onDoubleClick={(event) => {
                    event.preventDefault();
                    onSelectDate(dateKey);
                    onAddTask(dateKey);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelectDate(dateKey);
                    }
                  }}
                  className={cn(
                    "group/day flex min-h-[88px] cursor-pointer flex-col rounded-xl border p-1.5 text-left transition md:min-h-[108px] md:p-2",
                    inMonth ? "bg-card/40" : "bg-muted/30",
                    isSelected
                      ? "border-primary ring-2 ring-primary/25"
                      : "border-border hover:border-primary/35 hover:bg-primary/5",
                    isToday(day) && !isSelected && "border-primary/40 bg-primary/5",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        isToday(day) && "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(0,212,255,0.4)]",
                        !isToday(day) && inMonth && "text-foreground",
                        !inMonth && "text-muted-foreground/50",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <span
                        role="button"
                        tabIndex={-1}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectDate(dateKey);
                          onAddTask(dateKey);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            onSelectDate(dateKey);
                            onAddTask(dateKey);
                          }
                        }}
                        className={cn(
                          "flex h-5 w-5 items-center justify-center rounded-md text-primary transition hover:bg-primary/10",
                          isSelected
                            ? "opacity-100"
                            : "opacity-0 group-hover/day:opacity-100",
                        )}
                        aria-label={`${format(day, "M월 d일")} 일정 추가`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">{dayTasks.length}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                    {visibleTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={(event) => event.stopPropagation()}
                        onKeyDown={(event) => event.stopPropagation()}
                        role="presentation"
                      >
                        <CalendarTaskChip
                          task={task}
                          compact
                          onToggleComplete={onToggleComplete}
                          onEdit={onEditTask}
                          onSnooze={onSnooze}
                          onDelete={onDelete}
                        />
                      </div>
                    ))}
                    {hiddenCount > 0 && (
                      <span className="px-1 text-[10px] font-medium text-primary">
                        +{hiddenCount}개 더
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">
            {format(parseISO(selectedDate), "M월 d일 (EEE)", { locale: ko })} 일정
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{selectedDayTasks.length}건</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-lg px-2 text-xs"
              onClick={() => onAddTask(selectedDate)}
            >
              <Plus className="h-3 w-3" />
              일정 추가
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {selectedDayTasks.length === 0 ? (
            <button
              type="button"
              onClick={() => onAddTask(selectedDate)}
              className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-primary/25 bg-card/40 py-6 text-sm text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="h-5 w-5" />
              이 날짜에 일정 추가하기
            </button>
          ) : (
            selectedDayTasks.map((task) => (
              <CalendarTaskChip
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onSnooze={onSnooze}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
