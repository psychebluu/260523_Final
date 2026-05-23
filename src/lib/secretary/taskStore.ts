"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createSampleTasks, DEFAULT_SETTINGS, DEFAULT_TAGS } from "@/lib/secretary/constants";
import {
  DEFAULT_TAG_COLORS,
  migrateTagColors,
  pickColorForNewTag,
} from "@/lib/secretary/tagPalette";
import { resolveTagColor, type TagColor } from "@/lib/secretary/tagColors";
import { getAllTags, validateCustomTagName } from "@/lib/secretary/tagUtils";
import type { ReminderAlert, SecretarySettings, Task } from "@/lib/secretary/types";
import { getTodayKey, refreshTaskStatuses } from "@/lib/secretary/utils";

type TaskInput = Omit<Task, "id" | "createdAt" | "status" | "completedAt"> & {
  status?: Task["status"];
};

type SecretaryStore = {
  tasks: Task[];
  settings: SecretarySettings;
  customTags: string[];
  tagColors: Record<string, string>;
  alerts: ReminderAlert[];
  seeded: boolean;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: Partial<TaskInput>) => void;
  completeTask: (id: string) => void;
  uncompleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  snoozeTask: (id: string, minutes: number) => void;
  moveTaskToTomorrow: (id: string) => void;
  deleteTask: (id: string) => void;
  updateSettings: (settings: Partial<SecretarySettings>) => void;
  addCustomTag: (name: string) => string | null;
  renameCustomTag: (oldName: string, newName: string) => string | null;
  deleteCustomTag: (name: string) => void;
  setTagColor: (tag: string, hex: string) => void;
  pushAlert: (alert: Omit<ReminderAlert, "id" | "createdAt">) => void;
  dismissAlert: (id: string) => void;
  syncStatuses: () => void;
  seedDemo: () => void;
};

export const useSecretaryStore = create<SecretaryStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      settings: DEFAULT_SETTINGS,
      customTags: [],
      tagColors: { ...DEFAULT_TAG_COLORS },
      alerts: [],
      seeded: false,
      addTask: (input) =>
        set((state) => ({
          tasks: [
            {
              ...input,
              id: crypto.randomUUID(),
              status: input.status ?? "scheduled",
              createdAt: new Date().toISOString(),
            },
            ...state.tasks,
          ],
        })),
      updateTask: (id, input) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...input } : task,
          ),
        })),
      completeTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: "done",
                  completedAt: new Date().toISOString(),
                }
              : task,
          ),
        })),
      uncompleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: "scheduled",
                  completedAt: undefined,
                }
              : task,
          ),
        })),
      toggleTaskComplete: (id) => {
        const task = get().tasks.find((item) => item.id === id);
        if (!task) return;
        if (task.status === "done") {
          get().uncompleteTask(id);
        } else {
          get().completeTask(id);
        }
      },
      snoozeTask: (id, minutes) => {
        const task = get().tasks.find((item) => item.id === id);
        if (!task?.startTime) return;

        const [hour, minute] = task.startTime.split(":").map(Number);
        const total = hour * 60 + minute + minutes;
        const nextHour = Math.floor(total / 60) % 24;
        const nextMinute = total % 60;
        const nextStart = `${String(nextHour).padStart(2, "0")}:${String(nextMinute).padStart(2, "0")}`;

        set((state) => ({
          tasks: state.tasks.map((item) =>
            item.id === id
              ? {
                  ...item,
                  startTime: nextStart,
                  endTime: item.endTime,
                  status: "scheduled",
                }
              : item,
          ),
        }));
      },
      moveTaskToTomorrow: (id) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const date = tomorrow.toISOString().slice(0, 10);

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, date, status: "scheduled" } : task,
          ),
        }));
      },
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      addCustomTag: (name) => {
        const state = get();
        const result = validateCustomTagName(name, state.customTags);
        if (!result.ok) return null;

        const allTags = getAllTags(state.customTags);
        const hex = pickColorForNewTag(state.tagColors, [...allTags, result.value]);

        set({
          customTags: [...state.customTags, result.value],
          tagColors: { ...state.tagColors, [result.value]: hex },
        });
        return result.value;
      },
      renameCustomTag: (oldName, newName) => {
        const state = get();
        const result = validateCustomTagName(newName, state.customTags, oldName);
        if (!result.ok) return null;

        const nextTagColors = { ...state.tagColors };
        if (nextTagColors[oldName]) {
          nextTagColors[result.value] = nextTagColors[oldName];
          delete nextTagColors[oldName];
        }

        set({
          customTags: state.customTags.map((tag) =>
            tag === oldName ? result.value : tag,
          ),
          tasks: state.tasks.map((task) =>
            task.tag === oldName ? { ...task, tag: result.value } : task,
          ),
          tagColors: nextTagColors,
        });
        return result.value;
      },
      deleteCustomTag: (name) =>
        set((state) => {
          const nextTagColors = { ...state.tagColors };
          delete nextTagColors[name];
          return {
            customTags: state.customTags.filter((tag) => tag !== name),
            tagColors: nextTagColors,
          };
        }),
      setTagColor: (tag, hex) =>
        set((state) => ({
          tagColors: { ...state.tagColors, [tag]: hex },
        })),
      pushAlert: (alert) =>
        set((state) => ({
          alerts: [
            {
              ...alert,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.alerts,
          ].slice(0, 8),
        })),
      dismissAlert: (id) =>
        set((state) => ({
          alerts: state.alerts.filter((alert) => alert.id !== id),
        })),
      syncStatuses: () =>
        set((state) => {
          const next = refreshTaskStatuses(state.tasks);
          const changed = next.some(
            (task, index) => task.status !== state.tasks[index]?.status,
          );
          if (!changed) return state;
          return { tasks: next };
        }),
      seedDemo: () =>
        set({
          tasks: createSampleTasks(),
          customTags: ["학습"],
          tagColors: {
            ...DEFAULT_TAG_COLORS,
            학습: "#FFD966",
          },
          seeded: true,
        }),
    }),
    {
      name: "day-secretary-store",
      partialize: (state) => ({
        tasks: state.tasks,
        settings: state.settings,
        customTags: state.customTags,
        tagColors: migrateTagColors(state.tagColors),
        seeded: state.seeded,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<SecretaryStore> | undefined;
        return {
          ...current,
          ...saved,
          tagColors: migrateTagColors(saved?.tagColors ?? current.tagColors),
        };
      },
    },
  ),
);

export function useTodayTasks() {
  const tasks = useSecretaryStore((state) => state.tasks);
  const today = getTodayKey();
  return refreshTaskStatuses(tasks.filter((task) => task.date === today));
}

export function useAllTags() {
  const customTags = useSecretaryStore((state) => state.customTags);
  const tasks = useSecretaryStore((state) => state.tasks);

  return useMemo(() => {
    const known = new Set(getAllTags(customTags));
    const legacyTags = tasks
      .map((task) => task.tag)
      .filter((tag): tag is string => !!tag && !known.has(tag) && !DEFAULT_TAGS.includes(tag as (typeof DEFAULT_TAGS)[number]));

    return getAllTags([...customTags, ...legacyTags]);
  }, [customTags, tasks]);
}

export function useTagColorMap() {
  const tagColors = useSecretaryStore((state) => state.tagColors);
  return useMemo(() => migrateTagColors(tagColors), [tagColors]);
}

export function useTagColor(tag?: string): TagColor {
  const tagColors = useTagColorMap();
  return useMemo(() => resolveTagColor(tag, tagColors), [tag, tagColors]);
}
