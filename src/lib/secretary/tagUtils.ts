import { DEFAULT_TAGS } from "@/lib/secretary/constants";

export function isDefaultTag(tag: string) {
  return DEFAULT_TAGS.includes(tag as (typeof DEFAULT_TAGS)[number]);
}

export function normalizeTagName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function getAllTags(customTags: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of [...DEFAULT_TAGS, ...customTags]) {
    const normalized = normalizeTagName(tag);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

export function validateCustomTagName(
  name: string,
  customTags: string[],
  editingTag?: string,
) {
  const normalized = normalizeTagName(name);

  if (!normalized) {
    return { ok: false as const, error: "태그 이름을 입력해 주세요." };
  }
  if (normalized.length > 20) {
    return { ok: false as const, error: "태그는 20자 이내로 입력해 주세요." };
  }
  if (isDefaultTag(normalized)) {
    return { ok: false as const, error: "기본 태그와 같은 이름은 사용할 수 없어요." };
  }
  if (
    customTags.some(
      (tag) => tag === normalized && tag !== editingTag,
    )
  ) {
    return { ok: false as const, error: "이미 존재하는 태그예요." };
  }

  return { ok: true as const, value: normalized };
}
