import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { isMacOS } from "../lib/platform";

const IS_MACOS = isMacOS();

const TOUR_STEPS = [
  {
    target: '[data-tour="prompt-field"]',
    title: "Capture anything",
    body: "Type a thought, task, or reminder. Times like \"tomorrow at 5pm\" are parsed automatically.",
    placement: "top" as const,
  },
  {
    target: '[data-tour="lanes"]',
    title: "Focus or Distraction",
    body: "Stay on-task with Focus, or park interruptions — Distraction sends to Parking Lot.",
    placement: "bottom" as const,
  },
  {
    target: '[data-tour="tags"]',
    title: "Tag by context",
    body: "Mark captures as Work, Personal, or Idea so history stays easy to scan.",
    placement: "bottom" as const,
  },
  {
    target: '[data-tour="list"]',
    title: "Organize with lists",
    body: "Choose Inbox or a saved list. Bookmark a new list name to reuse it later.",
    placement: "top" as const,
  },
  {
    target: '[data-tour="destinations"]',
    title: "Send anywhere",
    body: "Toggle where this capture should sync — Slack, Notion, Google, and more.",
    placement: "top" as const,
  },
  {
    target: '[data-tour="history"]',
    title: "Browse history",
    body: "Review, edit, and re-sync past captures anytime from here.",
    placement: "bottom" as const,
  },
  {
    target: '[data-tour="shortcuts"]',
    title: "You're ready",
    body: null as string | null,
    placement: "top" as const,
  },
];

interface CaptureProductTourProps {
  onComplete: () => void;
}

interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function resolvePlacement(
  anchor: AnchorRect,
  preferred: "top" | "bottom",
  tooltipHeight: number,
): "top" | "bottom" {
  const margin = 14;
  const spaceBelow = window.innerHeight - (anchor.top + anchor.height) - margin;
  const spaceAbove = anchor.top - margin;
  const needed = tooltipHeight + 8;

  if (preferred === "bottom" && spaceBelow < needed && spaceAbove >= needed) {
    return "top";
  }
  if (preferred === "top" && spaceAbove < needed && spaceBelow >= needed) {
    return "bottom";
  }
  return preferred;
}

function computeTooltipPosition(
  anchor: AnchorRect,
  preferred: "top" | "bottom",
  tooltipWidth: number,
  tooltipHeight: number,
) {
  const margin = 14;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  // Huge targets (e.g. full prompt shell): float the card in the middle.
  if (anchor.height > viewportH * 0.42) {
    return {
      top: Math.max(margin, (viewportH - tooltipHeight) / 2),
      left: Math.max(margin, (viewportW - tooltipWidth) / 2),
      placement: "center" as const,
    };
  }

  const placement = resolvePlacement(anchor, preferred, tooltipHeight);

  let top =
    placement === "bottom"
      ? anchor.top + anchor.height + margin
      : anchor.top - tooltipHeight - margin;

  let left = anchor.left + anchor.width / 2 - tooltipWidth / 2;
  left = Math.max(margin, Math.min(left, viewportW - tooltipWidth - margin));

  if (top + tooltipHeight > viewportH - margin) {
    top = viewportH - tooltipHeight - margin;
  }
  if (top < margin) {
    top = margin;
  }

  return { top, left, placement };
}

export default function CaptureProductTour({ onComplete }: CaptureProductTourProps) {
  const hotkey = useAppStore((state) => state.hotkey);
  const [stepIndex, setStepIndex] = useState(0);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 260, height: 160 });

  const step = TOUR_STEPS[stepIndex];
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const body =
    stepIndex === TOUR_STEPS.length - 1
      ? `Press ${hotkey || (IS_MACOS ? "⌘⇧Space" : "Ctrl+Shift+Space")} from anywhere to open capture. Enter saves — Esc dismisses.`
      : step.body;

  const measureTooltip = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || anchor === null) {
        return;
      }
      const { width, height } = node.getBoundingClientRect();
      setTooltipSize({ width, height });
    },
    [anchor],
  );

  useLayoutEffect(() => {
    const element = document.querySelector(step.target) as HTMLElement | null;
    if (!element) {
      const clearId = requestAnimationFrame(() => setAnchor(null));
      return () => cancelAnimationFrame(clearId);
    }

    element.setAttribute("data-tour-active", "true");

    function updateAnchor() {
      const rect = element!.getBoundingClientRect();
      setAnchor({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }

    updateAnchor();
    window.addEventListener("resize", updateAnchor);
    return () => {
      element.removeAttribute("data-tour-active");
      window.removeEventListener("resize", updateAnchor);
    };
  }, [step.target, stepIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onComplete();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onComplete]);

  const tooltipPos =
    anchor !== null
      ? computeTooltipPosition(anchor, step.placement, tooltipSize.width, tooltipSize.height)
      : {
          top: window.innerHeight / 2 - tooltipSize.height / 2,
          left: window.innerWidth / 2 - tooltipSize.width / 2,
          placement: "center" as const,
        };

  return (
    <div className="capture-tour-root" role="dialog" aria-modal="true" aria-label="Capture tour">
      <div className="capture-tour-backdrop" aria-hidden />

      {anchor && tooltipPos.placement !== "center" ? (
        <div
          className="capture-tour-spotlight"
          style={{
            top: anchor.top - 4,
            left: anchor.left - 4,
            width: anchor.width + 8,
            height: anchor.height + 8,
          }}
          aria-hidden
        />
      ) : null}

      <div
        ref={measureTooltip}
        className={[
          "capture-tour-tooltip codex-surface",
          tooltipPos.placement === "top"
            ? "capture-tour-tooltip-above"
            : tooltipPos.placement === "bottom"
              ? "capture-tour-tooltip-below"
              : "capture-tour-tooltip-center",
        ].join(" ")}
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
            Tip {stepIndex + 1} of {TOUR_STEPS.length}
          </span>
          <div className="flex gap-1">
            {TOUR_STEPS.map((_, index) => (
              <span
                key={index}
                className={[
                  "h-1 w-3 rounded-full transition",
                  index === stepIndex ? "bg-[var(--accent)]" : "bg-[var(--border)]",
                ].join(" ")}
              />
            ))}
          </div>
        </div>
        <h3 className="text-sm font-semibold tracking-tight">{step.title}</h3>
        <p className="codex-muted mt-1.5 text-xs leading-5">{body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onComplete}
            className="codex-muted text-xs underline-offset-2 hover:underline"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={() => {
              if (isLast) {
                onComplete();
                return;
              }
              setStepIndex((value) => value + 1);
            }}
            className="codex-btn rounded-lg px-3 py-1.5 text-xs font-semibold"
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
