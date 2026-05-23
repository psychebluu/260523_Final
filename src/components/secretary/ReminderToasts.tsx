"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Radio, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSecretaryStore } from "@/lib/secretary/taskStore";

export function ReminderToasts() {
  const alerts = useSecretaryStore((state) => state.alerts);
  const dismissAlert = useSecretaryStore((state) => state.dismissAlert);
  const completeTask = useSecretaryStore((state) => state.completeTask);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {alerts.slice(0, 3).map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-auto jarvis-panel-glow border-primary/25 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
                <Radio className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="jarvis-label text-[10px] text-primary/60">Agent Alert</p>
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                {alert.taskId !== "daily" && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 rounded-lg border border-primary/30 bg-primary/20 text-primary hover:bg-primary/30"
                      onClick={() => {
                        completeTask(alert.taskId);
                        dismissAlert(alert.id);
                      }}
                    >
                      완료
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 rounded-lg border-primary/20 bg-transparent hover:bg-primary/5"
                      onClick={() => dismissAlert(alert.id)}
                    >
                      닫기
                    </Button>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => dismissAlert(alert.id)}
                aria-label="알림 닫기"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
