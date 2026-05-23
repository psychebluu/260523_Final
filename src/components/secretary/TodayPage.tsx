"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { motion } from "framer-motion";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCalendar } from "@/components/secretary/TaskCalendar";
import { TaskDialog } from "@/components/secretary/TaskDialog";
import { TaskRow } from "@/components/secretary/TaskRow";
import { JarvisAgentBriefing } from "@/components/secretary/jarvis/JarvisAgentBriefing";
import { JarvisGreetingHero } from "@/components/secretary/jarvis/JarvisGreetingHero";
import { formatTodayHeading } from "@/components/secretary/useReminderEngine";
import { useSecretaryStore } from "@/lib/secretary/taskStore";
import type { Task } from "@/lib/secretary/types";
import { getTaskStats, getTimeGreeting, getTodayKey, refreshTaskStatuses, sortTasksByTime, countTodayPendingTasks } from "@/lib/secretary/utils";

type TaskFormData = Omit<Task, "id" | "createdAt" | "status" | "completedAt">;

export function TodayPage() {
  const [open, setOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState(getTodayKey());
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [greeting, setGreeting] = useState(() => getTimeGreeting());

  const allTasks = useSecretaryStore((state) => state.tasks);
  const seeded = useSecretaryStore((state) => state.seeded);
  const seedDemo = useSecretaryStore((state) => state.seedDemo);
  const addTask = useSecretaryStore((state) => state.addTask);
  const updateTask = useSecretaryStore((state) => state.updateTask);
  const completeTask = useSecretaryStore((state) => state.completeTask);
  const toggleTaskComplete = useSecretaryStore((state) => state.toggleTaskComplete);
  const snoozeTask = useSecretaryStore((state) => state.snoozeTask);
  const moveTaskToTomorrow = useSecretaryStore((state) => state.moveTaskToTomorrow);
  const deleteTask = useSecretaryStore((state) => state.deleteTask);
  const pushAlert = useSecretaryStore((state) => state.pushAlert);

  useEffect(() => {
    if (!seeded && allTasks.length === 0) {
      seedDemo();
    }
  }, [seeded, allTasks.length, seedDemo]);

  useEffect(() => {
    const updateGreeting = () => setGreeting(getTimeGreeting());
    updateGreeting();
    const timer = window.setInterval(updateGreeting, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshedTasks = useMemo(
    () => refreshTaskStatuses(allTasks),
    [allTasks],
  );

  const selectedDayTasks = useMemo(
    () => sortTasksByTime(refreshedTasks.filter((task) => task.date === selectedDate)),
    [refreshedTasks, selectedDate],
  );

  const isTodaySelected = selectedDate === getTodayKey();
  const stats = useMemo(() => getTaskStats(allTasks), [allTasks]);
  const todayPendingCount = useMemo(
    () => countTodayPendingTasks(allTasks),
    [allTasks],
  );

  const currentTask = selectedDayTasks.find(
    (task) => task.status === "in_progress" || task.status === "overdue",
  );
  const upcomingTasks = selectedDayTasks.filter(
    (task) => task.status === "scheduled" || task.status === "in_progress" || task.status === "overdue",
  );
  const doneTasks = selectedDayTasks.filter((task) => task.status === "done");

  const selectedDayLabel = isTodaySelected
    ? formatTodayHeading()
    : format(parseISO(selectedDate), "M월 d일 (EEE)", { locale: ko });

  const openAddDialog = (date: string) => {
    setEditingTask(null);
    setDialogDate(date);
    setSelectedDate(date);
    setOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setDialogDate(task.date);
    setSelectedDate(task.date);
    setOpen(true);
  };

  const handleDialogSubmit = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setEditingTask(null);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEditingTask(null);
    }
  };

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <JarvisGreetingHero
          greeting={greeting}
          taskCount={todayPendingCount}
          dateLabel={selectedDayLabel}
        />
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <Button
            variant="outline"
            className="rounded-lg border-primary/25 bg-transparent hover:border-primary/40 hover:bg-primary/5"
            onClick={() =>
              pushAlert({
                taskId: "demo",
                title: "시스템 알림",
                message: "에이전트 리마인드 UI 미리보기입니다",
                type: "before",
              })
            }
          >
            알림 미리보기
          </Button>
          <Button
            className="rounded-lg border border-primary/30 bg-primary/20 text-primary hover:bg-primary/30 hover:shadow-[0_0_16px_rgba(0,212,255,0.25)]"
            onClick={() => openAddDialog(selectedDate)}
          >
            <Plus className="h-4 w-4" />
            새 태스크 등록
          </Button>
        </div>
      </div>

      <JarvisAgentBriefing
        stats={stats}
        currentTask={currentTask}
        isTodaySelected={isTodaySelected}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { label: "전체", code: "TOTAL", value: stats.total },
          { label: "완료", code: "DONE", value: stats.done },
          { label: "남은 일", code: "OPEN", value: stats.remaining },
          { label: "완료율", code: "RATE", value: `${stats.completionRate}%` },
        ].map((item) => (
          <div key={item.label} className="jarvis-stat">
            <p className="jarvis-label text-[10px]">{item.code}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <TaskCalendar
          tasks={refreshedTasks}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onAddTask={openAddDialog}
          onEditTask={openEditDialog}
          onToggleComplete={toggleTaskComplete}
          onSnooze={(id) => snoozeTask(id, 10)}
          onDelete={deleteTask}
        />
      </div>

      {currentTask && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="jarvis-panel-glow mb-6 p-5"
        >
          <div className="flex items-center gap-2 jarvis-label text-primary">
            <Zap className="h-4 w-4" />
            Priority Recommendation
          </div>
          <p className="mt-2 text-lg font-semibold">{currentTask.title}</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {currentTask.startTime} — {currentTask.endTime}
          </p>
        </motion.div>
      )}

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="jarvis-panel p-5">
          <h2 className="text-lg font-semibold">타임라인</h2>
          <p className="mt-1 jarvis-label text-[10px] text-primary/50">Chronological View</p>
          <div className="mt-5 space-y-4">
            {selectedDayTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">선택한 날짜에 등록된 할 일이 없습니다.</p>
            ) : (
              selectedDayTasks.map((task) => (
                <div key={task.id} className="flex gap-3">
                  <div className="w-12 shrink-0 pt-1 text-right font-mono text-xs text-muted-foreground">
                    {task.startTime ?? "--:--"}
                  </div>
                  <div className="relative flex-1 border-l border-primary/20 pl-4">
                    <span
                      className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full ${
                        task.status === "done"
                          ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                          : task.status === "overdue"
                            ? "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"
                            : task.status === "in_progress"
                              ? "bg-primary shadow-[0_0_8px_rgba(0,212,255,0.6)]"
                              : "bg-muted-foreground/40"
                      }`}
                    />
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="font-mono text-xs text-muted-foreground">{task.endTime ?? ""}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="mb-1 text-lg font-semibold">예정 / 진행중</h2>
            <p className="mb-4 jarvis-label text-[10px] text-primary/50">Active Queue</p>
            <div className="space-y-3">
              {upcomingTasks.length === 0 ? (
                <div className="jarvis-panel rounded-xl border-dashed border-primary/20 p-8 text-center text-sm text-muted-foreground">
                  예정된 할 일이 없습니다. 새 태스크를 등록해 보세요.
                </div>
              ) : (
                upcomingTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onComplete={completeTask}
                    onToggleComplete={toggleTaskComplete}
                    onSnooze={(id) => snoozeTask(id, 10)}
                    onTomorrow={moveTaskToTomorrow}
                    onDelete={deleteTask}
                  />
                ))
              )}
            </div>
          </div>

          {doneTasks.length > 0 && (
            <div>
              <h2 className="mb-1 text-lg font-semibold">완료됨</h2>
              <p className="mb-4 jarvis-label text-[10px] text-emerald-400/70">Completed</p>
              <div className="space-y-3">
                {doneTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    compact
                    onToggleComplete={toggleTaskComplete}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <TaskDialog
        open={open}
        onOpenChange={handleDialogOpenChange}
        defaultDate={dialogDate}
        initialTask={editingTask ?? undefined}
        onSubmit={handleDialogSubmit}
      />
    </>
  );
}
