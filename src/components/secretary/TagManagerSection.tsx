"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagColorPicker } from "@/components/secretary/TagColorPicker";
import { DEFAULT_TAGS } from "@/lib/secretary/constants";
import {
  getDefaultColorForTag,
  getPaletteColorName,
  normalizeTagColor,
  TAG_PALETTE,
} from "@/lib/secretary/tagPalette";
import { resolveTagColor } from "@/lib/secretary/tagColors";
import { useAllTags, useSecretaryStore, useTagColorMap } from "@/lib/secretary/taskStore";

function TagColorRow({
  tag,
  isDefault,
  editingTag,
  editValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditValueChange,
  onDelete,
}: {
  tag: string;
  isDefault: boolean;
  editingTag: string | null;
  editValue: string;
  onStartEdit: (tag: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditValueChange: (value: string) => void;
  onDelete?: (tag: string) => void;
}) {
  const tagColors = useTagColorMap();
  const setTagColor = useSecretaryStore((state) => state.setTagColor);
  const [expanded, setExpanded] = useState(false);

  const currentHex =
    normalizeTagColor(tagColors[tag]) ?? getDefaultColorForTag(tag);
  const colorName = getPaletteColorName(currentHex);
  const colors = resolveTagColor(tag, tagColors);
  const isEditing = !isDefault && editingTag === tag;

  return (
    <div className="jarvis-panel rounded-xl p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.border,
            color: colors.text,
          }}
        >
          {tag}
          {isDefault && (
            <span className="rounded bg-card/60 px-1 text-[10px]">기본</span>
          )}
        </span>

        <span className="text-xs text-muted-foreground">
          {colorName ?? "사용자 지정"} · {currentHex}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {!isDefault && !isEditing && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 rounded-lg"
                onClick={() => onStartEdit(tag)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-400"
                  onClick={() => onDelete(tag)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg text-xs"
            onClick={() => setExpanded((prev) => !prev)}
          >
            컬러
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {isEditing && (
        <div className="mt-3 flex gap-2">
          <Input
            value={editValue}
            onChange={(event) => onEditValueChange(event.target.value)}
            className="h-8 rounded-lg"
            autoFocus
          />
          <Button size="sm" className="h-8 rounded-lg" onClick={onSaveEdit}>
            저장
          </Button>
          <Button size="sm" variant="ghost" className="h-8 rounded-lg" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {expanded && (
        <div className="mt-3 border-t border-primary/10 pt-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            글로우 팔레트 또는 직접 선택
          </p>
          <TagColorPicker
            value={currentHex}
            onChange={(hex) => setTagColor(tag, hex)}
            compact
          />
        </div>
      )}
    </div>
  );
}

export function TagManagerSection() {
  const allTags = useAllTags();
  const customTags = useSecretaryStore((state) => state.customTags);
  const addCustomTag = useSecretaryStore((state) => state.addCustomTag);
  const renameCustomTag = useSecretaryStore((state) => state.renameCustomTag);
  const deleteCustomTag = useSecretaryStore((state) => state.deleteCustomTag);

  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleAdd = () => {
    const created = addCustomTag(newTag);
    if (!created) {
      setError("태그를 추가할 수 없어요. 중복되거나 기본 태그와 같을 수 있어요.");
      return;
    }
    setNewTag("");
    setError(null);
  };

  const saveEdit = () => {
    if (!editingTag) return;
    const renamed = renameCustomTag(editingTag, editValue);
    if (!renamed) {
      setError("태그 이름을 변경할 수 없어요.");
      return;
    }
    setEditingTag(null);
    setEditValue("");
    setError(null);
  };

  return (
    <section className="space-y-6">
      <div className="jarvis-panel p-6">
        <h2 className="text-lg font-semibold">글로우 컬러 팔레트</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          JARVIS HUD 톤의 네온 글로우 {TAG_PALETTE.length}색과 직접 색상 선택을 지원해요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {TAG_PALETTE.map((color) => (
            <span
              key={color.id}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-2 py-1 text-[11px] text-muted-foreground"
            >
              <span
                className="h-3 w-3 rounded-full border border-white/10"
                style={{
                  backgroundColor: color.hex,
                  boxShadow: `0 0 8px ${color.hex}`,
                }}
              />
              {color.name}
            </span>
          ))}
        </div>
      </div>

      <div className="jarvis-panel p-6">
        <h2 className="text-lg font-semibold">태그 목록</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          각 태그의 <strong>컬러</strong> 버튼으로 팔레트 또는 직접 선택이 가능합니다.
        </p>

        <div className="mt-5 space-y-3">
          {allTags.map((tag) => (
            <TagColorRow
              key={tag}
              tag={tag}
              isDefault={DEFAULT_TAGS.includes(tag as (typeof DEFAULT_TAGS)[number])}
              editingTag={editingTag}
              editValue={editValue}
              onStartEdit={(value) => {
                setEditingTag(value);
                setEditValue(value);
                setError(null);
              }}
              onSaveEdit={saveEdit}
              onCancelEdit={() => {
                setEditingTag(null);
                setEditValue("");
              }}
              onEditValueChange={setEditValue}
              onDelete={
                customTags.includes(tag) ? deleteCustomTag : undefined
              }
            />
          ))}
        </div>

        <div className="mt-5 flex gap-2">
          <Input
            value={newTag}
            onChange={(event) => {
              setNewTag(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            placeholder="새 태그 이름 (예: 학습, 외근)"
            className="rounded-xl"
          />
          <Button className="rounded-lg border border-primary/30 bg-primary/20 text-primary hover:bg-primary/30" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      </div>
    </section>
  );
}
