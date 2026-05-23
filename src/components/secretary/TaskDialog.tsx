"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_SETTINGS } from "@/lib/secretary/constants";
import { TagSelector } from "@/components/secretary/TagSelector";
import type { Task, TaskPriority } from "@/lib/secretary/types";
import { getTodayKey } from "@/lib/secretary/utils";

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (task: Omit<Task, "id" | "createdAt" | "status" | "completedAt">) => void;
  initialTask?: Task;
  defaultDate?: string;
};

type TaskDialogFormProps = {
  initialTask?: Task;
  defaultDate?: string;
  onSubmit: TaskDialogProps["onSubmit"];
  onOpenChange: TaskDialogProps["onOpenChange"];
};

function TaskDialogForm({
  initialTask,
  defaultDate,
  onSubmit,
  onOpenChange,
}: TaskDialogFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [memo, setMemo] = useState(initialTask?.memo ?? "");
  const [date, setDate] = useState(initialTask?.date ?? defaultDate ?? getTodayKey());
  const [startTime, setStartTime] = useState(initialTask?.startTime ?? "14:00");
  const [endTime, setEndTime] = useState(initialTask?.endTime ?? "15:00");
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? "normal");
  const [tag, setTag] = useState(initialTask?.tag ?? "업무");
  const [remindBefore, setRemindBefore] = useState(
    initialTask?.remindBefore ?? DEFAULT_SETTINGS.defaultRemindBefore,
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      memo: memo.trim() || undefined,
      date,
      startTime,
      endTime,
      priority,
      tag,
      remindBefore,
      remindAtStart: true,
      remindAtEnd: true,
      remindOverdue: true,
    });

    onOpenChange(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 주간 보고서 작성"
          className="rounded-xl"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="date">날짜</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>업무 분류 태그</Label>
        <TagSelector value={tag} onChange={setTag} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start">시작</Label>
          <Input
            id="start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">종료</Label>
          <Input
            id="end"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>중요도</Label>
          <Select
            value={priority}
            onValueChange={(value) => value && setPriority(value as TaskPriority)}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">낮음</SelectItem>
              <SelectItem value="normal">보통</SelectItem>
              <SelectItem value="high">높음</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>시작 전 알림</Label>
          <Select
            value={String(remindBefore)}
            onValueChange={(value) => value && setRemindBefore(Number(value))}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">없음</SelectItem>
              <SelectItem value="5">5분 전</SelectItem>
              <SelectItem value="10">10분 전</SelectItem>
              <SelectItem value="15">15분 전</SelectItem>
              <SelectItem value="30">30분 전</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="memo">메모</Label>
        <Input
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="선택 입력"
          className="rounded-xl"
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
          취소
        </Button>
        <Button type="submit" className="rounded-lg border border-primary/30 bg-primary/20 text-primary hover:bg-primary/30">
          저장
        </Button>
      </div>
    </form>
  );
}

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTask,
  defaultDate,
}: TaskDialogProps) {
  const formKey = initialTask?.id ?? defaultDate ?? "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>{initialTask ? "할 일 수정" : "새 할 일"}</DialogTitle>
          <DialogDescription>
            에이전트가 일정을 모니터링하고 알려드립니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <TaskDialogForm
            key={formKey}
            initialTask={initialTask}
            defaultDate={defaultDate}
            onSubmit={onSubmit}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
