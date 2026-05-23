import { format, parseISO } from "date-fns";
import type { Task, TaskStatus } from "@/lib/secretary/types";

export function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 22 || hour < 7) return "Good night, Sir";
  if (hour < 13) return "Good morning, Sir";
  if (hour < 18) return "Good afternoon, Sir";
  return "Good evening, Sir";
}

export function sortTasksByTime(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const timeA = a.startTime ?? "99:99";
    const timeB = b.startTime ?? "99:99";
    return timeA.localeCompare(timeB);
  });
}

export function filterTodayTasks(tasks: Task[]) {
  const today = getTodayKey();
  return sortTasksByTime(tasks.filter((task) => task.date === today));
}

export function countTodayPendingTasks(tasks: Task[]) {
  const today = getTodayKey();
  return refreshTaskStatuses(tasks).filter(
    (task) => task.date === today && task.status !== "done",
  ).length;
}

export function getTaskStats(tasks: Task[]) {
  const todayTasks = filterTodayTasks(refreshTaskStatuses(tasks));
  const done = todayTasks.filter((task) => task.status === "done").length;
  const overdue = todayTasks.filter((task) => task.status === "overdue").length;
  const remaining = todayTasks.filter(
    (task) => task.status !== "done",
  ).length;

  return {
    total: todayTasks.length,
    done,
    overdue,
    remaining,
    completionRate:
      todayTasks.length > 0 ? Math.round((done / todayTasks.length) * 100) : 0,
  };
}

export function refreshTaskStatuses(tasks: Task[]): Task[] {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return tasks.map((task) => {
    if (task.status === "done") return task;

    const endMinutes = task.endTime
      ? Number(task.endTime.split(":")[0]) * 60 + Number(task.endTime.split(":")[1])
      : null;

    if (endMinutes !== null && nowMinutes > endMinutes) {
      return { ...task, status: "overdue" as TaskStatus };
    }

    const startMinutes = task.startTime
      ? Number(task.startTime.split(":")[0]) * 60 + Number(task.startTime.split(":")[1])
      : null;

    if (
      startMinutes !== null &&
      nowMinutes >= startMinutes &&
      (endMinutes === null || nowMinutes <= endMinutes)
    ) {
      return { ...task, status: "in_progress" as TaskStatus };
    }

    return { ...task, status: "scheduled" as TaskStatus };
  });
}

export function formatTaskTime(task: Task) {
  if (task.startTime && task.endTime) {
    return `${task.startTime} - ${task.endTime}`;
  }
  if (task.startTime) return task.startTime;
  return "시간 미지정";
}

export function formatTaskDate(date: string) {
  return format(parseISO(date), "yyyy.MM.dd");
}

export function toMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function isWithinQuietHours(
  now: Date,
  start: string,
  end: string,
): boolean {
  const current = now.getHours() * 60 + now.getMinutes();
  const startMin = toMinutes(start);
  const endMin = toMinutes(end);

  if (startMin <= endMin) {
    return current >= startMin && current < endMin;
  }

  return current >= startMin || current < endMin;
}
