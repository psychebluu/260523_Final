import { cn } from "@/lib/utils";

type JarvisArcReactorProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE_MAP = {
  sm: "h-12 w-12",
  md: "h-20 w-20",
  lg: "h-28 w-28",
} as const;

export function JarvisArcReactor({ size = "md", className }: JarvisArcReactorProps) {
  return (
    <div
      className={cn("relative flex items-center justify-center", SIZE_MAP[size], className)}
      aria-hidden
    >
      <div className="jarvis-arc-orbit jarvis-arc-orbit-a absolute inset-0 rounded-full border border-dashed border-primary/25" />
      <div className="jarvis-arc-orbit jarvis-arc-orbit-b absolute inset-[12%] rounded-full border border-primary/20" />
      <div className="jarvis-arc-orbit jarvis-arc-orbit-c absolute inset-[24%] rounded-full border border-primary/35" />
      <div className="jarvis-arc-core absolute inset-[36%] rounded-full bg-primary/25 shadow-[0_0_18px_rgba(0,212,255,0.55)]" />
      <div className="absolute inset-[42%] rounded-full bg-primary/80 shadow-[0_0_12px_rgba(0,212,255,0.9)]" />
    </div>
  );
}
