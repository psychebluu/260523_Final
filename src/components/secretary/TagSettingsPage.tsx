"use client";

import { SettingsNav } from "@/components/secretary/SettingsNav";
import { TagManagerSection } from "@/components/secretary/TagManagerSection";

export function TagSettingsPage() {
  return (
    <>
      <SettingsNav />

      <div className="mb-8">
        <p className="jarvis-label">System Config</p>
        <h1 className="mt-2 text-3xl font-bold">태그 관리</h1>
        <p className="mt-2 text-muted-foreground">
          업무 분류 태그와 HUD 글로우 컬러를 설정합니다.
        </p>
      </div>

      <div className="max-w-3xl">
        <TagManagerSection />
      </div>
    </>
  );
}
