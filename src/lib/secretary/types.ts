export type TaskStatus = "scheduled" | "in_progress" | "done" | "overdue";

export type TaskPriority = "low" | "normal" | "high";

export type Task = {
  id: string;
  title: string;
  memo?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tag?: string;
  remindBefore: number;
  remindAtStart: boolean;
  remindAtEnd: boolean;
  remindOverdue: boolean;
  completedAt?: string;
  createdAt: string;
};

export type ReminderAlert = {
  id: string;
  taskId: string;
  title: string;
  message: string;
  type: "before" | "start" | "end" | "overdue" | "daily";
  createdAt: string;
};

export type SecretarySettings = {
  pushEnabled: boolean;
  defaultRemindBefore: number;
  dailyReviewTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
};
