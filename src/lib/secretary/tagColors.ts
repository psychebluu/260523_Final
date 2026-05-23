import {
  getDefaultColorForTag,
  normalizeTagColor,
  TAG_PALETTE,
} from "@/lib/secretary/tagPalette";

export type TagColor = {
  bg: string;
  text: string;
  border: string;
  highlight: string;
  hex?: string;
};

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function brighten(value: number, amount = 30) {
  return Math.min(255, value + amount);
}

/** 다크 HUD 배경용 글로우 태그 색상 */
export function hexToTagColor(hex: string): TagColor {
  const normalized = normalizeTagColor(hex) ?? hex;
  const { r, g, b } = hexToRgb(normalized);

  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.12)`,
    text: `rgb(${brighten(r)}, ${brighten(g)}, ${brighten(b)})`,
    border: `rgba(${r}, ${g}, ${b}, 0.45)`,
    highlight: `rgba(${r}, ${g}, ${b}, 0.85)`,
    hex: normalized,
  };
}

const UNTAGGED_COLOR: TagColor = {
  bg: "rgba(0, 212, 255, 0.06)",
  text: "#6b8fa3",
  border: "rgba(0, 212, 255, 0.18)",
  highlight: "rgba(0, 212, 255, 0.5)",
};

export function resolveTagColor(
  tag?: string,
  tagColorOverrides: Record<string, string> = {},
): TagColor {
  if (!tag) {
    return UNTAGGED_COLOR;
  }

  const raw = tagColorOverrides[tag] ?? getDefaultColorForTag(tag);
  const hex = normalizeTagColor(raw);

  if (hex) {
    return hexToTagColor(hex);
  }

  let hash = 0;
  for (let i = 0; i < tag.length; i += 1) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const fallback = TAG_PALETTE[Math.abs(hash) % TAG_PALETTE.length];
  return hexToTagColor(fallback.hex);
}

/** @deprecated resolveTagColor 사용 */
export function getTagColor(tag?: string): TagColor {
  return resolveTagColor(tag);
}
