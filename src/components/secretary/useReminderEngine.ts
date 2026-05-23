"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useSecretaryStore } from "@/lib/secretary/taskStore";
import { isWithinQuietHours, toMinutes } from "@/lib/secretary/utils";

const firedKeys = new Set<string>();

export function useReminderEngine() {
  const seeded = useSecretaryStore((state) => state.seeded);
  const seedDemo = useSecretaryStore((state) => state.seedDemo);
  const initialized = useRef(false);

  useEffect(() => {
    if (!seeded && !initialized.current) {
      initialized.current = true;
      seedDemo();
    }
  }, [seeded, seedDemo]);

  useEffect(() => {
    const tick = () => {
      const { settings, syncStatuses, pushAlert } = useSecretaryStore.getState();
      syncStatuses();

      const { tasks } = useSecretaryStore.getState();
      const now = new Date();

      if (isWithinQuietHours(now, settings.quietHoursStart, settings.quietHoursEnd)) {
        return;
      }

      const today = format(now, "yyyy-MM-dd");
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      for (const task of tasks) {
        if (task.date !== today || task.status === "done") continue;

        if (task.startTime && task.remindBefore > 0) {
          const start = toMinutes(task.startTime);
          const trigger = start - task.remindBefore;
          const key = `${task.id}-before-${today}-${trigger}`;
          if (nowMinutes === trigger && !firedKeys.has(key)) {
            firedKeys.add(key);
            pushAlert({
              taskId: task.id,
              title: "시작 예정",
              message: `${task.remindBefore}분 뒤 '${task.title}' 시작`,
              type: "before",
            });
            notifyBrowser(`곧 시작: ${task.title}`, `${task.remindBefore}분 뒤 시작 예정`);
          }
        }

        if (task.startTime && task.remindAtStart) {
          const start = toMinutes(task.startTime);
          const key = `${task.id}-start-${today}-${start}`;
          if (nowMinutes === start && !firedKeys.has(key)) {
            firedKeys.add(key);
            pushAlert({
              taskId: task.id,
              title: "지금 시작",
              message: `'${task.title}' 시작 시간입니다`,
              type: "start",
            });
            notifyBrowser(`지금 시작: ${task.title}`, "할 일을 시작할 시간이에요");
          }
        }

        if (task.endTime && task.remindAtEnd) {
          const end = toMinutes(task.endTime);
          const key = `${task.id}-end-${today}-${end}`;
          if (nowMinutes === end && !firedKeys.has(key)) {
            firedKeys.add(key);
            pushAlert({
              taskId: task.id,
              title: "마감 시간",
              message: `'${task.title}' 마감 시간입니다`,
              type: "end",
            });
            notifyBrowser(`마감: ${task.title}`, "완료 여부를 확인해 주세요");
          }
        }

        if (task.endTime && task.remindOverdue && task.status === "overdue") {
          const overdueTrigger = toMinutes(task.endTime) + 15;
          const key = `${task.id}-overdue-${today}-${overdueTrigger}`;
          if (nowMinutes === overdueTrigger && !firedKeys.has(key)) {
            firedKeys.add(key);
            pushAlert({
              taskId: task.id,
              title: "미완료 리마인드",
              message: `'${task.title}' 아직 완료되지 않았어요`,
              type: "overdue",
            });
            notifyBrowser(`미완료: ${task.title}`, "아직 완료되지 않은 할 일이 있어요");
          }
        }
      }

      const dailyTrigger = toMinutes(settings.dailyReviewTime);
      const dailyKey = `daily-${today}-${dailyTrigger}`;
      const incomplete = tasks.filter(
        (task) => task.date === today && task.status !== "done",
      ).length;

      if (incomplete > 0 && nowMinutes === dailyTrigger && !firedKeys.has(dailyKey)) {
        firedKeys.add(dailyKey);
        pushAlert({
          taskId: "daily",
          title: "하루 마감",
          message: `오늘 미완료 ${incomplete}건이 남았어요`,
          type: "daily",
        });
      }
    };

    tick();
    const timer = window.setInterval(tick, 30_000);
    return () => window.clearInterval(timer);
  }, []);
}

function notifyBrowser(title: string, body: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification(title, { body });
}

export function formatTodayHeading(date = new Date()) {
  return format(date, "yyyy.MM.dd EEEE", { locale: ko });
}
