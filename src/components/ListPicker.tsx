import { useEffect, useRef, useState, type ReactNode } from "react";

interface ListPickerProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onSave: () => void;
  folderIcon: ReactNode;
  bookmarkIcon: ReactNode;
}

export default function ListPicker({
  value,
  options,
  onChange,
  onSave,
  folderIcon,
  bookmarkIcon,
}: ListPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const uniqueOptions = Array.from(new Set(options));

  return (
    <div className="list-picker" ref={rootRef}>
      <span className="text-[var(--muted)]">{folderIcon}</span>
      <button
        type="button"
        className="list-picker-trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{value}</span>
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden className="list-picker-chevron">
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => void onSave()}
        className="icon-btn h-6 w-6"
        title="Save this list"
        aria-label="Save list"
      >
        {bookmarkIcon}
      </button>

      {open ? (
        <div className="list-picker-menu" role="listbox" aria-label="Choose list">
          {uniqueOptions.map((name) => {
            const active = name.toLowerCase() === value.trim().toLowerCase();
            return (
              <button
                key={name}
                type="button"
                role="option"
                aria-selected={active}
                className={["list-picker-option", active ? "list-picker-option-active" : ""].join(" ")}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
              >
                <span className="truncate">{name}</span>
                {active ? (
                  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                    <path
                      d="M5 13l4 4L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
