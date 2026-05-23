import { format, addDays } from "date-fns";
import type { SecretarySettings, Task, TaskStatus } from "@/lib/secretary/types";

export const DEFAULT_SETTINGS: SecretarySettings = {
  pushEnabled: true,
  defaultRemindBefore: 10,
  dailyReviewTime: "21:00",
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
};

export function createSampleTasks(): Task[] {
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const dayAfter = format(addDays(new Date(), 2), "yyyy-MM-dd");
  const yesterday = format(addDays(new Date(), -1), "yyyy-MM-dd");

  return [
    {
      id: "sample-1",
      title: "팀 주간 보고서 작성",
      memo: "지표 정리 후 슬랙 공유",
      date: today,
      startTime: "10:00",
      endTime: "11:00",
      status: "done",
      priority: "high",
      tag: "업무",
      remindBefore: 10,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-2",
      title: "고객 미팅 자료 검토",
      date: today,
      startTime: "14:00",
      endTime: "15:00",
      status: "in_progress",
      priority: "normal",
      tag: "회의",
      remindBefore: 10,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-3",
      title: "일일 회고 작성",
      date: today,
      startTime: "17:30",
      endTime: "18:00",
      status: "scheduled",
      priority: "low",
      tag: "개인",
      remindBefore: 10,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-4",
      title: "분기 OKR 정리",
      date: tomorrow,
      startTime: "09:30",
      endTime: "11:00",
      status: "scheduled",
      priority: "high",
      tag: "프로젝트",
      remindBefore: 15,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-5",
      title: "CS팀 주간 회의",
      date: tomorrow,
      startTime: "15:00",
      endTime: "16:00",
      status: "scheduled",
      priority: "normal",
      tag: "회의",
      remindBefore: 10,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-6",
      title: "신규 기능 QA",
      date: dayAfter,
      startTime: "13:00",
      endTime: "14:30",
      status: "scheduled",
      priority: "high",
      tag: "긴급",
      remindBefore: 10,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-7",
      title: "UX 리서치 정리",
      date: dayAfter,
      startTime: "16:00",
      endTime: "17:00",
      status: "scheduled",
      priority: "normal",
      tag: "학습",
      remindBefore: 10,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: "sample-8",
      title: "월간 실적 리뷰",
      date: yesterday,
      startTime: "11:00",
      endTime: "12:00",
      status: "done",
      priority: "normal",
      tag: "업무",
      remindBefore: 10,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  scheduled: "예정",
  in_progress: "진행중",
  done: "완료",
  overdue: "지연",
};

export const DEFAULT_TAGS = ["업무", "회의", "개인", "프로젝트", "긴급"] as const;

/** @deprecated DEFAULT_TAGS 사용 */
export const PRESET_TAGS = [...DEFAULT_TAGS];

export const PRIORITY_LABEL = {
  low: "낮음",
  normal: "보통",
  high: "높음",
};
