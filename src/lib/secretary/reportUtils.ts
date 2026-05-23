import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
} from "date-fns";
import type { Task } from "@/lib/secretary/types";

export type DayReportStats = {
  date: string;
  total: number;
  done: number;
  remaining: number;
  missed: number;
  completionRate: number;
};

export type TagReportStats = {
  tag: string;
  total: number;
  done: number;
  completionRate: number;
};

export type MonthReportStats = {
  monthKey: string;
  total: number;
  done: number;
  remaining: number;
  missed: number;
  completionRate: number;
  activeDays: number;
  bestDay: DayReportStats | null;
  dailyStats: Map<string, DayReportStats>;
  tagStats: TagReportStats[];
};

function isMissedTask(task: Task, today: Date) {
  if (task.status === "done") return false;
  const taskDate = startOfDay(parseISO(task.date));
  return isBefore(taskDate, today);
}

export function filterTasksByMonth(tasks: Task[], month: Date) {
  const monthKey = format(month, "yyyy-MM");
  return tasks.filter((task) => task.date.startsWith(monthKey));
}

export function getDayReportStats(tasks: Task[], date: string, today = new Date()): DayReportStats {
  const dayTasks = tasks.filter((task) => task.date === date);
  const done = dayTasks.filter((task) => task.status === "done").length;
  const missed = dayTasks.filter((task) => isMissedTask(task, today)).length;
  const remaining = dayTasks.length - done;

  return {
    date,
    total: dayTasks.length,
    done,
    remaining,
    missed,
    completionRate:
      dayTasks.length > 0 ? Math.round((done / dayTasks.length) * 100) : 0,
  };
}

export function getMonthReportStats(tasks: Task[], month: Date): MonthReportStats {
  const monthTasks = filterTasksByMonth(tasks, month);
  const monthKey = format(month, "yyyy-MM");
  const today = startOfDay(new Date());

  const dailyStats = new Map<string, DayReportStats>();
  const monthDays = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  for (const day of monthDays) {
    const dateKey = format(day, "yyyy-MM-dd");
    dailyStats.set(dateKey, getDayReportStats(monthTasks, dateKey, today));
  }

  const done = monthTasks.filter((task) => task.status === "done").length;
  const missed = monthTasks.filter((task) => isMissedTask(task, today)).length;
  const remaining = monthTasks.length - done;
  const activeDays = Array.from(dailyStats.values()).filter((day) => day.total > 0).length;

  const tagMap = new Map<string, { total: number; done: number }>();
  for (const task of monthTasks) {
    const tag = task.tag ?? "미분류";
    const current = tagMap.get(tag) ?? { total: 0, done: 0 };
    current.total += 1;
    if (task.status === "done") current.done += 1;
    tagMap.set(tag, current);
  }

  const tagStats = Array.from(tagMap.entries())
    .map(([tag, value]) => ({
      tag,
      total: value.total,
      done: value.done,
      completionRate: value.total > 0 ? Math.round((value.done / value.total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const daysWithTasks = Array.from(dailyStats.values()).filter((day) => day.total > 0);
  const bestDay =
    daysWithTasks.length > 0
      ? [...daysWithTasks].sort((a, b) => b.completionRate - a.completionRate || b.total - a.total)[0]
      : null;

  return {
    monthKey,
    total: monthTasks.length,
    done,
    remaining,
    missed,
    completionRate:
      monthTasks.length > 0 ? Math.round((done / monthTasks.length) * 100) : 0,
    activeDays,
    bestDay,
    dailyStats,
    tagStats,
  };
}

export function getCompletionHeatColor(rate: number, hasTasks: boolean) {
  if (!hasTasks) {
    return { bg: "rgba(0, 212, 255, 0.04)", text: "#6b8fa3", border: "rgba(0, 212, 255, 0.1)" };
  }
  if (rate >= 100) {
    return { bg: "rgba(52, 211, 153, 0.14)", text: "#34d399", border: "rgba(52, 211, 153, 0.35)" };
  }
  if (rate >= 70) {
    return { bg: "rgba(0, 212, 255, 0.12)", text: "#00d4ff", border: "rgba(0, 212, 255, 0.35)" };
  }
  if (rate >= 40) {
    return { bg: "rgba(250, 204, 21, 0.1)", text: "#fbbf24", border: "rgba(250, 204, 21, 0.3)" };
  }
  return { bg: "rgba(255, 68, 102, 0.12)", text: "#ff4466", border: "rgba(255, 68, 102, 0.35)" };
}
