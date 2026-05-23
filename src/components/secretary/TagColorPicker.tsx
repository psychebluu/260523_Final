"use client";

import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getPaletteColorName, normalizeTagColor, TAG_PALETTE } from "@/lib/secretary/tagPalette";
import { hexToTagColor } from "@/lib/secretary/tagColors";

type TagColorPickerProps = {
  value: string;
  onChange: (hex: string) => void;
  compact?: boolean;
};

export function TagColorPicker({
  value,
  onChange,
  compact = false,
}: TagColorPickerProps) {
  const currentHex = normalizeTagColor(value) ?? TAG_PALETTE[0].hex;
  const paletteName = getPaletteColorName(currentHex);
  const preview = hexToTagColor(currentHex);

  return (
    <div className="space-y-3">
      <div
        className="flex items-center gap-3 rounded-xl border px-3 py-2"
        style={{
          backgroundColor: preview.bg,
          borderColor: preview.border,
          boxShadow: `0 0 16px ${preview.highlight}`,
        }}
      >
        <span
          className="h-8 w-8 shrink-0 rounded-lg border border-white/10"
          style={{
            backgroundColor: currentHex,
            boxShadow: `0 0 12px ${currentHex}`,
          }}
        />
        <div className="min-w-0 text-xs">
          <p className="font-medium" style={{ color: preview.text }}>
            {paletteName ?? "사용자 지정"}
          </p>
          <p className="text-muted-foreground">{currentHex}</p>
        </div>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
          직접 선택
          <Input
            type="color"
            value={currentHex}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            className="h-9 w-12 cursor-pointer rounded-lg border-border p-1"
          />
        </label>
      </div>

      <div
        className={cn(
          "grid gap-2",
          compact ? "grid-cols-6 sm:grid-cols-8" : "grid-cols-4 sm:grid-cols-8",
        )}
      >
        {TAG_PALETTE.map((color) => {
          const active = currentHex.toUpperCase() === color.hex.toUpperCase();
          return (
            <button
              key={color.id}
              type="button"
              title={color.name}
              onClick={() => onChange(color.hex)}
              className={cn(
                "group relative flex flex-col items-center gap-1 rounded-xl border p-1.5 transition",
                active
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-border hover:border-primary/35",
              )}
            >
              <span
                className="relative h-8 w-full rounded-lg border border-white/10"
                style={{
                  backgroundColor: color.hex,
                  boxShadow: active
                    ? `0 0 14px ${color.hex}`
                    : `0 0 6px ${color.hex}66`,
                }}
              >
                {active && (
                  <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/25">
                    <Check className="h-4 w-4 text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]" strokeWidth={3} />
                  </span>
                )}
              </span>
              {!compact && (
                <span className="w-full truncate text-center text-[10px] leading-tight text-muted-foreground">
                  {color.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
