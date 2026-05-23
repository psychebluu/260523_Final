"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/secretary/TaskDialog";
import { TaskRow } from "@/components/secretary/TaskRow";
import { useSecretaryStore } from "@/lib/secretary/taskStore";
import { sortTasksByTime } from "@/lib/secretary/utils";

export function AllTasksPage() {
  const [open, setOpen] = useState(false);
  const tasks = useSecretaryStore((state) => state.tasks);
  const addTask = useSecretaryStore((state) => state.addTask);
  const completeTask = useSecretaryStore((state) => state.completeTask);
  const snoozeTask = useSecretaryStore((state) => state.snoozeTask);
  const moveTaskToTomorrow = useSecretaryStore((state) => state.moveTaskToTomorrow);
  const deleteTask = useSecretaryStore((state) => state.deleteTask);

  const sortedTasks = useMemo(() => sortTasksByTime(tasks), [tasks]);

  return (
    <>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="jarvis-label">Task Registry</p>
          <h1 className="mt-2 text-3xl font-bold">모든 할 일</h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">TOTAL {sortedTasks.length}</p>
        </div>
        <Button
          className="rounded-lg border border-primary/30 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-[0_0_16px_rgba(0,212,255,0.25)]"
          onClick={() => setOpen(true)}
        >
          <Plus className="h-4 w-4" />
          새 태스크 등록
        </Button>
      </div>

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="jarvis-panel rounded-xl border-dashed border-primary/20 p-10 text-center text-sm text-muted-foreground">
            등록된 할 일이 없습니다.
          </div>
        ) : (
          sortedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onComplete={completeTask}
              onSnooze={(id) => snoozeTask(id, 10)}
              onTomorrow={moveTaskToTomorrow}
              onDelete={deleteTask}
            />
          ))
        )}
      </div>

      <TaskDialog open={open} onOpenChange={setOpen} onSubmit={addTask} />
    </>
  );
}
