"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { DEFAULT_TAGS } from "@/lib/secretary/constants";
import { resolveTagColor } from "@/lib/secretary/tagColors";
import { isDefaultTag } from "@/lib/secretary/tagUtils";
import { useAllTags, useSecretaryStore, useTagColorMap } from "@/lib/secretary/taskStore";

type TagSelectorProps = {
  value: string;
  onChange: (tag: string) => void;
  allowCreate?: boolean;
};

export function TagSelector({ value, onChange, allowCreate = true }: TagSelectorProps) {
  const allTags = useAllTags();
  const tagColorMap = useTagColorMap();
  const addCustomTag = useSecretaryStore((state) => state.addCustomTag);
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    const created = addCustomTag(newTag);
    if (!created) {
      setError("태그를 추가할 수 없어요. 이름을 확인해 주세요.");
      return;
    }
    setError(null);
    setNewTag("");
    onChange(created);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allTags.map((tagName) => {
          const colors = resolveTagColor(tagName, tagColorMap);
          const active = value === tagName;
          return (
            <button
              key={tagName}
              type="button"
              onClick={() => onChange(tagName)}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition",
                !active && "hover:brightness-[0.98]",
              )}
              style={{
                backgroundColor: active ? colors.bg : "rgba(8, 16, 32, 0.6)",
                borderColor: active ? colors.border : "rgba(0, 212, 255, 0.14)",
                color: active ? colors.text : "#6b8fa3",
                boxShadow: active ? `inset 0 -2px 0 ${colors.highlight}` : "none",
              }}
            >
              {tagName}
              {isDefaultTag(tagName) && (
                <span className="text-[10px] opacity-60">기본</span>
              )}
            </button>
          );
        })}
      </div>

      {allowCreate && (
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(event) => {
              setNewTag(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="새 태그 추가"
            className="rounded-xl"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-primary/20 px-3 text-xs font-medium text-muted-foreground hover:border-primary/35 hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5" />
            추가
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-muted-foreground">
        기본 태그: {DEFAULT_TAGS.join(", ")}
      </p>
    </div>
  );
}
