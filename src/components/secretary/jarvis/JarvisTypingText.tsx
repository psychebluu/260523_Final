"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type JarvisTypingTextProps = {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
};

export function JarvisTypingText({
  text,
  speed = 28,
  className,
  onComplete,
}: JarvisTypingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setDisplayed(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(timer);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [text, speed, onComplete]);

  return (
    <span className={cn("inline", className)}>
      {displayed}
      {!done && <span className="jarvis-cursor ml-0.5 text-primary">▍</span>}
    </span>
  );
}
