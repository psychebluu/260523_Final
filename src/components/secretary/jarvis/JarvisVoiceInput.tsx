"use client";

import { useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

type JarvisVoiceInputProps = {
  className?: string;
};

export function JarvisVoiceInput({ className }: JarvisVoiceInputProps) {
  const [listening, setListening] = useState(false);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => setListening((value) => !value)}
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
          listening
            ? "border-primary bg-primary/20 text-primary shadow-[0_0_24px_rgba(0,212,255,0.45)]"
            : "border-primary/30 bg-primary/5 text-primary/80 hover:border-primary/50 hover:bg-primary/10",
        )}
        aria-label={listening ? "음성 입력 중지" : "음성 입력 시작"}
        aria-pressed={listening}
      >
        <Mic className={cn("h-4 w-4", listening && "jarvis-mic-active")} />
        {listening && (
          <span className="jarvis-voice-pulse absolute inset-0 rounded-full border border-primary/60" />
        )}
      </button>

      <div className="min-w-0">
        <p className="jarvis-label text-[10px]">
          {listening ? "Listening..." : "Voice Command"}
        </p>
        {listening ? (
          <div className="mt-1.5 flex h-4 items-end gap-0.5">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <span
                key={index}
                className="jarvis-voice-bar w-0.5 rounded-full bg-primary"
                style={{ animationDelay: `${index * 0.12}s` }}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">마이크를 눌러 명령을 입력하세요</p>
        )}
      </div>
    </div>
  );
}
