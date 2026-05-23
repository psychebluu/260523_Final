import { cn } from "@/lib/utils";

type JarvisHudFrameProps = {
  children: React.ReactNode;
  className?: string;
};

export function JarvisHudFrame({ children, className }: JarvisHudFrameProps) {
  return (
    <div className={cn("relative", className)}>
      <span className="jarvis-hud-corner jarvis-hud-corner-tl" aria-hidden />
      <span className="jarvis-hud-corner jarvis-hud-corner-tr" aria-hidden />
      <span className="jarvis-hud-corner jarvis-hud-corner-bl" aria-hidden />
      <span className="jarvis-hud-corner jarvis-hud-corner-br" aria-hidden />
      {children}
    </div>
  );
}
