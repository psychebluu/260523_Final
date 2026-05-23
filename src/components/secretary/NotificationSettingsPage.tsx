"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsNav } from "@/components/secretary/SettingsNav";
import { useSecretaryStore } from "@/lib/secretary/taskStore";

export function NotificationSettingsPage() {
  const settings = useSecretaryStore((state) => state.settings);
  const updateSettings = useSecretaryStore((state) => state.updateSettings);
  const pushAlert = useSecretaryStore((state) => state.pushAlert);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    updateSettings({ pushEnabled: result === "granted" });
    if (result === "granted") {
      pushAlert({
        taskId: "settings",
        title: "브라우저 알림 허용",
        message: "이제 브라우저 알림도 받을 수 있어요",
        type: "before",
      });
    }
  };

  return (
    <>
      <SettingsNav />

      <div className="mb-8">
        <p className="jarvis-label">System Config</p>
        <h1 className="mt-2 text-3xl font-bold">알림 설정</h1>
        <p className="mt-2 text-muted-foreground">
          에이전트가 미완료 일정을 리마인드하는 방식을 설정합니다.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <section className="jarvis-panel p-6">
          <h2 className="text-lg font-semibold">기본 리마인드</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="before">시작 전 알림</Label>
              <Input
                id="before"
                type="number"
                min={0}
                value={settings.defaultRemindBefore}
                onChange={(e) =>
                  updateSettings({ defaultRemindBefore: Number(e.target.value) })
                }
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daily">하루 마감 시간</Label>
              <Input
                id="daily"
                type="time"
                value={settings.dailyReviewTime}
                onChange={(e) => updateSettings({ dailyReviewTime: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </section>

        <section className="jarvis-panel p-6">
          <h2 className="text-lg font-semibold">방해 금지</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">시작</Label>
              <Input
                id="quiet-start"
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-end">종료</Label>
              <Input
                id="quiet-end"
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </section>

        <section className="jarvis-panel p-6">
          <h2 className="text-lg font-semibold">브라우저 알림</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            웹 프로토타입에서는 브라우저 알림 권한을 허용하면 OS 알림도 함께 테스트할 수
            있습니다.
          </p>
          <Button
            className="mt-4 rounded-lg border border-primary/30 bg-primary/20 text-primary hover:bg-primary/30"
            onClick={requestNotificationPermission}
          >
            브라우저 알림 허용
          </Button>
        </section>
      </div>
    </>
  );
}
