"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveTagColor } from "@/lib/secretary/tagColors";
import { useTagColor } from "@/lib/secretary/taskStore";
import type { Task } from "@/lib/secretary/types";

type CalendarTaskChipProps = {
  task: Task;
  compact?: boolean;
  onToggleComplete: (id: string) => void;
  onEdit?: (task: Task) => void;
  onSnooze?: (id: string) => void;
  onDelete?: (id: string) => void;
};

type MenuPosition = {
  top: number;
  left: number;
};

function TaskActionMenu({
  task,
  isDone,
  position,
  onToggleComplete,
  onEdit,
  onSnooze,
  onDelete,
  onClose,
}: {
  task: Task;
  isDone: boolean;
  position: MenuPosition;
  onToggleComplete: (id: string) => void;
  onEdit?: (task: Task) => void;
  onSnooze?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}) {
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[200]"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="menu"
        className="fixed z-[210] min-w-[160px] overflow-hidden rounded-xl border border-primary/20 bg-popover py-1 shadow-[0_0_24px_rgba(0,212,255,0.12)]"
        style={{ top: position.top, left: position.left }}
        onClick={(event) => event.stopPropagation()}
      >
        {onEdit && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2.5 text-left text-xs hover:bg-primary/10"
            onClick={() => {
              onEdit(task);
              onClose();
            }}
          >
            편집
          </button>
        )}
        <button
          type="button"
          role="menuitem"
          className="flex w-full px-3 py-2.5 text-left text-xs hover:bg-primary/10"
          onClick={() => {
            onToggleComplete(task.id);
            onClose();
          }}
        >
          {isDone ? "미완료로 되돌리기" : "완료 처리"}
        </button>
        {onSnooze && !isDone && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2.5 text-left text-xs hover:bg-primary/10"
            onClick={() => {
              onSnooze(task.id);
              onClose();
            }}
          >
            10분 스누즈
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            role="menuitem"
            className="flex w-full px-3 py-2.5 text-left text-xs text-red-400 hover:bg-red-500/10"
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
          >
            삭제
          </button>
        )}
      </div>
    </>,
    document.body,
  );
}

export function CalendarTaskChip({
  task,
  compact = false,
  onToggleComplete,
  onEdit,
  onSnooze,
  onDelete,
}: CalendarTaskChipProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const colors = useTagColor(task.tag);
  const isDone = task.status === "done";

  const updateMenuPosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const menuWidth = 160;
    const menuHeight = 120;
    const gap = 6;

    let top = rect.bottom + gap;
    let left = rect.left;

    if (top + menuHeight > window.innerHeight - 8) {
      top = rect.top - menuHeight - gap;
    }
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    if (left < 8) left = 8;
    if (top < 8) top = rect.bottom + gap;

    setMenuPosition({ top, left });
  }, []);

  const openMenu = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      updateMenuPosition();
      setMenuOpen(true);
    },
    [updateMenuPosition],
  );

  const handleEdit = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      onEdit?.(task);
    },
    [onEdit, task],
  );

  useEffect(() => {
    if (!menuOpen) return;

    const handleReposition = () => updateMenuPosition();
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  return (
    <div ref={anchorRef} className="group/chip relative">
      <div
        className={cn(
          "flex w-full items-center gap-1 rounded-md border px-1 py-0.5 text-left transition-all",
          compact ? "text-[10px] leading-tight" : "text-xs",
          isDone && "opacity-60",
        )}
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border,
          boxShadow: isDone
            ? "none"
            : `inset 3px 0 0 ${colors.highlight}, 0 0 10px ${colors.highlight}`,
        }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleComplete(task.id);
          }}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full border transition active:scale-90",
            compact ? "h-3 w-3" : "h-3.5 w-3.5",
            isDone
              ? "border-current text-current"
              : "border-current/40 bg-card/60 hover:border-current",
          )}
          style={{ color: colors.text }}
          aria-label={isDone ? "미완료로 되돌리기" : "완료"}
        >
          {isDone && <Check className={compact ? "h-2 w-2" : "h-2.5 w-2.5"} strokeWidth={3} />}
        </button>

        <button
          type="button"
          onClick={onEdit ? handleEdit : openMenu}
          className={cn(
            "min-w-0 flex-1 truncate text-left",
            onEdit && "cursor-pointer hover:underline",
          )}
          style={{ color: colors.text }}
        >
          {!compact && task.startTime && (
            <span className="mr-1 font-medium opacity-80">{task.startTime}</span>
          )}
          <span className={cn(isDone && "line-through")}>{task.title}</span>
        </button>

        {!compact && (
          <button
            type="button"
            onClick={openMenu}
            className="shrink-0 rounded p-0.5 opacity-0 transition group-hover/chip:opacity-100 md:opacity-60"
            style={{ color: colors.text }}
            aria-label="더보기"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
        )}
      </div>

      {menuOpen && (
        <TaskActionMenu
          task={task}
          isDone={isDone}
          position={menuPosition}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onSnooze={onSnooze}
          onDelete={onDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
