"use client";

import { formatTaskTime } from "@/lib/secretary/utils";
import { STATUS_LABEL } from "@/lib/secretary/constants";
import type { Task } from "@/lib/secretary/types";
import { cn } from "@/lib/utils";
import { useTagColor } from "@/lib/secretary/taskStore";
import { Button } from "@/components/ui/button";
import { Check, Clock3, MoreHorizontal } from "lucide-react";

type TaskRowProps = {
  task: Task;
  compact?: boolean;
  onComplete?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  onSnooze?: (id: string) => void;
  onTomorrow?: (id: string) => void;
  onDelete?: (id: string) => void;
};

const STATUS_STYLE = {
  scheduled: "border-border bg-card/50",
  in_progress: "border-primary/35 bg-primary/10 shadow-[0_0_16px_rgba(0,212,255,0.08)]",
  done: "border-emerald-500/25 bg-emerald-500/5 opacity-80",
  overdue: "border-red-500/35 bg-red-500/10 shadow-[0_0_12px_rgba(255,68,102,0.08)]",
};

const BADGE_STYLE = {
  scheduled: "border border-border bg-muted text-muted-foreground",
  in_progress: "border border-primary/30 bg-primary/10 text-primary",
  done: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  overdue: "border border-red-500/30 bg-red-500/10 text-red-400",
};

export function TaskRow({
  task,
  compact = false,
  onComplete,
  onToggleComplete,
  onSnooze,
  onTomorrow,
  onDelete,
}: TaskRowProps) {
  const tagColors = useTagColor(task.tag);
  const handleToggle = onToggleComplete ?? onComplete;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition",
        STATUS_STYLE[task.status],
      )}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => handleToggle?.(task.id)}
          className={cn(
            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
            task.status === "done"
              ? "border-emerald-400 bg-emerald-400/20 text-emerald-400"
              : "border-primary/30 bg-transparent hover:border-primary hover:bg-primary/10 hover:shadow-[0_0_8px_rgba(0,212,255,0.3)]",
          )}
          aria-label={task.status === "done" ? "미완료로 되돌리기" : "완료"}
        >
          {task.status === "done" && <Check className="h-3.5 w-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-medium",
                task.status === "done" && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide",
                BADGE_STYLE[task.status],
              )}
            >
              {STATUS_LABEL[task.status]}
            </span>
            {task.tag && (
              <span
                className="rounded-full border px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: tagColors.bg,
                  borderColor: tagColors.border,
                  color: tagColors.text,
                }}
              >
                {task.tag}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTaskTime(task)}
            </span>
            {!compact && task.memo && <span>{task.memo}</span>}
          </div>

          {!compact && task.status !== "done" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg border-primary/20 bg-transparent hover:border-primary/40 hover:bg-primary/5"
                onClick={() => onSnooze?.(task.id)}
              >
                10분 스누즈
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-lg border-primary/20 bg-transparent hover:border-primary/40 hover:bg-primary/5"
                onClick={() => onTomorrow?.(task.id)}
              >
                내일로
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-400"
                onClick={() => onDelete?.(task.id)}
              >
                삭제
              </Button>
            </div>
          )}
        </div>

        {compact && (
          <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>
    </div>
  );
}
