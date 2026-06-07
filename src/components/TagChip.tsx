import type { CaptureTag } from "../types";

interface TagChipProps {
  tag: CaptureTag;
  active: boolean;
  onSelect: (tag: CaptureTag) => void;
}

const LABEL: Record<CaptureTag, string> = {
  work: "Work",
  personal: "Personal",
  idea: "Idea",
  untagged: "Untagged",
};

const ACTIVE_CLASS: Record<CaptureTag, string> = {
  work: "codex-chip-active",
  personal: "codex-chip-active",
  idea: "codex-chip-active",
  untagged: "codex-chip-active",
};

export default function TagChip({ tag, active, onSelect }: TagChipProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tag)}
      className={`rounded-full border px-3 py-1.5 text-[13px] leading-none transition ${
        active
          ? ACTIVE_CLASS[tag]
          : "codex-chip"
      }`}
    >
      {LABEL[tag]}
    </button>
  );
}
