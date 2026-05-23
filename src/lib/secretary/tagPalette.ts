export type PaletteColor = {
  id: string;
  name: string;
  hex: string;
};

/** JARVIS HUD 글로우 네온 팔레트 */
export const TAG_PALETTE: PaletteColor[] = [
  { id: "cyan-core", name: "시안 코어", hex: "#00D4FF" },
  { id: "electric-blue", name: "일렉트릭", hex: "#0099FF" },
  { id: "holo-teal", name: "홀로 틸", hex: "#00FFD4" },
  { id: "holo-purple", name: "홀로 퍼플", hex: "#A78BFA" },
  { id: "neon-magenta", name: "네온 마젠타", hex: "#FF44CC" },
  { id: "amber-glow", name: "앰버 글로우", hex: "#FFBB33" },
  { id: "red-alert", name: "레드 알림", hex: "#FF4466" },
  { id: "emerald-pulse", name: "에메랄드", hex: "#34D399" },
  { id: "violet-beam", name: "바이올렛", hex: "#8B5CF6" },
  { id: "ice-blue", name: "아이스 블루", hex: "#67E8F9" },
  { id: "deep-cyan", name: "딥 시안", hex: "#06B6D4" },
  { id: "coral-neon", name: "코랄 네온", hex: "#FF6688" },
  { id: "gold-glow", name: "골드 글로우", hex: "#FFD966" },
  { id: "lime-pulse", name: "라임 펄스", hex: "#A3E635" },
  { id: "silver-hud", name: "실버 HUD", hex: "#8BA4B8" },
  { id: "pink-holo", name: "핑크 홀로", hex: "#F472B6" },
];

export const PALETTE_BY_ID = Object.fromEntries(
  TAG_PALETTE.map((color) => [color.id, color]),
) as Record<string, PaletteColor>;

export const DEFAULT_TAG_COLORS: Record<string, string> = {
  업무: "#00D4FF",
  회의: "#A78BFA",
  개인: "#34D399",
  프로젝트: "#FFBB33",
  긴급: "#FF4466",
};

/** 이전 Pantone ID → 글로우 hex 마이그레이션 */
const LEGACY_COLOR_MAP: Record<string, string> = {
  "pantone-2016-rose-quartz": "#FF6688",
  "pantone-2016-serenity": "#00D4FF",
  "pantone-2017-greenery": "#34D399",
  "pantone-2018-ultra-violet": "#A78BFA",
  "pantone-2019-living-coral": "#FF6688",
  "pantone-2020-classic-blue": "#0099FF",
  "pantone-2021-ultimate-gray": "#8BA4B8",
  "pantone-2021-illuminating": "#FFD966",
  "pantone-2022-very-peri": "#8B5CF6",
  "pantone-2023-viva-magenta": "#FF44CC",
  "pantone-2024-peach-fuzz": "#FFBB33",
  "pantone-2025-mocha-mousse": "#FF6688",
};

/** 이전 파스텔 hex → 글로우 hex 마이그레이션 */
const PASTEL_TO_GLOW: Record<string, string> = {
  "#F7CAC9": "#FF6688",
  "#92A8D1": "#00D4FF",
  "#F4C2C2": "#FF6688",
  "#FFB7CE": "#F472B6",
  "#C9B8E0": "#A78BFA",
  "#B4C7E7": "#67E8F9",
  "#A8C8EC": "#0099FF",
  "#B8E0D2": "#34D399",
  "#C5D5C5": "#A3E635",
  "#FFDAB9": "#FFBB33",
  "#FFCCB6": "#FF6688",
  "#FFF0B3": "#FFD966",
  "#DDA0DD": "#FF44CC",
  "#D4A5C9": "#F472B6",
  "#E8B4B8": "#FF6688",
  "#D5D8DC": "#8BA4B8",
  "#F4A7A7": "#FF4466",
};

export function normalizeTagColor(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("#")) {
    const upper = value.toUpperCase();
    return PASTEL_TO_GLOW[upper] ?? upper;
  }
  if (LEGACY_COLOR_MAP[value]) return LEGACY_COLOR_MAP[value];
  if (PALETTE_BY_ID[value]) return PALETTE_BY_ID[value].hex;
  return value.startsWith("#") ? value : `#${value}`;
}

export function getDefaultColorForTag(tag: string) {
  return DEFAULT_TAG_COLORS[tag] ?? TAG_PALETTE[0].hex;
}

export function getPaletteColorName(hex: string) {
  const normalized = normalizeTagColor(hex)?.toUpperCase();
  const found = TAG_PALETTE.find(
    (color) => color.hex.toUpperCase() === normalized,
  );
  return found?.name;
}

export function pickColorForNewTag(
  existingTagColors: Record<string, string>,
  usedTagNames: string[],
) {
  const usedHexes = new Set(
    usedTagNames
      .map((tag) => normalizeTagColor(existingTagColors[tag] ?? DEFAULT_TAG_COLORS[tag]))
      .filter(Boolean),
  );

  const unused = TAG_PALETTE.find(
    (color) => !usedHexes.has(color.hex.toUpperCase()),
  );
  return unused?.hex ?? TAG_PALETTE[usedTagNames.length % TAG_PALETTE.length].hex;
}

export function migrateTagColors(tagColors: Record<string, string>) {
  const migrated: Record<string, string> = {};
  for (const [tag, value] of Object.entries(tagColors)) {
    migrated[tag] = normalizeTagColor(value) ?? value;
  }
  return migrated;
}
