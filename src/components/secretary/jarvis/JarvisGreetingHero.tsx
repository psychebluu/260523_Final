"use client";

import { JarvisTypingText } from "@/components/secretary/jarvis/JarvisTypingText";

type JarvisGreetingHeroProps = {
  greeting: string;
  taskCount: number;
  dateLabel: string;
};

export function JarvisGreetingHero({
  greeting,
  taskCount,
  dateLabel,
}: JarvisGreetingHeroProps) {
  return (
    <div className="relative max-w-2xl pl-4 md:pl-5">
      <span
        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary shadow-[0_0_16px_rgba(0,212,255,0.55)]"
        aria-hidden
      />

      <div className="relative">
        <p className="text-3xl font-light leading-tight tracking-wide text-primary drop-shadow-[0_0_24px_rgba(0,212,255,0.35)] md:text-4xl lg:text-[2.75rem]">
          <JarvisTypingText text={greeting} speed={36} />
        </p>

        <p className="mt-3 text-base text-foreground/90 md:text-lg">
          오늘 처리하실 업무는{" "}
          <span className="inline-block min-w-[1ch] font-semibold tabular-nums text-primary drop-shadow-[0_0_12px_rgba(0,212,255,0.35)]">
            {taskCount}
          </span>
          건입니다.
        </p>

        <div className="mt-4 h-px w-full max-w-md bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />

        <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">{dateLabel}</h1>
      </div>
    </div>
  );
}
